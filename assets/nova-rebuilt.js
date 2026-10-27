import * as THREE from 'https://esm.sh/three@0.170.0';
// Nova Mk II: a fully procedural, self-animated character.
// There are no FBX/GLB files, imported rigs, retargeted bones, or animation CDNs.
const mat=(c,r=.67,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const skin=mat('#dda183'), blush=mat('#ce877b'), shade=mat('#b8745f');
const hair=mat('#9b3525',.62),hairBright=mat('#d65c32',.6),hairDark=mat('#61231e');
const suit=mat('#25202b',.49,.13),suitTrim=mat('#a93e4e',.44,.26),gold=mat('#bda074',.3,.65);
const eye=mat('#f5e9dc',.27),iris=mat('#5ba785',.25),pupil=mat('#1c2422',.2),lip=mat('#a75058');
function sphere(p,m,x,y,z,sx,sy,sz){const o=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o}
function tapered(p,m,x,y,z,top,bottom,height,depth=1){
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,24,1),m);
 mesh.position.set(x,y,z);mesh.scale.z=depth;p.add(mesh);return mesh;
}
// Smooth elliptical tapered anatomy, with curved silhouette and no visible ball joints.
function organic(p,m,x,y,z,levels,radial=24){
 const verts=[],indices=[];
 for(let i=0;i<levels.length;i++){
  const [dy,rx,rz]=levels[i];
  for(let j=0;j<=radial;j++){
   const a=j/radial*Math.PI*2;
   verts.push(Math.cos(a)*rx,dy,Math.sin(a)*rz);
  }
 }
 for(let i=0;i<levels.length-1;i++)for(let j=0;j<radial;j++){
  const a=i*(radial+1)+j,b=a+radial+1;
  indices.push(a,b,a+1,b,b+1,a+1);
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
 g.setIndex(indices);g.computeVertexNormals();
 const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);p.add(mesh);return mesh;
}
function joint(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g}
function segment(p,m,a,b,r1,r2){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from);
 const o=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),12),m);o.position.copy(from.clone().add(to).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());p.add(o);return o}
