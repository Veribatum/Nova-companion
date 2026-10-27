import * as THREE from 'https://esm.sh/three@0.170.0';
// Nova Mk II: a fully procedural, self-animated character.
// There are no FBX/GLB files, imported rigs, retargeted bones, or animation CDNs.
const mat=(c,r=.67,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const skin=mat('#dda183'), blush=mat('#ce877b'), shade=mat('#b8745f');
const hair=mat('#9b3525',.62),hairBright=mat('#d65c32',.6),hairDark=mat('#61231e');
const suit=mat('#25202b',.49,.13),suitTrim=mat('#a93e4e',.44,.26),gold=mat('#bda074',.3,.65);
const eye=mat('#f5e9dc',.27),iris=mat('#5ba785',.25),pupil=mat('#1c2422',.2),lip=mat('#a75058');
function sphere(p,m,x,y,z,sx,sy,sz){const o=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o}
function joint(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g}
function segment(p,m,a,b,r1,r2){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from);
 const o=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),12),m);o.position.copy(from.clone().add(to).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());p.add(o);return o}
export function makeNovaRebuilt(){
 const root=new THREE.Group(),body=joint(root,0,0,0);
 // Proportions designed around a grounded ~3m figure, boots at y=0.
 const pelvis=joint(body,0,1.35,0);
 sphere(pelvis,suit,0,.06,0,.44,.30,.27);
 sphere(body,suit,0,1.68,0,.33,.48,.245); // fitted waist
 sphere(body,skin,0,2.02,0,.44,.33,.25);
 sphere(body,suit,0,2.05,-.025,.42,.29,.24);
 // Tailored cropped flight jacket, neckline and bust, no boxy torso artifacts.
 for(const sign of [-1,1]){
  sphere(body,skin,sign*.205,2.11,.195,.235,.23,.235);
  sphere(body,suit,sign*.22,2.19,-.015,.29,.30,.20);
  const lapel=sphere(body,suitTrim,sign*.12,2.31,.205,.09,.27,.035);lapel.rotation.z=sign*.32;
 }
 sphere(body,skin,0,2.44,.025,.14,.16,.14);
 sphere(body,gold,0,1.55,.252,.14,.045,.045);
 const legs=[],arms=[];
 for(const sign of [-1,1]){
  const hip=joint(pelvis,sign*.26,-.13,0);
  sphere(hip,skin,0,-.30,0,.235,.44,.235);
  const knee=joint(hip,0,-.76,0);
  sphere(knee,skin,0,.02,0,.19,.20,.195);
  sphere(knee,skin,0,-.34,0,.17,.39,.18);
  sphere(knee,suit,0,-.59,.04,.185,.31,.19);
  sphere(knee,suit,0,-.78,.15,.19,.12,.32);
  sphere(hip,gold,0,-.08,.19,.23,.06,.065);
  legs.push({hip,knee,sign});
  const shoulder=joint(body,sign*.45,2.32,0);
  sphere(shoulder,suit,sign*.045,-.08,0,.205,.24,.21);
  sphere(shoulder,skin,sign*.04,-.38,0,.15,.36,.15);
  const elbow=joint(shoulder,sign*.06,-.65,0);
  sphere(elbow,skin,0,-.20,0,.125,.27,.13);
  sphere(elbow,suit,0,-.39,0,.135,.19,.14);
  sphere(elbow,skin,0,-.59,.015,.115,.14,.09);
  arms.push({shoulder,elbow,sign});
 }
 const neck=joint(body,0,2.51,.025),head=joint(neck,0,.08,0);
 sphere(head,skin,0,.18,.035,.35,.45,.33);
 sphere(head,blush,-.25,.08,.306,.075,.038,.028);
 sphere(head,blush,.25,.08,.306,.075,.038,.028);
 sphere(head,shade,0,.085,.358,.075,.12,.077);
 sphere(head,lip,0,-.082,.331,.13,.033,.028);
 sphere(head,lip,0,-.135,.29,.08,.02,.015);
 for(const sign of [-1,1]){
   sphere(head,eye,sign*.145,.215,.334,.099,.073,.043);
   sphere(head,iris,sign*.145,.21,.375,.047,.059,.017);
   sphere(head,pupil,sign*.145,.21,.389,.024,.045,.011);
   sphere(head,eye,sign*.132,.23,.4,.012,.014,.009);
   const brow=sphere(head,hairDark,sign*.15,.345,.337,.135,.027,.028);brow.rotation.z=sign*.12;
 }
 // Thick side-parted copper hair, layered locks and face-framing strands.
 sphere(head,hairDark,0,.48,-.045,.395,.38,.33);
 sphere(head,hair,0,.57,-.02,.40,.28,.34);
 for(let i=0;i<13;i++){
  const a=i/13*Math.PI*2, x=Math.sin(a)*.32,z=Math.cos(a)*.22-.08;
  const lock=sphere(head,i%3===0?hairBright:hair,x,.44,z,.10,.30,.12);
  lock.rotation.z=-x*.46;
 }
 for(let i=0;i<7;i++){
  const x=-.31+i*.085;
  const lock=sphere(head,i%2?hair:hairBright,x,.54,.20,.09,.17,.12);
  lock.rotation.z=.55;
 }
 const strands=[];
 for(const sign of [-1,1])for(let i=0;i<4;i++){
  const g=joint(head,sign*(.29+i*.025),.39,-.07-i*.035);
  sphere(g,i%2?hair:hairBright,0,-.37,0,.085,.47,.10);
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
