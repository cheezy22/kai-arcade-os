/* v10.6 True POV + structure visual overhaul */
let povHeading=0;
function headingFor(a){
  if(!a)return povHeading;
  let vx=a.vx||0,vy=a.vy||0;
  if(Math.hypot(vx,vy)>2)return Math.atan2(vy,vx);
  if(a.goal){let gx=a.goal.target?.x??a.goal.x,gy=a.goal.target?.y??a.goal.y;if(Number.isFinite(gx)&&Number.isFinite(gy))return Math.atan2(gy-a.y,gx-a.x)}
  return povHeading;
}

/* richer, more recognisable structures */
drawBuilding=function(b){
  const c=clans[b.c]||{color:'#777'}, lv=b.level||1, roof=c.color;
  ctx.save();ctx.translate(b.x,b.y);ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=1.8/cam.z;ctx.strokeStyle='#2b241dcc';
  if(b.type==='castle'){
    ctx.fillStyle='#b9ab8c';ctx.strokeStyle='#332b22';
    ctx.fillRect(-30,-16,60,34);ctx.strokeRect(-30,-16,60,34);
    for(const x of [-30,18]){ctx.fillRect(x,-28,12,46);ctx.strokeRect(x,-28,12,46);for(let k=0;k<3;k++){ctx.fillStyle=roof;ctx.fillRect(x+k*4,-32,3,6)}}
    ctx.fillStyle='#342820';ctx.fillRect(-7,3,14,15);ctx.beginPath();ctx.arc(0,3,7,Math.PI,0);ctx.fill();
    ctx.fillStyle=roof;ctx.fillRect(-30,-22,60,7);ctx.fillStyle='#ddd0ae';
    if(lv>=2){ctx.strokeStyle='#8e8066';ctx.lineWidth=5/cam.z;ctx.strokeRect(-42,-27,84,53)}
    if(lv>=3){ctx.strokeStyle='#493b2d';ctx.lineWidth=2/cam.z;ctx.beginPath();ctx.moveTo(0,-32);ctx.lineTo(0,-48);ctx.stroke();ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(1,-47);ctx.lineTo(18,-40);ctx.lineTo(1,-35);ctx.closePath();ctx.fill()}
  }else if(b.type==='farm'){
    ctx.fillStyle='#a58646';ctx.strokeStyle='#6d572d';for(let y=-18;y<=18;y+=7){ctx.beginPath();ctx.moveTo(-28,y);ctx.lineTo(28,y);ctx.stroke()}
    ctx.fillStyle='#c8b78c';ctx.fillRect(-11,-10,22,20);ctx.strokeRect(-11,-10,22,20);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(-15,-10);ctx.lineTo(0,-23);ctx.lineTo(15,-10);ctx.closePath();ctx.fill();ctx.fillStyle='#493427';ctx.fillRect(-3,2,6,8);
    if(lv>=2){ctx.fillStyle='#d9c067';for(let i=-22;i<=22;i+=11){ctx.fillRect(i,-20,3,40)}}if(lv>=3){ctx.fillStyle='#71502e';ctx.fillRect(15,-8,8,22);ctx.fillStyle='#d9c99f';ctx.beginPath();ctx.arc(19,-8,4,Math.PI,0);ctx.fill()}
  }else if(b.type==='barracks'){
    ctx.strokeStyle='#6b5138';ctx.lineWidth=3/cam.z;for(let i=-24;i<=24;i+=8){ctx.beginPath();ctx.moveTo(i,-18);ctx.lineTo(i,20);ctx.stroke()}ctx.strokeRect(-28,-20,56,42);
    ctx.fillStyle='#b9a47e';ctx.fillRect(-18,-10,36,23);ctx.strokeStyle='#33281f';ctx.lineWidth=1.5/cam.z;ctx.strokeRect(-18,-10,36,23);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(-21,-10);ctx.lineTo(0,-25);ctx.lineTo(21,-10);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#eee';ctx.lineWidth=2/cam.z;ctx.beginPath();ctx.moveTo(-9,9);ctx.lineTo(6,-12);ctx.moveTo(9,9);ctx.lineTo(-6,-12);ctx.stroke();if(lv>=2){ctx.fillStyle=roof;ctx.fillRect(-2,-29,4,16)}if(lv>=3){ctx.fillStyle='#6c5034';ctx.fillRect(22,-6,8,24)}
  }else if(b.type==='hospital'){
    ctx.fillStyle='#ece7dc';ctx.strokeStyle='#6f6b62';ctx.fillRect(-22,-15,44,31);ctx.strokeRect(-22,-15,44,31);ctx.fillStyle=roof;ctx.fillRect(-24,-20,48,7);ctx.fillStyle='#cf4141';ctx.fillRect(-4,-12,8,22);ctx.fillRect(-11,-5,22,8);ctx.fillStyle='#8fb5c7';for(const x of [-16,11]){ctx.fillRect(x,2,6,7)}
    if(lv>=2){ctx.fillStyle='#e6e0d2';ctx.fillRect(22,-8,15,24);ctx.strokeRect(22,-8,15,24)}if(lv>=3){ctx.fillStyle='#cf4141';ctx.beginPath();ctx.arc(-15,-18,4,0,7);ctx.fill()}
  }else if(b.type==='watchtower'){
    ctx.fillStyle='#755536';ctx.fillRect(-5,-6,10,28);ctx.fillRect(-16,-21,32,13);ctx.strokeRect(-16,-21,32,13);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(-19,-21);ctx.lineTo(0,-34);ctx.lineTo(19,-21);ctx.closePath();ctx.fill();ctx.strokeStyle='#c8b28a';ctx.lineWidth=2/cam.z;for(let y=0;y<20;y+=6){ctx.beginPath();ctx.moveTo(-5,y);ctx.lineTo(5,y);ctx.stroke()}if(lv>=2){ctx.strokeStyle='#4a3927';ctx.beginPath();ctx.moveTo(-14,20);ctx.lineTo(-5,-4);ctx.moveTo(14,20);ctx.lineTo(5,-4);ctx.stroke()}if(lv>=3){ctx.strokeStyle='#eee';ctx.beginPath();ctx.moveTo(0,-34);ctx.lineTo(0,-45);ctx.stroke()}
  }else{
    ctx.fillStyle='#ccb58c';ctx.beginPath();ctx.moveTo(-15,9);ctx.lineTo(0,-15);ctx.lineTo(15,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(-16,9);ctx.lineTo(0,-17);ctx.lineTo(0,9);ctx.closePath();ctx.fill();ctx.fillStyle='#ffb34f';ctx.beginPath();ctx.arc(21,8,4,0,7);ctx.fill();if(lv>=2){ctx.fillStyle='#96734d';ctx.fillRect(-24,10,48,3)}if(lv>=3){ctx.fillStyle='#d3c196';ctx.beginPath();ctx.moveTo(18,8);ctx.lineTo(28,-8);ctx.lineTo(36,8);ctx.closePath();ctx.fill()}
  }
  if(b.maxHp&&b.hp<b.maxHp*.8){ctx.fillStyle='#161616aa';ctx.fillRect(-20,27,40,4);ctx.fillStyle=b.hp<b.maxHp*.35?'#ff5d52':'#ffd15d';ctx.fillRect(-20,27,40*clamp(b.hp/b.maxHp,0,1),4)}
  ctx.restore();
};

function povProject(obj,a,heading){
  let dx=obj.x-a.x,dy=obj.y-a.y,cs=Math.cos(heading),sn=Math.sin(heading);
  let f=dx*cs+dy*sn,s=-dx*sn+dy*cs;if(f<8||f>520)return null;
  let focal=Math.min(W,H)*.95, x=W/2+s/f*focal, scale=clamp(330/f,.35,5.2), y=H*.55 + 82/f*scale;
  return {x,y,scale,f};
}
function drawPovBuilding(b,p){
  let c=clans[b.c]||{color:'#777'},s=p.scale;ctx.save();ctx.translate(p.x,p.y);ctx.scale(s,s);ctx.globalAlpha=clamp(1-p.f/650,.35,1);
  ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,8,18,5,0,0,7);ctx.fill();
  if(b.type==='castle'){ctx.fillStyle='#b9ab8c';ctx.fillRect(-20,-35,40,35);ctx.fillRect(-27,-47,12,47);ctx.fillRect(15,-47,12,47);ctx.fillStyle=c.color;ctx.fillRect(-27,-51,12,7);ctx.fillRect(15,-51,12,7);ctx.fillRect(-20,-39,40,7);ctx.fillStyle='#2b211b';ctx.fillRect(-5,-14,10,14)}
  else if(b.type==='farm'){ctx.fillStyle='#a8874b';ctx.fillRect(-26,-5,52,9);ctx.fillStyle='#c7b58d';ctx.fillRect(-12,-24,24,24);ctx.fillStyle=c.color;ctx.beginPath();ctx.moveTo(-16,-24);ctx.lineTo(0,-38);ctx.lineTo(16,-24);ctx.closePath();ctx.fill()}
  else if(b.type==='hospital'){ctx.fillStyle='#ece7dc';ctx.fillRect(-22,-31,44,31);ctx.fillStyle=c.color;ctx.fillRect(-24,-37,48,7);ctx.fillStyle='#cf4141';ctx.fillRect(-4,-27,8,20);ctx.fillRect(-11,-21,22,8)}
  else if(b.type==='barracks'){ctx.fillStyle='#b9a47e';ctx.fillRect(-20,-27,40,27);ctx.fillStyle=c.color;ctx.beginPath();ctx.moveTo(-24,-27);ctx.lineTo(0,-43);ctx.lineTo(24,-27);ctx.closePath();ctx.fill();ctx.strokeStyle='#795b3d';ctx.lineWidth=2;ctx.strokeRect(-27,-34,54,34)}
  else if(b.type==='watchtower'){ctx.fillStyle='#765536';ctx.fillRect(-5,-35,10,35);ctx.fillRect(-18,-49,36,14);ctx.fillStyle=c.color;ctx.beginPath();ctx.moveTo(-20,-49);ctx.lineTo(0,-62);ctx.lineTo(20,-49);ctx.closePath();ctx.fill()}
  else{ctx.fillStyle='#cbb68f';ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(0,-28);ctx.lineTo(17,0);ctx.closePath();ctx.fill();ctx.fillStyle=c.color;ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(0,-28);ctx.lineTo(0,0);ctx.closePath();ctx.fill()}
  ctx.restore();
}
function drawPovAgent(o,p){
  let c=clans[o.c]||{color:'#777'},s=p.scale;ctx.save();ctx.translate(p.x,p.y);ctx.scale(s,s);ctx.globalAlpha=clamp(1-p.f/650,.4,1);ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,3,6,2,0,0,7);ctx.fill();ctx.fillStyle=c.color;ctx.fillRect(-5,-17,10,15);ctx.fillStyle='#e7b98d';ctx.beginPath();ctx.arc(0,-23,5,0,7);ctx.fill();ctx.fillStyle='#2d211b';ctx.fillRect(-4,-29,8,4);ctx.fillStyle='#2a211c';ctx.fillRect(-5,-2,4,9);ctx.fillRect(1,-2,4,9);if(o.role==='guard'||o.role==='leader'){ctx.strokeStyle='#eee';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(6,-8);ctx.lineTo(12,-27);ctx.stroke();ctx.fillStyle=c.color;ctx.beginPath();ctx.arc(-7,-10,5,0,7);ctx.fill()}else if(o.role==='raider'){ctx.strokeStyle='#76502d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(6,-5);ctx.lineTo(13,-25);ctx.stroke()}else if(o.role==='scout'){ctx.strokeStyle='#d3a14c';ctx.beginPath();ctx.arc(8,-12,5,-1.3,1.3);ctx.stroke()}ctx.restore();
}
function drawPovWeapon(a){
  const y=H-8;ctx.save();ctx.globalAlpha=.98;ctx.translate(W*.72,y);let c=clans[a.c]?.color||'#777';
  if(a.role==='guard'||a.role==='leader'){ctx.strokeStyle='#e7edf1';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-15,10);ctx.lineTo(42,-125);ctx.stroke();ctx.strokeStyle='#76502f';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-10,8);ctx.lineTo(7,-30);ctx.stroke();ctx.fillStyle=c;ctx.beginPath();ctx.arc(-75,-28,43,0,7);ctx.fill();ctx.strokeStyle='#eadbb5';ctx.lineWidth=5;ctx.stroke()}
  else if(a.role==='raider'||a.role==='heavy'){ctx.strokeStyle='#704b2b';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(35,-105);ctx.stroke();ctx.fillStyle='#dfe5e8';ctx.beginPath();ctx.moveTo(20,-117);ctx.lineTo(75,-108);ctx.lineTo(66,-72);ctx.lineTo(31,-84);ctx.closePath();ctx.fill()}
  else if(a.role==='scout'){ctx.strokeStyle='#c89443';ctx.lineWidth=8;ctx.beginPath();ctx.arc(10,-65,62,-1.25,1.25);ctx.stroke();ctx.strokeStyle='#eee';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(28,-122);ctx.lineTo(28,-8);ctx.stroke()}
  else{ctx.fillStyle='#8f693e';ctx.fillRect(-8,-70,40,65);ctx.fillStyle='#c7b58a';ctx.fillRect(-3,-65,30,20)}ctx.restore();
}