export function makeNovaRebuilt(){
 const root=new THREE.Group(),body=joint(root,0,0,0);
 // Proportions designed around a grounded ~3m figure, boots at y=0.
 const pelvis=joint(body,0,1.35,0);
 organic(pelvis,suit,0,0,0,[[-.23,.20,.16],[-.15,.36,.25],[0,.43,.28],[.15,.35,.245],[.26,.27,.21]]);
 tapered(body,suit,0,1.72,0,.31,.27,.64,.87); // smooth fitted waist
 tapered(body,skin,0,2.14,0,.41,.28,.39,.72);
 tapered(body,suit,0,2.29,-.09,.43,.37,.24,.55);
 // Tailored cropped flight jacket, neckline and bust, no boxy torso artifacts.
 for(const sign of [-1,1]){
  sphere(body,skin,sign*.19,2.09,.16,.205,.185,.19);
  tapered(body,suit,sign*.24,2.27,-.08,.19,.24,.28,.85);
  const lapel=sphere(body,suitTrim,sign*.12,2.31,.205,.09,.27,.035);lapel.rotation.z=sign*.32;
 }
 sphere(body,skin,0,2.44,.025,.14,.16,.14);
 sphere(body,gold,0,1.55,.252,.14,.045,.045);
 const legs=[],arms=[];
 for(const sign of [-1,1]){
  const hip=joint(pelvis,sign*.26,-.13,0);
  tapered(hip,skin,0,-.27,0,.195,.15,.44,.85);
  const knee=joint(hip,0,-.45,0);
  organic(knee,skin,0,0,0,[[-.17,.115,.13],[-.04,.145,.15],[.11,.15,.15],[.19,.10,.11]]);
  tapered(knee,skin,0,-.33,0,.145,.105,.48,.9);
  tapered(knee,suit,0,-.60,.025,.14,.135,.28,.95);
  sphere(knee,suit,0,-.78,.15,.19,.12,.32);
  sphere(hip,gold,0,-.08,.19,.23,.06,.065);
  legs.push({hip,knee,sign});
  const shoulder=joint(body,sign*.45,2.32,0);
  organic(shoulder,suit,sign*.045,0,0,[[-.24,.12,.14],[-.17,.15,.16],[0,.175,.18],[.12,.10,.11]]);
  tapered(shoulder,skin,sign*.04,-.38,0,.135,.112,.44,.95);
  const elbow=joint(shoulder,sign*.06,-.65,0);
  tapered(elbow,skin,0,-.21,0,.112,.085,.35,.9);
  sphere(elbow,suit,0,-.39,0,.135,.19,.14);
  sphere(elbow,skin,0,-.59,.015,.115,.14,.09);
  arms.push({shoulder,elbow,sign});
 }
 const neck=joint(body,0,2.51,.025),head=joint(neck,0,.08,0);
 // Sculpted face: forehead, temples, cheeks, tapered jaw and chin form
 // one continuous surface instead of multiple disconnected primitives.
 organic(head,skin,0,0,.005,[
  [-.235,.055,.09],[-.19,.16,.19],[-.10,.235,.245],
  [.025,.285,.285],[.16,.31,.305],[.31,.295,.28],
  [.43,.245,.235],[.53,.105,.12]
 ]);
 // Subtle anatomy instead of protruding button nose and cartoon eyes.
 sphere(head,shade,0,.085,.285,.038,.078,.027);
 sphere(head,skin,0,.032,.300,.060,.035,.048);
 const upper=sphere(head,lip,0,-.086,.255,.105,.019,.012);
 const lower=sphere(head,lip,0,-.111,.255,.093,.016,.012);
 for(const sign of [-1,1]){
  sphere(head,blush,sign*.205,.015,.234,.07,.027,.018);
  sphere(head,eye,sign*.128,.191,.279,.082,.034,.012);
  sphere(head,iris,sign*.128,.19,.29,.029,.030,.008);
  sphere(head,pupil,sign*.128,.19,.297,.016,.021,.007);
  sphere(head,eye,sign*.12,.202,.304,.007,.008,.004);
  const lash=sphere(head,hairDark,sign*.128,.228,.282,.084,.009,.012);
  lash.rotation.z=sign*.045;
  const brow=sphere(head,hairDark,sign*.14,.296,.271,.097,.016,.012);
  brow.rotation.z=sign*.095;
 }
 // Thick side-parted copper hair, layered locks and face-framing strands.
 sphere(head,hairDark,0,.47,-.08,.32,.25,.29);
 sphere(head,hair,0,.54,-.045,.34,.20,.30);
 for(let i=0;i<13;i++){
  const a=i/13*Math.PI*2, x=Math.sin(a)*.32,z=Math.cos(a)*.22-.08;
  const lock=sphere(head,i%3===0?hairBright:hair,x,.43,z,.07,.22,.075);
  lock.rotation.z=-x*.46;
 }
 for(let i=0;i<7;i++){
  const x=-.31+i*.085;
  const lock=sphere(head,i%2?hair:hairBright,x,.52,.19,.064,.12,.08);
  lock.rotation.z=.55;
 }
 const strands=[];
 for(const sign of [-1,1])for(let i=0;i<4;i++){
  const g=joint(head,sign*(.29+i*.025),.39,-.07-i*.035);
  sphere(g,i%2?hair:hairBright,0,-.32,0,.068,.40,.075);
  strands.push({g,sign,i});
 }
 // Character animation is deterministic and applied to articulated groups.
 let gesture='none',gestureTime=0;
 function action(name){if(['wave','talk','flirt','lounge'].includes(name)){gesture=name;gestureTime=0}}
 function update({t,dt,moving,talking=false,mode='idle',reduced=false}){
  gestureTime+=dt;
  if(gestureTime>2.8)gesture='none';
  const gait=moving?Math.sin(t*7.2):0,walk=moving?1:0;
  body.position.y=reduced?0:Math.sin(t*1.8)*.014+walk*Math.abs(Math.sin(t*7.2))*.038;
  body.rotation.y=Math.sin(t*.45)*.016;
  body.rotation.z=walk*Math.sin(t*7.2)*.016;
  pelvis.rotation.y=walk*Math.sin(t*7.2)*.09;
  legs.forEach(({hip,knee,sign})=>{
   const phase=gait*sign;
   hip.rotation.x=phase*.43;
   knee.rotation.x=Math.max(0,-phase)*.60;
   hip.rotation.z=sign*.025;
  });
  arms.forEach(({shoulder,elbow,sign})=>{
   let sx=-sign*gait*.36, ex=-.12, sz=sign*.07;
   if(gesture==='wave'&&sign===1){sx=-.2;sz=-1.28;ex=-.85+Math.sin(t*9)*.25}
   if((gesture==='talk'||talking)&&sign===1){sx=-.35+Math.sin(t*5)*.15;sz=-.28;ex=-.55}
   if(gesture==='flirt'){sx=sign===1?-.35:.1;sz=sign===1?-.25:sign*.1;ex=sign===1?-.7:-.2}
   shoulder.rotation.x=THREE.MathUtils.damp(shoulder.rotation.x,sx,8,dt);
   shoulder.rotation.z=THREE.MathUtils.damp(shoulder.rotation.z,sz,8,dt);
   elbow.rotation.x=THREE.MathUtils.damp(elbow.rotation.x,ex,8,dt);
  });
  neck.rotation.y=Math.sin(t*.38)*.065;
  head.rotation.z=Math.sin(t*.62)*.035+(gesture==='flirt'?.09:0);
  head.rotation.x=Math.sin(t*.48)*.027+(talking?.025*Math.sin(t*10):0);
  for(const {g,sign,i} of strands)g.rotation.z=Math.sin(t*1.2+i)*.033*sign;
 }
 update({t:0,dt:.016,moving:false});
 return {root,body,head,arms:arms.map(a=>a.shoulder),update,action};
}
