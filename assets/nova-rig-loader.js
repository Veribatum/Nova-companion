import * as THREE from 'https://esm.sh/three@0.170.0';
import {GLTFLoader} from 'https://esm.sh/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'https://esm.sh/three@0.170.0/examples/jsm/loaders/FBXLoader.js';
import {unzipSync} from 'https://esm.sh/fflate@0.8.2';
const DB='nova-rigged-character-v1';
function store(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore('models');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function get(){const db=await store();return new Promise((resolve,reject)=>{const tx=db.transaction('models','readonly');const r=tx.objectStore('models').get('nova');r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close()})}
async function put(value){const db=await store();return new Promise((resolve,reject)=>{const tx=db.transaction('models','readwrite');tx.objectStore('models').put(value,'nova');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)})}
function decodeArchive(buffer,name){
 const bytes=new Uint8Array(buffer);
 if(!name.toLowerCase().endsWith('.zip'))return {fbx:bytes,maps:{}};
 const files=unzipSync(bytes);
 const keys=Object.keys(files);
 const fbx=keys.find(k=>/Animation_Running_withSkin\.fbx$/i.test(k))||keys.find(k=>/\.fbx$/i.test(k));
 if(!fbx)throw Error('ZIP has no FBX model');
 const maps={};
 for(const key of keys){
  if(!/\.(png|jpe?g)$/i.test(key))continue;
  const fileName=key.split('/').pop().toLowerCase();
  const type=/_normal\./.test(fileName)?'normal':/_roughness\./.test(fileName)?'roughness':/_metallic\./.test(fileName)?'metallic':/_texture_\d+\./.test(fileName)?'color':null;
  if(type&&!maps[type])maps[type]={bytes:files[key],name:key};
 }
 return {fbx:files[fbx],maps};
}
function textureFromAsset(asset,linear=false){
 if(!asset)return null;
 const blob=new Blob([asset.bytes],{type:/\.png$/i.test(asset.name)?'image/png':'image/jpeg'});
 const url=URL.createObjectURL(blob),loader=new THREE.TextureLoader();
 const tex=loader.load(url,()=>URL.revokeObjectURL(url),undefined,()=>URL.revokeObjectURL(url));
 if(!linear)tex.colorSpace=THREE.SRGBColorSpace;
 tex.flipY=true;
 return tex;
}
function makeModel(parts){const loader=new FBXLoader();const input=parts.fbx.buffer.slice(parts.fbx.byteOffset,parts.fbx.byteOffset+parts.fbx.byteLength);const root=loader.parse(input,'');const bbox=new THREE.Box3().setFromObject(root);const size=bbox.getSize(new THREE.Vector3());const height=size.y||1;root.scale.multiplyScalar(2.95/height);root.updateMatrixWorld(true);const grounded=new THREE.Box3().setFromObject(root);root.position.y-=grounded.min.y;
const maps=parts.maps||{};
const textures={color:textureFromAsset(maps.color),normal:textureFromAsset(maps.normal,true),roughness:textureFromAsset(maps.roughness,true),metallic:textureFromAsset(maps.metallic,true)};
root.traverse(obj=>{if(!obj.isMesh)return;const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(mat=>{if(!mat)return;
 if(textures.color)mat.map=textures.color;
 if(textures.normal&&'normalMap'in mat)mat.normalMap=textures.normal;
 if(textures.roughness&&'roughnessMap'in mat){mat.roughnessMap=textures.roughness;mat.roughness=1}
 if(textures.metallic&&'metalnessMap'in mat){mat.metalnessMap=textures.metallic;mat.metalness=1}
 mat.needsUpdate=true;
 })});
root.traverse(obj=>{if(obj.isMesh){obj.frustumCulled=false;obj.castShadow=true}});
const clips=root.animations||[];const mixer=clips.length?new THREE.AnimationMixer(root):null;let run=null;if(mixer){run=mixer.clipAction(clips.find(x=>/run|walk/i.test(x.name))||clips[0]);run.play();run.paused=true}
return {root,mixer,run,animations:clips.map(c=>c.name),height};}
export async function importNovaRig(file){if(!file)throw Error('Select a ZIP or FBX');if(file.size>75000000)throw Error('Model too large (75 MB maximum)');const parts=decodeArchive(await file.arrayBuffer(),file.name);const preview=makeModel(parts);await put({fbx:parts.fbx,maps:parts.maps});return {name:file.name,animations:preview.animations,height:preview.height,textures:Object.keys(parts.maps||{})}}
let remoteRigPromise=null;
async function loadBundledRig(){
 const paths=[
 './assets/nova.glb','./assets/Nova.glb','./assets/crimson-rogue.glb','./assets/Crimson_Rogue.glb',
 './assets/Meshy_AI_Crimson_Rogue_biped.glb',
 './assets/Meshy_AI_Crimson_Rogue_biped.zip',
 './assets/Meshy_AI_Crimson_Rogue_biped_Animation_Running_withSkin.fbx',
 './assets/nova.zip','./assets/Nova.zip'
 ];
 for(const path of paths){
  let response;try{response=await fetch(path,{cache:'no-cache'});if(!response.ok)continue;
   const buffer=await response.arrayBuffer();
   if(path.endsWith('.glb')){
    const loader=new GLTFLoader();
    const model=await new Promise((resolve,reject)=>loader.parse(buffer,new URL('./assets/',location.href).href,resolve,reject));
    const root=model.scene;const bounds=new THREE.Box3().setFromObject(root),h=bounds.getSize(new THREE.Vector3()).y||1;
    root.scale.multiplyScalar(2.95/h);root.updateMatrixWorld(true);root.position.y-=new THREE.Box3().setFromObject(root).min.y;
    const clips=model.animations||[],mixer=clips.length?new THREE.AnimationMixer(root):null;
    const run=mixer?.clipAction(clips.find(c=>/walk|run/i.test(c.name))||clips[0])||null;
    if(run){run.play();run.paused=true}
    return {root,mixer,run,animations:clips.map(c=>c.name),height:h,source:path};
   }
   const archive=decodeArchive(buffer,path);
   const created=makeModel(archive);
   created.source=path;return created;
  }catch(e){console.warn('NOVA bundled model failed',path,String(e).slice(0,120))}
 }
 return null;
}
export async function loadNovaRig(){
 if(!remoteRigPromise)remoteRigPromise=loadBundledRig();
 const bundled=await remoteRigPromise;if(bundled)return bundled;
 const saved=await get();if(!saved)return null;return makeModel(saved);
}