const drawMapV106=draw;
draw=function(){
  if(!povAgent){drawMapV106();return}
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#7ea8bd';ctx.fillRect(0,0,W,H*.48);let grd=ctx.createLinearGradient(0,H*.48,0,H);grd.addColorStop(0,'#4d6945');grd.addColorStop(1,'#283f2d');ctx.fillStyle=grd;ctx.fillRect(0,H*.48,W,H*.52);
  ctx.strokeStyle='#d7e5e8aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,H*.48);ctx.lineTo(W,H*.48);ctx.stroke();
  const h=povHeading, objs=[];for(const b of buildings){let p=povProject(b,povAgent,h);if(p)objs.push({kind:'b',o:b,p})}for(const a of agents){if(a===povAgent||!a.alive)continue;let p=povProject(a,povAgent,h);if(p)objs.push({kind:'a',o:a,p})}objs.sort((A,B)=>B.p.f-A.p.f);for(const q of objs){if(q.kind==='b')drawPovBuilding(q.o,q.p);else drawPovAgent(q.o,q.p)}
  for(const p of projectiles){let pp=povProject(p,povAgent,h);if(!pp)continue;ctx.save();ctx.translate(pp.x,pp.y);ctx.scale(pp.scale,pp.scale);ctx.fillStyle='#f3e0a6';ctx.fillRect(-8,-1,16,2);ctx.restore()}
  drawPovWeapon(povAgent);
  ctx.strokeStyle='#ffffffaa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W/2-10,H/2);ctx.lineTo(W/2+10,H/2);ctx.moveTo(W/2,H/2-10);ctx.lineTo(W/2,H/2+10);ctx.stroke();
  ctx.fillStyle='#0b121acc';ctx.fillRect(0,0,W,42);ctx.fillStyle='#fff';ctx.font='900 12px system-ui';ctx.fillText(`${clans[povAgent.c]?.em||''} ${povAgent.name} · ${povAgent.role.toUpperCase()} · HP ${Math.round(povAgent.hp)} · HUNGER ${Math.round(povAgent.hunger)}`,12,25);
  $('year').textContent='Y'+year;$('pop').textContent=agents.length+' souls';$('wars').textContent=Math.floor(clans.reduce((n,c)=>n+c.war.size,0)/2)+' wars';
};

