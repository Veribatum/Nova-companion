import * as THREE from 'https://esm.sh/three@0.170.0';
// Lightweight procedural Mixamo posing layered over the original skinned mesh.
// No deformation of the source FBX, and no assumption of facial blendshapes.
const keys=['Hips','Spine','Spine1','Spine2','Neck','Head','LeftShoulder','RightShoulder','LeftArm','RightArm','LeftForeArm','RightForeArm','LeftUpLeg','RightUpLeg','LeftLeg','RightLeg'];
const angle=(axis,r)=>new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis),r);
export function createNovaMotion(model){
 const bones={};model.traverse(o=>{if(!o.isBone)return;const name=o.name.replace(/^.*[:|]/,'').replace(/^mixamorig[_:]?/i,'');if(keys.includes(name))bones[name]={bone:o,base:o.quaternion.clone()}});
 let previous='idle',blend=0;
 function apply(name,rx=0,ry=0,rz=0,dt=.016){
  const item=bones[name];if(!item)return;
  const goal=item.base.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz,'XYZ')));
  item.bone.quaternion.slerp(goal,Math.min(1,dt*6));
 }
 function update(mode,elapsed,dt,walking=false){
  const state=walking?'walk':mode||'idle';
  if(state!==previous){previous=state;blend=0}else blend=Math.min(1,blend+dt*2);
  if(walking)return; // animation mixer controls the walking skeleton
  const breath=Math.sin(elapsed*1.8),look=Math.sin(elapsed*.53),gesture=Math.sin(elapsed*2.8);
  // Relax upper arms from T-pose and animate subtle breathing / glances.
  apply('Hips',0,0,0,dt);
  apply('Spine',breath*.009,0,0,dt);
  apply('Spine1',breath*.015,look*.015,0,dt);
  apply('Spine2',breath*.012,look*.02,0,dt);
  apply('Neck',-.025,look*.025,0,dt);
  apply('Head',.01+Math.sin(elapsed*.68)*.025,look*.055,Math.sin(elapsed*.83)*.018,dt);
  apply('LeftUpLeg',0,0,0,dt);apply('RightUpLeg',0,0,0,dt);
  apply('LeftLeg',0,0,0,dt);apply('RightLeg',0,0,0,dt);
  const flirty=state==='flirt'||state==='closeup';
  const lounge=state==='lounge';
  const wave=state==='wave';
  // Mixamo left/right arms point outwards in bind pose. Rotation brings them to the sides.
  apply('LeftArm',lounge?-.24:flirty?-.28:wave?-.05:0,0,lounge?-.5:flirty?-.25:wave?.3:-.95,dt);
  apply('RightArm',lounge?-.24:flirty?-.28:wave?-.35:0,0,lounge?.5:flirty?.25:wave?1.65:.95,dt);
  apply('LeftShoulder',0,0,flirty?-.18:0,dt);
  apply('RightShoulder',0,0,flirty?.18:0,dt);
  apply('LeftForeArm',flirty?-.35:0,flirty?-.55:0,flirty?-.75:lounge?-.3:0,dt);
  apply('RightForeArm',flirty?-.35:wave?-.2:0,flirty?.55:0,flirty?.75:lounge?.3:wave?gesture*.27:0,dt);
  if(lounge){
   apply('Hips',-.15,0,0,dt);
   apply('Spine',-.22,0,0,dt);
   apply('LeftUpLeg',-.85,0,0,dt);apply('RightUpLeg',-.85,0,0,dt);
   apply('LeftLeg',1.15,0,0,dt);apply('RightLeg',1.15,0,0,dt);
  }
 }
 return {update};
}
