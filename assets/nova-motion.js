import * as THREE from 'https://esm.sh/three@0.170.0';
// Retain the authored Mixamo body pose. Never force arm, hand, hip or leg joint
// angles in generic XYZ axes: their local axes differ across exported FBX rigs.
// Earlier generic rotations sent Nova's forearms behind her back.
export function createNovaMotion(model){
 const names=['Spine','Spine1','Spine2','Neck','Head'];
 const bones={};
 model.traverse(o=>{
  if(!o.isBone)return;
  const name=o.name.replace(/^.*[:|]/,'').replace(/^mixamorig[_:]?/i,'');
  if(names.includes(name))bones[name]={bone:o,base:o.quaternion.clone()};
 });
 const rotation=new THREE.Quaternion(),euler=new THREE.Euler();
 function move(name,x,y,z,dt){
  const info=bones[name];if(!info)return;
  euler.set(x,y,z,'XYZ');
  rotation.setFromEuler(euler).premultiply(info.base);
  info.bone.quaternion.slerp(rotation,Math.min(1,dt*2.3));
 }
 return {update(mode,elapsed,dt,walking){
  if(walking)return;
  const breathe=Math.sin(elapsed*1.45);
  move('Spine',breathe*.004,0,0,dt);
  move('Spine1',breathe*.007,0,0,dt);
  move('Spine2',breathe*.006,0,0,dt);
  move('Neck',0,Math.sin(elapsed*.36)*.009,0,dt);
  move('Head',Math.sin(elapsed*.49)*.008,Math.sin(elapsed*.33)*.015,0,dt);
  // Gestures need calibrated animation clips. Don't invent arm rotations.
 }};
}