const updateV106=update;update=function(dt){updateV106(dt);if(povAgent&&povAgent.alive){let target=headingFor(povAgent);let d=((target-povHeading+Math.PI*3)%(Math.PI*2))-Math.PI;povHeading+=d*clamp(dt*4,0,1)}};

/* replace the old misleading POV controls with a real mode */
const oldSetPOV=setPOV;setPOV=function(a){oldSetPOV(a);if(a){povHeading=headingFor(a);povExit.textContent='✕ EXIT POV';povExit.style.cssText='position:fixed;z-index:140;right:12px;bottom:calc(env(safe-area-inset-bottom) + 14px);display:block;background:#ffe17a;color:#17130a;padding:12px 16px;border-radius:999px;font:1000 12px system-ui;box-shadow:0 8px 28px #0008';$('bar').style.display='none';$('feed').style.display='none';$('focus').style.display='none';document.querySelector('#top').style.display='none'}};
povExit.onclick=()=>{povAgent=null;povExit.style.display='none';$('bar').style.display='grid';$('feed').style.display='block';$('focus').style.display='block';document.querySelector('#top').style.display='flex';$('focus').textContent='👁 WATCH • tap people/buildings • drag • pinch zoom';cam.tz=1;director=false};
document.querySelector('.brand small').textContent="Dad's Crazy Simulation • CIVILISATIONS v10.6";
