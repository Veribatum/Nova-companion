import * as THREE from 'https://esm.sh/three@0.170.0';

// Every pose below is sampled from the character's own FBX clip. We never
// retarget a different skeleton or rotate joints in guessed local axes.
export function createNativeMotion(rig){
 const clip=rig.run?.getClip(),mixer=rig.mixer,root=rig.root;
 if(!clip||!mixer)return {update(){},dispose(){},clips:[]};
 const run=rig.run;
 const bones=[];
 root.traverse(o=>{if(o.isBone)bones.push(o)});
 const left=bones.find(b=>/(leftfoot|leftankle)$/i.test(b.name));
 const right=bones.find(b=>/(rightfoot|rightankle)$/i.test(b.name));
 // Find the most grounded frame in the supplied run cycle instead of
 // freezing whichever airborne running frame the FBX exported in.
 run.reset().play();run.setEffectiveWeight(1);
 const candidates=[];
 const n=64;
 for(let i=0;i<n;i++){
  mixer.setTime((i+.5)/n*clip.duration);
  root.updateMatrixWorld(true);
  const ly=left?.getWorldPosition(new THREE.Vector3()).y;
  const ry=right?.getWorldPosition(new THREE.Vector3()).y;
  if(ly!==undefined&&ry!==undefined)candidates.push({t:(i+.5)/n*clip.duration,ly,ry});
 }
 let neutralTime=clip.duration*.5;
 if(candidates.length){
  const minY=Math.min(...candidates.flatMap(c=>[c.ly,c.ry]));
  candidates.sort((a,b)=>
   (Math.abs(a.ly-b.ly)*3+Math.abs(Math.min(a.ly,b.ly)-minY))-
   (Math.abs(b.ly-b.ry)*3+Math.abs(Math.min(b.ly,b.ry)-minY)));
  neutralTime=candidates[0].t;
 }
 mixer.setTime(neutralTime);
 const tracks=[];
 for(const track of clip.tracks){
  if(!track.name.endsWith('.quaternion'))continue;
  const val=track.createInterpolant().evaluate(neutralTime);
  if(val.length!==4)continue;
  tracks.push(new THREE.QuaternionKeyframeTrack(track.name,[0,1],
   [val[0],val[1],val[2],val[3],val[0],val[1],val[2],val[3]]));
 }
 mixer.stopAllAction();
 if(!tracks.length)return {update(){},dispose(){},clips:[]};
 const idleClip=new THREE.AnimationClip('Nova Grounded Idle',1,tracks);
 const idle=mixer.clipAction(idleClip);
 idle.reset().setEffectiveWeight(1).play();
 let state='idle';
 function update(moving,dt){
  const next=moving?'move':'idle';
  if(next!==state){
   if(moving){
    run.reset().setEffectiveTimeScale(.55).setEffectiveWeight(1).play();
    run.crossFadeFrom(idle,.28,true);
   }else{
    idle.reset().setEffectiveWeight(1).play();
    idle.crossFadeFrom(run,.34,true);
   }
   state=next;
  }
  mixer.update(Math.min(.05,Math.max(0,dt)));
 }
 return {update,clips:['ground-contact idle','native walk cycle'],dispose(){
  mixer.stopAllAction();mixer.uncacheClip(idleClip);
 }};
}
