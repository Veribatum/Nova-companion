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
 const scene=new THREE.Scene();scene.background=new THREE.Color('#111528');scene.fog=new THREE.Fog('#111528',10,21);
 const camera=new THREE.PerspectiveCamera(49,1,.1,70);camera.position.set(0,3.1,8.7);camera.lookAt(0,1.65,-.7);
 scene.add(new THREE.HemisphereLight('#bad5ff','#30202e',2));
 const light=new THREE.PointLight('#ffc5a3',45,12);light.position.set(-3,4,2);scene.add(light);
 const ambient=new THREE.PointLight('#6388ff',34,12);ambient.position.set(3,4,-3);scene.add(ambient);
 const floorMat=S('#222733',.5,.2),wallMat=S('#1a2231',.7,.1),trim=S('#5b718f',.34,.6),glow=new THREE.MeshBasicMaterial({color:'#65cffa'}),glass=new THREE.MeshBasicMaterial({color:'#070e22'});
 box(scene,floorMat,[0,-.15,-.8],[10,.3,11]);box(scene,wallMat,[0,2.5,-6.05],[10,5,.3]);
 for(let i=-4;i<=4;i+=2){box(scene,trim,[i,0,-.7],[.045,.01,10]);box(scene,trim,[i,4.45,-5.85],[.06,.06,.15])}
 for(let i=0;i<5;i++){box(scene,trim,[-4.86,2.2-i*.75,-1.25],[.09,.035,8]);box(scene,trim,[4.86,2.2-i*.75,-1.25],[.09,.035,8])}
 box(scene,wallMat,[-4.95,2.4,-.8],[.2,5,11]);box(scene,wallMat,[4.95,2.4,-.8],[.2,5,11]);
 // Viewport: dark starfield behind a substantial panoramic window.
 box(scene,trim,[0,2.75,-5.82],[7.8,3.35,.12]);box(scene,glass,[0,2.75,-5.7],[7.52,3.06,.15]);
 for(let i=0;i<90;i++){const x=(((i*97)%113)/113-.5)*7.1,y=1.4+((i*47)%97)/97*2.65;const star=ell(scene,i%8===0?S('#a0ddff'):white,[x,y,-5.57],[.012+(i%5)*.007,.012+(i%5)*.007,.012],7);star.userData.star=true}
 for(let i=-1;i<=1;i++)box(scene,trim,[i*2.5,2.75,-5.52],[.09,3.15,.1]);
 const screen=new THREE.MeshBasicMaterial({color:'#286b92'}),screen2=new THREE.MeshBasicMaterial({color:'#81cff0'});
 for(let i=0;i<3;i++){const x=-3.2+i*3.2;box(scene,armor2,[x,.55,-4.55],[2.5,.85,1.2]);box(scene,screen,[x,.92,-4.5],[2.1,.065,.85]);for(let j=0;j<5;j++)box(scene,screen2,[x-.8+j*.36,.96,-4.55+j%2*.1],[.16,.01,.035])}
 // Captain's chair and a glowing central table.
 box(scene,armor,[3.25,.55,-1.5],[1.45,.35,1.35]);box(scene,armor2,[3.25,1.35,-1.92],[1.35,1.7,.27]);box(scene,trim,[3.25,.65,-1.4],[1.1,.08,1.05]);
 box(scene,armor,[0,.45,-2.6],[1.5,.8,1]);box(scene,screen,[0,.88,-2.6],[1.42,.03,.92]);
 const nova=makeNova();const {root,body,head,arms}=nova;scene.add(root);root.position.set(-1.15,0,.2);let rig=null,riggedRoot=null,disposed=false;
 import('./nova-rig-loader.js').then(async m=>{const loaded=await m.loadNovaRig();if(!loaded||disposed)return;rig=loaded;riggedRoot=loaded.root;riggedRoot.position.x=root.position.x;riggedRoot.position.z=root.position.z;riggedRoot.rotation.y=Math.PI;scene.add(riggedRoot);root.visible=false;el.dispatchEvent(new CustomEvent('nova-rig-ready',{detail:{animations:loaded.animations}}))}).catch(e=>console.warn('No rigged Nova loaded:',e.message));

 let mode='idle',target=root.position.clone(),phase=0,talk=false,spin=0;
 const destinations={window:new THREE.Vector3(-2,0,-3.3),console:new THREE.Vector3(1.2,0,-3.1),chair:new THREE.Vector3(3.1,0,-.65),center:new THREE.Vector3(-.6,0,.8)};
 const action=(name)=>{if(name==='talk'){talk=true;mode='talk';setTimeout(()=>{if(!disposed)talk=false},2500);return}if(name==='wave'){mode='wave';phase=0;return}if(name==='turn'){spin+=Math.PI*.75;return}if(destinations[name]){target=destinations[name].clone();mode='walk';return}mode='idle'};
 const resize=()=>{if(disposed)return;const w=el.clientWidth||320,h=el.clientHeight||400;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();const observer=new ResizeObserver(resize);observer.observe(el);
 const clock=new THREE.Clock(),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches,down=e=>{el._downX=e.clientX},up=e=>{if(typeof el._downX==='number'&&Math.abs(e.clientX-el._downX)>25)spin+=(e.clientX-el._downX)*.008;el._downX=null};el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);
 let raf;function tick(){if(disposed)return;raf=requestAnimationFrame(tick);if(document.hidden)return;const dt=Math.min(clock.getDelta(),.08);phase+=dt;const t=clock.elapsedTime;const delta=target.clone().sub(root.position),moving=mode==='walk'&&delta.length()>.08;
 if(rig){rig.run.paused=!moving;rig.mixer?.update(dt);if(riggedRoot){riggedRoot.position.copy(root.position);riggedRoot.rotation.y=root.rotation.y+Math.PI;}}if(moving){const step=Math.min(delta.length(),dt*1.25);root.position.addScaledVector(delta.normalize(),step);root.rotation.y=Math.atan2(delta.x,delta.z);body.position.y=Math.abs(Math.sin(t*9))*.08;arms[0].rotation.x=Math.sin(t*9)*.4;arms[1].rotation.x=-Math.sin(t*9)*.4}else{if(mode==='walk')mode='idle';root.rotation.y+=(spin-root.rotation.y)*Math.min(1,dt*2);body.position.y=reduced?0:Math.sin(t*1.8)*.018;arms[0].rotation.x=0;arms[1].rotation.x=0}
 if(mode==='wave'){arms[1].rotation.z=-1.15+Math.sin(t*11)*.2;if(phase>2){mode='idle';arms[1].rotation.z=0}}else arms[1].rotation.z=0;
 head.rotation.z=reduced?0:Math.sin(t*.85)*.045;head.rotation.x=talk?Math.sin(t*10)*.035:0;
 if(riggedRoot){riggedRoot.position.copy(root.position);riggedRoot.rotation.y=root.rotation.y+Math.PI}renderer.render(scene,camera)}clock.start();tick();
 return {action,setTalking(v){talk=!!v;head.rotation.x=0},destroy(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointerup',up);scene.traverse(o=>{o.geometry?.dispose()});renderer.dispose();renderer.domElement.remove()}};
}
