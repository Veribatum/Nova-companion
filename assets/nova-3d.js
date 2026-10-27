import * as THREE from 'https://esm.sh/three@0.170.0';
const S=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const skin=S('#e5a17f'), skinShade=S('#c98570'), hair=S('#ac3c25'), hairLight=S('#e97838'), armor=S('#191b28',.38,.18), armor2=S('#38303b',.48,.14), red=S('#a83b40',.42,.2), silver=S('#a9a8b2',.3,.75),green=S('#6eaa7c',.18),white=S('#fff0df'),dark=S('#291d26'),lip=S('#a7575a'),black=S('#121521');
function ell(parent,mat,pos,scale,seg=20){const m=new THREE.Mesh(new THREE.SphereGeometry(1,seg,14),mat);m.position.set(...pos);m.scale.set(...scale);parent.add(m);return m}
function box(parent,mat,pos,scale){const m=new THREE.Mesh(new THREE.BoxGeometry(...scale),mat);m.position.set(...pos);parent.add(m);return m}
function cylinder(parent,mat,a,b,r1,r2){let v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),d=v2.clone().sub(v1);const m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),12),mat);m.position.copy(v1.add(v2).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(m);return m}
function makeNova(){const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 // Tactical boots and armor legs
 for(const sign of [-1,1]){ell(body,armor,[sign*.28,.72,0],[.22,.63,.23]);ell(body,red,[sign*.28,.8,.17],[.21,.23,.075]);ell(body,black,[sign*.28,.2,.12],[.21,.28,.28]);ell(body,armor2,[sign*.28,.11,.3],[.22,.13,.38]);cylinder(body,silver,[sign*.28,.5,.22],[sign*.28,.59,.22],.22,.22)}
 ell(body,armor,[0,1.7,0],[.49,.71,.29]);ell(body,armor2,[0,1.52,.09],[.43,.38,.29]);// Prominent sculpted bust, fitted armor cups and red seam detailing.
 for(const sign of [-1,1]){
   ell(body,armor2,[sign*.235,1.87,.235],[.285,.295,.34],32);
   ell(body,red,[sign*.236,1.82,.535],[.235,.205,.075],28);
   const trim=ell(body,silver,[sign*.236,1.67,.44],[.225,.025,.08],24);trim.rotation.z=sign*.15;
   ell(body,black,[sign*.232,1.99,.485],[.24,.028,.068],24);
 }
 ell(body,skin,[0,2.135,.22],[.115,.12,.075],24);
ell(body,armor,[0,2.02,.02],[.48,.38,.29]);ell(body,skin,[0,2.23,.05],[.19,.26,.18]);ell(body,armor2,[0,1.29,.27],[.5,.12,.1]);box(body,silver,[0,1.29,.365],[.17,.12,.05]);ell(body,silver,[0,1.72,.355],[.05,.07,.025]);
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
export function mountNova3D(el){
 if(!el)return {destroy(){},action(){}};
 let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});}catch(e){el.textContent='3D unavailable on this device';return {destroy(){},action(){}}}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor('#100f20');renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);

 const scene=new THREE.Scene();scene.background=new THREE.Color('#0b101c');scene.fog=new THREE.Fog('#11101a',13,26);
 const camera=new THREE.PerspectiveCamera(53,1,.1,70);camera.position.set(0,3.6,9.8);camera.lookAt(0,1.85,-1.7);
 scene.add(new THREE.HemisphereLight('#e2bba3','#261c29',1.65));
 const light=new THREE.PointLight('#ffb36a',45,11);light.position.set(-2,4.3,1);scene.add(light);
 const ambient=new THREE.PointLight('#648bc5',20,11);ambient.position.set(-4,3,-4);scene.add(ambient);
 const deskLamp=new THREE.PointLight('#ffba72',19,5);deskLamp.position.set(3,2,-3.5);scene.add(deskLamp);
 const floorMat=S('#292727',.8,.16),wallMat=S('#211b1b',.75,.23),trim=S('#6b5550',.38,.52),
  brass=S('#b08353',.38,.75),sofa=S('#272128',.96),redFabric=S('#4a1528',.95),
  wood=S('#49382c',.75),darkPanel=S('#141821',.35,.26),screen=new THREE.MeshBasicMaterial({color:'#28465b'}),
  screen2=new THREE.MeshBasicMaterial({color:'#86b4c4'}),glow=new THREE.MeshBasicMaterial({color:'#ffbd77'}),
  starMat=new THREE.MeshBasicMaterial({color:'#e3ebfd'}),glass=new THREE.MeshBasicMaterial({color:'#07101e'});
 const panel=(parent,mat,x,y,z,w,h,d)=>box(parent,mat,[x,y,z],[w,h,d]);
 // Industrial steel cabin and grated floor.
 panel(scene,floorMat,0,-.15,-1,10,.3,11);
 panel(scene,wallMat,0,2.5,-6.02,10,5,.28);
 panel(scene,wallMat,-4.92,2.5,-1,.2,5,10);
 panel(scene,wallMat,4.92,2.5,-1,.2,5,10);
 panel(scene,wallMat,0,4.98,-1,10,.18,10);
 for(let i=-4;i<=4;i+=1){panel(scene,trim,i,-.005,-.7,.035,.015,10);panel(scene,trim,i,4.87,-.7,.09,.16,10)}
 for(let i=-5;i<=3;i+=1.25){panel(scene,brass,0,.008,i,10,.01,.02)}
 for(const x of [-4.55,4.55]){for(const z of [-5,-2,1,4]){panel(scene,trim,x,3.6,z,.15,2.7,.16);panel(scene,glow,x*.985,4.55,z,.035,.04,.9)}}
 for(let i=0;i<5;i++){panel(scene,glow,-3.4+i*1.7,4.72,-3.7,.83,.045,.18)}
 // Observation glass looking over a blue planet and starfield.
 panel(scene,brass,-2.8,2.75,-5.78,3.95,3.45,.16);
 panel(scene,glass,-2.8,2.75,-5.65,3.65,3.17,.11);
 const planet=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),new THREE.MeshStandardMaterial({color:'#376c95',emissive:'#143958',emissiveIntensity:.28,roughness:.8}));
 planet.scale.set(2.5,2.5,.33);planet.position.set(-3.1,.75,-5.51);scene.add(planet);
 const clouds=S('#9cc3c8',.85);
 for(let i=0;i<18;i++){const x=-4.25+((i*43)%89)/89*3.1,y=.88+((i*23)%67)/67*.78;panel(scene,clouds,x,y,-5.1,.38,.025,.02)}
 for(let i=0;i<80;i++){const x=-4.46+((i*31)%101)/101*3.28,y=1.4+((i*47)%97)/97*2.7;ell(scene,starMat,[x,y,-5.5],[.008+(i%4)*.009,.008+(i%4)*.009,.007],7)}
 panel(scene,brass,-2.8,2.75,-5.44,.085,3.2,.1);
 // Left-side lounge: cushions, throws, low reclaimed-wood table.
 panel(scene,sofa,-3.26,.52,.3,2.95,.67,2);
 panel(scene,sofa,-4.38,1.03,.3,.46,1.3,2.1);
 panel(scene,sofa,-3.25,.52,1.26,2.7,.65,.35);
 for(let i=0;i<3;i++)panel(scene,i===1?redFabric:sofa,-4.01+i*.75,.93,.4,.57,.51,.6);
 panel(scene,redFabric,-3.25,.88,1.08,2.7,.045,.6);
 panel(scene,wood,-1.78,.51,.9,1.48,.17,1);
 for(const x of [-2.37,-1.18])for(const z of [.55,1.22])panel(scene,trim,x,.23,z,.14,.4,.14);
 // Bottles and glasses on a lit bar.
 panel(scene,wood,.7,.88,-4.35,2.12,.15,.74);
 panel(scene,trim,.7,.48,-4.4,2.05,.85,.55);
 for(let shelf=0;shelf<3;shelf++){panel(scene,wood,.75,1.45+shelf*.65,-5.75,2.32,.08,.38);panel(scene,glow,.75,1.41+shelf*.65,-5.55,2.15,.025,.05);
  for(let k=0;k<6;k++){const x=-.2+k*.33;const h=.22+(k%3)*.075;const bottle=new THREE.Mesh(new THREE.CylinderGeometry(.055,.083,h,9),k%3?brass:green);bottle.position.set(x,1.54+shelf*.65+h/2,-5.52);scene.add(bottle);}}
 // Captain's berth with dark-red bedding and warm reading lights.
 panel(scene,trim,3.07,.78,-4.65,2.95,.54,2.17);
 panel(scene,sofa,3.07,1.06,-4.7,2.67,.2,1.96);
 panel(scene,redFabric,3.07,1.15,-4.37,2.54,.14,1.2);
 panel(scene,wood,3.07,1.55,-5.77,3.05,1.25,.18);
 for(const x of [2.36,3.65])panel(scene,sofa,x,1.19,-5.35,.85,.22,.49);
 for(const x of [1.72,4.42]){panel(scene,brass,x,1.8,-5.67,.18,.16,.12);panel(scene,glow,x,1.8,-5.55,.11,.09,.08)}
 // Rug and crate-table with a mug and bottle.
 panel(scene,redFabric,.32,.017,1.5,3.15,.015,2.2);
 panel(scene,wood,.1,.52,1.5,1.63,.74,.94);
 panel(scene,brass,.1,.92,1.5,1.65,.06,.97);
 const mug=new THREE.Mesh(new THREE.CylinderGeometry(.12,.11,.2,12),darkPanel);mug.position.set(-.37,1.07,1.4);scene.add(mug);
 const bottle=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,.42,12),brass);bottle.position.set(.5,1.25,1.3);scene.add(bottle);
 // Workstation and equipment racks on the far right.
 panel(scene,darkPanel,4.42,.98,-1,1.13,.14,2.5);
 panel(scene,darkPanel,4.62,1.87,-1.6,.12,1.12,1.4);
 panel(scene,screen,4.51,2,-1.6,.09,.9,1.22);
 for(let i=0;i<6;i++)panel(scene,screen2,4.46,1.68+i*.11,-1.6+i%2*.24,.015,.03,.24);
 for(let i=0;i<3;i++){panel(scene,trim,4.64,.35+i*.68,-4.2,.5,.1,1.12);panel(scene,darkPanel,4.65,.52+i*.68,-4.2,.56,.26,.98)}
 // A subtle ship insignia, rendered as a luminous red compass.
 const insignia=new THREE.Group();insignia.position.set(3.05,3.25,-5.75);scene.add(insignia);
 for(let i=0;i<4;i++){const ray=panel(insignia,red,0,0,0,.09,.75,.03);ray.rotation.z=i*Math.PI/4}
 const emblem=new THREE.Mesh(new THREE.TorusGeometry(.21,.035,8,24),red);insignia.add(emblem);
 const nova=makeNova();const {root,body,head,arms}=nova;scene.add(root);root.position.set(-1.15,0,.2);let rig=null,riggedRoot=null,rigMotion=null,disposed=false,focusMode='normal',focusedUntil=0,sceneTime=0;
 import('./nova-rig-loader.js').then(async m=>{const loaded=await m.loadNovaRig();if(disposed)return;if(!loaded){el.dispatchEvent(new CustomEvent('nova-rig-missing'));return}rig=loaded;riggedRoot=loaded.root;import('./nova-motion.js').then(m=>{if(!disposed)rigMotion=m.createNovaMotion(riggedRoot)}).catch(e=>console.warn('Rig motion unavailable',e));riggedRoot.position.x=root.position.x;riggedRoot.position.z=root.position.z;riggedRoot.rotation.y=Math.PI;scene.add(riggedRoot);root.visible=false;el.dispatchEvent(new CustomEvent('nova-rig-ready',{detail:{animations:loaded.animations}}))}).catch(e=>console.warn('No rigged Nova loaded:',e.message));

 let mode='idle',target=root.position.clone(),phase=0,talk=false,spin=0;
 const destinations={window:new THREE.Vector3(-1.6,0,-2.9),console:new THREE.Vector3(3.15,0,-1.25),chair:new THREE.Vector3(2.4,0,-2.4),center:new THREE.Vector3(-.5,0,.8)};
 const action=(name)=>{if(name==='flirt'||name==='closeup'){target=destinations.center.clone();mode='walk';focusMode='closeup';focusedUntil=performance.now()+10500;return}if(name==='lounge'){target=new THREE.Vector3(-2.7,0,.55);mode='walk';focusMode='lounge';focusedUntil=performance.now()+13000;return}if(name==='talk'){talk=true;mode='talk';setTimeout(()=>{if(!disposed)talk=false},2500);return}if(name==='wave'){mode='wave';phase=0;return}if(name==='turn'){spin+=Math.PI*.75;return}if(destinations[name]){target=destinations[name].clone();mode='walk';return}mode='idle'};
 const resize=()=>{if(disposed)return;const w=el.clientWidth||320,h=el.clientHeight||400;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();const observer=new ResizeObserver(resize);observer.observe(el);
 const clock=new THREE.Clock(),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches,down=e=>{el._downX=e.clientX},up=e=>{if(typeof el._downX==='number'&&Math.abs(e.clientX-el._downX)>25)spin+=(e.clientX-el._downX)*.008;el._downX=null};el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);
 let raf;function tick(){if(disposed)return;raf=requestAnimationFrame(tick);if(document.hidden)return;const dt=Math.min(clock.getDelta(),.08);phase+=dt;const t=clock.elapsedTime;sceneTime=t;const delta=target.clone().sub(root.position),moving=mode==='walk'&&delta.length()>.08;
 if(rig){
  if(rig.run){if(moving){rig.run.paused=false;rig.run.enabled=true;rig.run.setEffectiveWeight(1);rig.run.setEffectiveTimeScale(.65)}else{rig.run.paused=true;rig.run.enabled=false;rig.run.setEffectiveWeight(0)}}
  if(moving)rig.mixer?.update(dt);
  if(riggedRoot){riggedRoot.position.copy(root.position);riggedRoot.rotation.y=root.rotation.y+Math.PI;
   if(!moving){riggedRoot.rotation.z=Math.sin(t*.65)*.012;riggedRoot.position.y=Math.sin(t*1.4)*.018}
   else{riggedRoot.rotation.z=0;riggedRoot.position.y=0}
  }
 }if(moving){const step=Math.min(delta.length(),dt*1.25);root.position.addScaledVector(delta.normalize(),step);root.rotation.y=Math.atan2(delta.x,delta.z);body.position.y=Math.abs(Math.sin(t*9))*.08;arms[0].rotation.x=Math.sin(t*9)*.4;arms[1].rotation.x=-Math.sin(t*9)*.4}else{if(mode==='walk')mode=focusMode==='closeup'?'flirt':focusMode==='lounge'?'lounge':'idle';root.rotation.y+=(spin-root.rotation.y)*Math.min(1,dt*2);body.position.y=reduced?0:Math.sin(t*1.8)*.018;arms[0].rotation.x=0;arms[1].rotation.x=0}
 if(mode==='wave'){arms[1].rotation.z=-1.15+Math.sin(t*11)*.2;if(phase>2){mode='idle';arms[1].rotation.z=0}}else arms[1].rotation.z=0;
 if(focusedUntil&&performance.now()>focusedUntil){focusedUntil=0;focusMode='normal';if(mode==='flirt'||mode==='lounge')mode='idle'}
 if(rigMotion)rigMotion.update(mode,t,dt,moving);
 head.rotation.z=reduced?0:Math.sin(t*.85)*.045;head.rotation.x=talk?Math.sin(t*10)*.035:0;
 if(riggedRoot){riggedRoot.position.x=root.position.x;riggedRoot.position.z=root.position.z;riggedRoot.rotation.y=root.rotation.y+Math.PI}const upClose=focusMode==='closeup'&&!!focusedUntil;
 const lounging=focusMode==='lounge'&&!!focusedUntil;
 const cameraGoal=new THREE.Vector3(root.position.x*.72+(upClose?.17:0),upClose?2.42:lounging?2.75:3.3,root.position.z+(upClose?3.1:lounging?5.0:7.8));
 camera.position.lerp(cameraGoal,Math.min(1,dt*(upClose?1.1:1.6)));
 const gaze=new THREE.Vector3(root.position.x*.85,upClose?1.85:lounging?1.5:1.65,root.position.z-.25);
 if(!camera.userData.look)camera.userData.look=gaze.clone();
 camera.userData.look.lerp(gaze,Math.min(1,dt*2));
 camera.lookAt(camera.userData.look);
 renderer.render(scene,camera)}clock.start();tick();
 return {action,setTalking(v){talk=!!v;head.rotation.x=0},destroy(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointerup',up);scene.traverse(o=>{o.geometry?.dispose()});renderer.dispose();renderer.domElement.remove()}};
}
