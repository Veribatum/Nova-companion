import * as THREE from 'https://esm.sh/three@0.170.0';
const S=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const skin=S('#e5a17f'), skinShade=S('#c98570'), hair=S('#ac3c25'), hairLight=S('#e97838'), armor=S('#191b28',.38,.18), armor2=S('#38303b',.48,.14), red=S('#a83b40',.42,.2), silver=S('#a9a8b2',.3,.75),green=S('#6eaa7c',.18),white=S('#fff0df'),dark=S('#291d26'),lip=S('#a7575a'),black=S('#121521');
function ell(parent,mat,pos,scale,seg=20){const m=new THREE.Mesh(new THREE.SphereGeometry(1,seg,14),mat);m.position.set(...pos);m.scale.set(...scale);parent.add(m);return m}
function box(parent,mat,pos,scale){const m=new THREE.Mesh(new THREE.BoxGeometry(...scale),mat);m.position.set(...pos);parent.add(m);return m}
function cylinder(parent,mat,a,b,r1,r2){let v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),d=v2.clone().sub(v1);const m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),12),mat);m.position.copy(v1.add(v2).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(m);return m}
function makeNova(){const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 // Tactical boots and armor legs
 for(const sign of [-1,1]){ell(body,armor,[sign*.28,.72,0],[.22,.63,.23]);ell(body,red,[sign*.28,.8,.17],[.21,.23,.075]);ell(body,black,[sign*.28,.2,.12],[.21,.28,.28]);ell(body,armor2,[sign*.28,.11,.3],[.22,.13,.38]);cylinder(body,silver,[sign*.28,.5,.22],[sign*.28,.59,.22],.22,.22)}
 ell(body,armor,[0,1.7,0],[.49,.71,.29]);ell(body,armor2,[0,1.52,.09],[.43,.38,.29]);ell(body,red,[-.25,1.72,.245],[.19,.35,.07]);ell(body,red,[.25,1.72,.245],[.19,.35,.07]);ell(body,armor,[0,2.02,.02],[.48,.38,.29]);ell(body,skin,[0,2.23,.05],[.19,.26,.18]);ell(body,armor2,[0,1.29,.27],[.5,.12,.1]);box(body,silver,[0,1.29,.365],[.17,.12,.05]);ell(body,silver,[0,1.72,.355],[.05,.07,.025]);
 const arms=[];for(const sign of [-1,1]){const a=new THREE.Group();a.position.set(sign*.48,2.14,0);body.add(a);ell(a,armor2,[sign*.08,-.1,0],[.25,.26,.27]);cylinder(a,skin,[sign*.12,-.25,0],[sign*.23,-.76,.07],.16,.13);ell(a,armor,[sign*.23,-.76,.075],[.17,.27,.18]);ell(a,skin,[sign*.25,-1.05,.1],[.12,.16,.13]);ell(a,red,[sign*.2,-.43,.2],[.12,.045,.05]);arms.push(a)}
 // Neck/head/face
 const head=new THREE.Group();head.position.set(0,2.42,.035);body.add(head);
 ell(head,hair,[0,.27,-.08],[.43,.6,.35]);ell(head,skin,[0,.22,.16],[.355,.49,.31]);ell(head,skin,[-.35,.16,.13],[.068,.115,.085]);ell(head,skin,[.35,.16,.13],[.068,.115,.085]);ell(head,skinShade,[0,.05,.46],[.068,.12,.07]);
 for(const sign of [-1,1]){ell(head,white,[sign*.155,.27,.426],[.102,.06,.033]);ell(head,green,[sign*.155,.27,.454],[.046,.048,.022]);ell(head,dark,[sign*.155,.27,.472],[.021,.045,.01]);ell(head,white,[sign*.141,.288,.488],[.01,.012,.007]);const brow=ell(head,hair,[sign*.16,.375,.409],[.14,.026,.03]);brow.rotation.z=sign*.12;ell(head,skinShade,[sign*.228,.03,.414],[.065,.025,.016]);}
 ell(head,lip,[0,-.08,.432],[.143,.029,.02]);ell(head,skinShade,[0,-.14,.426],[.09,.012,.01]);
 // freckles
 for(let i=0;i<24;i++){let x=(((i*37)%29)/29-.5)*.48,y=.1+((i*19)%13)/13*.14;ell(head,skinShade,[x,y,.432-Math.abs(x)*.105],[.009,.009,.009],8)}
 // Layered red hair and swept fringe
 for(let i=0;i<15;i++){let ang=i/15*Math.PI*2;ell(head,i%3?hair:hairLight,[Math.sin(ang)*.32,.56+Math.cos(ang)*.08,-.03+Math.cos(ang)*.21],[.11,.27,.12]);}
 for(let i=0;i<8;i++){let x=(i-3.5)*.085;const strand=ell(head,i%2?hairLight:hair,[x,.58-(i%3)*.038,.28],[.095,.19,.105]);strand.rotation.z=.42;}
 for(const sign of [-1,1]){for(let i=0;i<5;i++){let x=sign*(.30+i*.029);const strand=ell(head,i%2?hairLight:hair,[x,-.12-i*.095,-.12],[.085,.45,.12]);strand.rotation.z=sign*.11}}
 const badge=box(body,silver,[.23,1.98,.292],[.14,.12,.015]);badge.rotation.z=-.12;
 return {root,body,head,arms}
}
export function mountNova3D(el){if(!el)return ()=>{};let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){el.dataset.error='WebGL unavailable';return ()=>{}}renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(0,2.15,9.9);camera.lookAt(0,1.72,0);
scene.add(new THREE.HemisphereLight('#e1d3ff','#302130',2.05));let key=new THREE.DirectionalLight('#ffd3b3',3.1);key.position.set(-2,6,5);scene.add(key);let rim=new THREE.DirectionalLight('#aa65be',2.1);rim.position.set(3,4,-3);scene.add(rim);
const {root,body,head,arms}=makeNova();scene.add(root);
let rot=0,dragging=false,startX=0,oldRot=0;const down=e=>{dragging=true;startX=e.clientX;oldRot=rot;el.setPointerCapture?.(e.pointerId)};const move=e=>{if(dragging)rot=oldRot+(e.clientX-startX)*.008};const up=()=>{dragging=false};el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
const resize=()=>{const w=el.clientWidth||320,h=el.clientHeight||400;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();let observer=new ResizeObserver(resize);observer.observe(el);
let raf,alive=true;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,clock=new THREE.Clock();function tick(){if(!alive)return;raf=requestAnimationFrame(tick);if(!document.hidden){const t=clock.getElapsedTime();root.rotation.y=rot+(dragging?0:Math.sin(t*.24)*.07);body.position.y=reduce?0:Math.sin(t*1.6)*.018;head.rotation.z=reduce?0:Math.sin(t*.67)*.035;arms[0].rotation.z=reduce?0:Math.sin(t*.75)*.035;arms[1].rotation.z=reduce?0:-Math.sin(t*.75)*.035;renderer.render(scene,camera)}}tick();
return ()=>{alive=false;cancelAnimationFrame(raf);observer.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});renderer.dispose();renderer.domElement.remove()}}
