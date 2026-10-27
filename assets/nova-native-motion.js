import * as THREE from 'https://esm.sh/three@0.170.0';

// The bundled character has exactly one animation: running.
// Derive a quiet resting pose from its OWN joint tracks rather than importing
// incompatible skeleton rotations from another character.
export function createNativeMotion(rig) {
  const source=rig.run?.getClip();
  if (!source || !rig.mixer) return {update(){},dispose(){},clips:[]};
  const idleTracks=[];
  const samples=32, q=new THREE.Quaternion(), sum=new THREE.Quaternion();
  for (const track of source.tracks) {
    if (!track.name.endsWith('.quaternion')) continue;
    const interp=track.createInterpolant();
    let ax=0,ay=0,az=0,aw=0;
    let reference=null;
    for(let i=0;i<samples;i++){
      const v=interp.evaluate(source.duration*(i+.5)/samples);
      q.set(v[0],v[1],v[2],v[3]).normalize();
      if(!reference)reference=q.clone();
      const sign=reference.dot(q)<0?-1:1;
      ax+=q.x*sign;ay+=q.y*sign;az+=q.z*sign;aw+=q.w*sign;
    }
    sum.set(ax,ay,az,aw).normalize();
    idleTracks.push(new THREE.QuaternionKeyframeTrack(track.name,[0,1],[
      sum.x,sum.y,sum.z,sum.w,sum.x,sum.y,sum.z,sum.w
    ]));
  }
  if(!idleTracks.length)return {update(moving,dt){
    if(moving){if(!rig.run.isRunning())rig.run.reset().play();rig.run.setEffectiveTimeScale(.5);}
    else rig.run.stop();
    rig.mixer.update(dt);
  },dispose(){rig.mixer.stopAllAction()},clips:['native run']};
  const idleClip=new THREE.AnimationClip('Nova Relaxed Idle',1,idleTracks);
  const idle=rig.mixer.clipAction(idleClip);
  const run=rig.run;
  run.stop();
  idle.setLoop(THREE.LoopRepeat,Infinity);
  idle.reset().setEffectiveWeight(1).play();
  let current='idle';
  // Native running keys remain on the native skeleton. No external retargeting.
  function update(moving,dt){
    const next=moving?'walk':'idle';
    if(next!==current){
      if(next==='walk'){
        run.reset().setEffectiveTimeScale(.48).setEffectiveWeight(1).play();
        run.crossFadeFrom(idle,.35,true);
      }else{
        idle.reset().setEffectiveWeight(1).play();
        idle.crossFadeFrom(run,.38,true);
      }
      current=next;
    }
    rig.mixer.update(Math.min(dt,.06));
  }
  return {update,clips:['derived idle','native movement'],dispose(){
    rig.mixer.stopAllAction();
    rig.mixer.uncacheClip(idleClip);
  }};
}
