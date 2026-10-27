// Photo-based animated companion renderer. No external libraries.
export function mountLivingPortrait(host, imageUrl, opts={}) {
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const canvas=document.createElement('canvas');
  canvas.className='living-canvas';canvas.setAttribute('aria-label','Animated character portrait');
  host.prepend(canvas);
  const gl=canvas.getContext('webgl',{alpha:false,antialias:true,premultipliedAlpha:false});
  if(!gl){canvas.remove();return {setTalking(){},destroy(){}}}
  const vertex=`attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.)*.5,1.-(p.y+1.)*.5);gl_Position=vec4(p,0.,1.);}`;
  const fragment=`precision mediump float;
varying vec2 uv;uniform sampler2D tex;uniform float t;uniform float speaking;uniform float speed;uniform float aspect;uniform vec2 imageSize;
uniform vec2 eyeL;uniform vec2 eyeR;uniform vec2 mouth;uniform vec2 chest;uniform vec2 pointer;uniform float blink;
float gauss(vec2 p,vec2 c,vec2 r){vec2 q=(p-c)/r;return exp(-dot(q,q)*2.8);}
vec2 fit(vec2 p){float ca=aspect,ia=imageSize.x/imageSize.y;vec2 q=p;if(ca>ia){float visible=ia/ca;q.y=(q.y-.5)/visible+.5;}else{float visible=ca/ia;q.x=(q.x-.5)/visible+.5;}return q;}
void main(){
vec2 p=uv;
float breathe=sin(t*speed*1.65)*.5+.5;
vec2 head=vec2((eyeL.x+eyeR.x)*.5,(eyeL.y+eyeR.y)*.5+.055);
float hg=gauss(p,head,vec2(.48,.37));
float cg=gauss(p,chest,vec2(.37,.27));
p.x+=sin(t*.54)*.0035*hg + pointer.x*.014*(hg+.3*cg);
p.y+=sin(t*.6)*.003*hg + pointer.y*.008*hg;
p.y+=breathe*.008*cg;
p.x+=sin(t*.36+.5)*.003*cg;
float blinkL=gauss(p,eyeL,vec2(.068,.026));
float blinkR=gauss(p,eyeR,vec2(.068,.026));
p.y+=(eyeL.y-p.y)*blink*(blinkL+blinkR)*.78;
float lip=gauss(p,mouth,vec2(.1,.06));
p.y+=sin(t*16.)*speaking*.013*lip;
p.y+=sin(t*9.6)*speaking*.009*lip;
vec2 q=fit(p);
vec4 col=texture2D(tex,clamp(q,.001,.999));
float vignette=smoothstep(.98,.22,length((uv-.5)*vec2(.95,.85)));
gl_FragColor=vec4(col.rgb*(.84+.16*vignette),1.);
}`;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
  let program;
  try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('shader link failed');}
  catch(e){canvas.remove();console.warn(e);return {setTalking(){},destroy(){}}}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  let pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const uni=(name)=>gl.getUniformLocation(program,name);
  const uniforms={t:uni('t'),speaking:uni('speaking'),speed:uni('speed'),aspect:uni('aspect'),imageSize:uni('imageSize'),eyeL:uni('eyeL'),eyeR:uni('eyeR'),mouth:uni('mouth'),chest:uni('chest'),pointer:uni('pointer'),blink:uni('blink')};
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  let natural=[1,1],ready=false,live=true,talk=false,raf=0,px=0,py=0;
  const image=new Image();image.onload=()=>{natural=[image.naturalWidth,image.naturalHeight];gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);ready=true};image.onerror=()=>{canvas.style.display='none';console.warn('Living portrait image could not load')};image.src=imageUrl;
  const point=(name,def)=>opts.points?.[name]||def;
  const start=performance.now();
  const move=e=>{const r=host.getBoundingClientRect();px=((e.clientX-r.left)/r.width-.5)*2;py=((e.clientY-r.top)/r.height-.5)*2};
  const leave=()=>{px=0;py=0};
  host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
  let observer=new ResizeObserver(()=>{let w=host.clientWidth||320,h=host.clientHeight||480;canvas.width=Math.max(1,Math.round(w*Math.min(devicePixelRatio||1,1.6)));canvas.height=Math.max(1,Math.round(h*Math.min(devicePixelRatio||1,1.6)));gl.viewport(0,0,canvas.width,canvas.height)});observer.observe(host);
  const draw=()=>{if(!live)return;raf=requestAnimationFrame(draw);if(!ready||document.hidden)return;
    const t=(performance.now()-start)/1000;
    const eyeMoment=t%5.9,blink=!reduced&&((eyeMoment>.3&&eyeMoment<.44)||(eyeMoment>4.4&&eyeMoment<4.52))?Math.sin((eyeMoment<1?(eyeMoment-.3)/.14:(eyeMoment-4.4)/.12)*Math.PI):0;
    gl.uniform1f(uniforms.t,t);gl.uniform1f(uniforms.speaking,talk?1:0);gl.uniform1f(uniforms.speed,reduced?0:1);gl.uniform1f(uniforms.aspect,canvas.width/canvas.height);gl.uniform2f(uniforms.imageSize,...natural);
    for(const name of ['eyeL','eyeR','mouth','chest'])gl.uniform2f(uniforms[name],...point(name,({eyeL:[.42,.3],eyeR:[.57,.3],mouth:[.5,.38],chest:[.5,.62]})[name]));
    gl.uniform2f(uniforms.pointer,reduced?0:px,reduced?0:py);gl.uniform1f(uniforms.blink,blink);
    gl.drawArrays(gl.TRIANGLES,0,6)};
  draw();
  return {setTalking(v){talk=!!v},destroy(){live=false;cancelAnimationFrame(raf);observer.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);canvas.remove()}};
}
