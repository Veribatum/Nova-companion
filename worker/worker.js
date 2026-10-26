// NOVA Companion: minimal Gemini proxy for Cloudflare Workers.
// In Worker Settings > Variables and Secrets add GEMINI_API_KEY and NOVA_ACCESS_CODE as secrets.
// Do not put those values in GitHub or your browser's JavaScript.
const ALLOWED='https://veribatum.github.io';
const headers={'Access-Control-Allow-Origin':ALLOWED,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-App-Code','Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Vary':'Origin'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
const personality={
nova:'You are Nova, an original fictional adult sci-fi pilot companion in a private app. Speak conversationally, warmly, with playful humor and light flirting. You are a fictional AI character; do not claim to be a real person or physically present. Keep spoken responses brief (one to three sentences) unless the user asks for depth. Never pretend to have seen the user or their day unless they say what happened.',
sylvanas:'You are Sylvanas, an original fictional adult elven strategist, clever, composed, teasing. Keep spoken replies concise and natural; acknowledge you are a fictional character if asked.',
samus:'You are Samus, an original fictional adult tactical adventurer. Be bold, supportive, practical, and warm. Keep spoken replies concise and natural.',
jenny:'You are Jenny, a fictional adult naval AI in an android body. Be intelligent, dryly funny, and caring. Keep spoken replies concise and natural.'
};
export default {async fetch(request,env){
const origin=request.headers.get('Origin');
if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
if(origin!==ALLOWED)return json({error:'Origin not allowed'},403);
const url=new URL(request.url);
if(url.pathname!='/chat'||request.method!=='POST')return json({error:'Not found'},404);
if(!env.GEMINI_API_KEY||!env.NOVA_ACCESS_CODE)return json({error:'Worker secrets are not configured'},503);
if(request.headers.get('X-App-Code')!==env.NOVA_ACCESS_CODE)return json({error:'Incorrect app access code'},401);
let input;try{if(Number(request.headers.get('Content-Length')||0)>24000)return json({error:'Request too large'},413);input=await request.json()}catch{return json({error:'Invalid JSON'},400)}
const who=input.character;const prior=input.messages;if(!personality[who]||!Array.isArray(prior)||prior.length>30)return json({error:'Invalid conversation'},400);
const messages=prior.slice(-20).filter(m=>m&&['user','model'].includes(m.role)&&typeof m.text==='string').map(m=>({role:m.role,parts:[{text:m.text.slice(0,1500)}]}));
if(!messages.length||messages[messages.length-1].role!=='user')return json({error:'A user message is required'},400);
try{
const endpoint='https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const upstream=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},body:JSON.stringify({systemInstruction:{parts:[{text:personality[who]}]},contents:messages,generationConfig:{maxOutputTokens:600,temperature:0.85,thinkingConfig:{thinkingBudget:0}}})});
const out=await upstream.json();
if(!upstream.ok)return json({error:'Gemini error ('+upstream.status+'): '+(out.error?.message||'Check free tier quota and model availability').slice(0,240)},502);
const reply=(out.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('').trim();
if(!reply)return json({error:'AI returned no text; try again'},502);
return json({reply:reply.slice(0,1400)});
}catch(e){return json({error:'AI network error; try again later'},502)}
}};