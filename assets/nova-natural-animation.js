import * as THREE from 'https://esm.sh/three@0.170.0';
import {GLTFLoader} from 'https://esm.sh/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';
import {retargetClip} from 'https://esm.sh/three@0.170.0/examples/jsm/utils/SkeletonUtils.js';
// Three.js example Soldier: Mixamo humanoid and freely redistributable idle/walk clips.
// Use source animations, not arbitrary joint angles on Nova's shoulders and elbows.
const SOURCE='https://threejs.org/examples/models/gltf/Soldier.glb';
export async function attachNaturalAnimations(nova){
 const target=nova.root;
 let targetMesh=null;target.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton?.bones?.length&&!targetMesh)targetMesh=o});
 if(!targetMesh)throw Error('Nova has no skinned skeleton');
 const gltf=await new GLTFLoader().loadAsync(SOURCE);
 let sourceMesh=null;gltf.scene.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton?.bones?.length&&!sourceMesh)sourceMesh=o});
 if(!sourceMesh)throw Error('Animation source has no skeleton');
 const names={};
 const targetBones=targetMesh.skeleton.bones,sourceBones=sourceMesh.skeleton.bones;
 const normalized=n=>n.replace(/^.*[:|]/,'').replace(/^mixamorig[_:]?/i,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
 const sources=new Map(sourceBones.map(b=>[normalized(b.name),b.name]));
 for(const bone of targetBones){const name=sources.get(normalized(bone.name));if(name)names[bone.name]=name}
 if(Object.keys(names).length<12)throw Error('Animation rig is not compatible');
 // Retargeted clips bind to .bones[name]; the mixer root MUST be the skinned mesh.
 const mixer=new THREE.AnimationMixer(targetMesh);
 const actions={};let count=0;
 for(const clip of gltf.animations){
  if(!/^(idle|walk|run)$/i.test(clip.name))continue;
  try{
   const retargeted=retargetClip(targetMesh,sourceMesh,clip,{names,hip:sourceBones.find(b=>/hips$/i.test(b.name))?.name||'mixamorigHips',preserveBonePositions:true,useFirstFramePosition:true,hipInfluence:new THREE.Vector3(0,0,0),fps:24});
   // Never let imported source hip translations move Nova outside the cabin.
   retargeted.tracks=retargeted.tracks.filter(t=>!t.name.endsWith('.position'));
   retargeted.name=clip.name.toLowerCase();
   if(retargeted.tracks.length<12)continue;
   const act=mixer.clipAction(retargeted);act.enabled=true;act.setEffectiveWeight(0);act.play();actions[retargeted.name]=act;count++;
  }catch(e){console.warn('Nova animation clip skipped',clip.name,e)}
 }
 if(!actions.idle||!actions.walk)throw Error('Could not retarget idle and walk');
 let state=null;
 function update(mode,dt){
  const next=mode==='walk'?'walk':'idle';
  if(next!==state){state=next}
  const frame=Math.min(dt,.06);
  for(const [name,act] of Object.entries(actions)){
   act.enabled=true;act.paused=false;act.setEffectiveTimeScale(1);
   const target=name===state?1:0,weight=act.getEffectiveWeight();
   act.setEffectiveWeight(THREE.MathUtils.lerp(weight,target,Math.min(1,frame*4.0)));
  }
  mixer.update(frame);
 }
 return {update,clips:Object.keys(actions),dispose(){mixer.stopAllAction();mixer.uncacheRoot(targetMesh)}};
}
