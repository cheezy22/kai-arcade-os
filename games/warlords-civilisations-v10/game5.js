/* v10.5 Civilisation Brain / POV / Combat / Endgame */
let projectiles=[],povAgent=null,victory=null,era=1,dominance={id:null,years:0};
const baseAddBuildingV10=addBuilding;
function civCounts(c){
  const live=agents.filter(a=>a.alive&&a.c===c.id), own=buildings.filter(b=>b.hp>0&&b.c===c.id), wounded=live.filter(a=>a.hp<65).length;
  const count=t=>own.filter(b=>b.type===t).length;
  return {live,own,wounded,farm:count('farm'),hospital:count('hospital'),barracks:count('barracks'),watchtower:count('watchtower'),camp:count('camp'),castle:count('castle')};
}
function civPlan(c){
  const s=civCounts(c), pop=s.live.length, wars=c.war.size, lowFood=c.food<Math.max(25,pop*.45), threatened=wars>0||c.rage>60;
  let need='farm';
  const desiredHosp=Math.min(5,Math.max(1,Math.ceil(pop/38)+(s.wounded>7?1:0)));
  const desiredBarr=Math.min(6,Math.max(1,Math.ceil(pop/32)+(wars?1:0)));
  const desiredTower=Math.min(7,Math.max(1,Math.ceil((c.territory||1)/90)+(wars?2:0)));
  const desiredFarm=Math.min(10,Math.max(2,Math.ceil(pop/20)+(lowFood?2:0)));
  if(lowFood&&s.farm<desiredFarm)need='farm';
  else if(s.hospital<desiredHosp&&s.wounded>Math.max(2,pop*.08))need='hospital';
  else if(threatened&&s.barracks<desiredBarr)need='barracks';
  else if(threatened&&s.watchtower<desiredTower)need='watchtower';
  else if(s.farm<desiredFarm)need='farm';
  else need=pop>55&&s.camp<3?'camp':(Math.random()<.52?'farm':'watchtower');
  c.strategy={need,desiredHosp,desiredBarr,desiredTower,desiredFarm,lowFood,threatened,wounded:s.wounded,pop};
  return c.strategy;
}
addBuilding=function(c,x,y,type='camp'){
  const clan=clans[c];
  if(clan&&mode!=='build'&&type!=='castle'){
    const p=civPlan(clan), s=civCounts(clan);
    if(type==='hospital'&&s.hospital>=p.desiredHosp)type=p.need;
    if(type==='barracks'&&s.barracks>=p.desiredBarr)type=p.need;
    if(type==='watchtower'&&s.watchtower>=p.desiredTower)type=p.need;
    if(type==='farm'&&s.farm>=p.desiredFarm+2)type=p.need;
  }
  return baseAddBuildingV10(c,x,y,type);
};
function brainTick(c,dt){
  c.brainClock=(c.brainClock||0)-dt;if(c.brainClock>0)return;c.brainClock=R(2.5,5.5);
  const p=civPlan(c), builders=agents.filter(a=>a.alive&&a.c===c.id&&a.role==='builder');
  if(builders.length&&c.wood>16){
    const idle=builders.find(a=>!a.goal||a.goal.type==='move'||a.goal.type==='gather');
    if(idle){let ang=R(0,Math.PI*2),rad=R(105,240);idle.goal={type:'build',x:clamp(c.home.x+Math.cos(ang)*rad,35,WORLD.w-35),y:clamp(c.home.y+Math.sin(ang)*rad,35,WORLD.h-35)};idle.think=R(2,5)}
  }
  if(p.lowFood&&c.war.size===0&&c.rage>54){let rich=clans.filter(o=>o.id!==c.id).sort((a,b)=>b.food-a.food)[0];if(rich&&rich.food>c.food+35)setWar(c.id,rich.id,true,'a planned war for food')}
}
function shoot(from,to,kind='arrow',damage=R(7,13)){
  if(!from||!to||!to.alive)return;let dx=to.x-from.x,dy=to.y-from.y,l=Math.hypot(dx,dy)||1,speed=kind==='bolt'?250:215;
  projectiles.push({x:from.x,y:from.y,vx:dx/l*speed,vy:dy/l*speed,target:to,c:from.c,life:1.2,kind,damage});
}
function projectileTick(dt){
  for(const p of projectiles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;let t=p.target;if(t&&t.alive&&Math.hypot(p.x-t.x,p.y-t.y)<10){t.hp-=p.damage;p.life=0;fx.push({x:t.x,y:t.y,vx:R(-8,8),vy:R(-18,-5),life:.4,max:.4,text:'✦',color:clans[p.c]?.color||'#fff'});if(t.hp<=0)t.alive=false}}
  projectiles=projectiles.filter(p=>p.life>0);
  for(const a of agents){if(!a.alive||a.role!=='scout')continue;a.shotClock=(a.shotClock||R(0,.8))-dt;if(a.shotClock>0)continue;let e=nearestEnemy(a,190);if(e){shoot(a,e,'arrow');a.shotClock=R(1.0,1.6);if(dist(a,e)<70)a.goal={type:'move',x:clamp(a.x+(a.x-e.x)*2,20,WORLD.w-20),y:clamp(a.y+(a.y-e.y)*2,20,WORLD.h-20)}}}
  for(const c of clans){for(const tower of buildings.filter(b=>b.hp>0&&b.c===c.id&&b.type==='watchtower')){tower.shotClock=(tower.shotClock||R(0,1))-dt;if(tower.shotClock>0)continue;let target=agents.find(a=>a.alive&&a.c!==c.id&&c.war.has(a.c)&&Math.hypot(a.x-tower.x,a.y-tower.y)<150);if(target){shoot({x:tower.x,y:tower.y,c:c.id},target,'bolt',R(9,16));tower.shotClock=R(.8,1.35)}}}
}
function checkEndgame(dt){
  if(victory)return;const active=clans.filter(c=>agents.some(a=>a.alive&&a.c===c.id)||buildings.some(b=>b.hp>0&&b.c===c.id&&b.type==='castle'));if(active.length===1&&year>25)return declareVictory(active[0],'CONQUEST','the last sovereign snack civilisation standing');
  const totalTerr=clans.reduce((n,c)=>n+(c.territory||0),0)||1,totalPop=Math.max(1,agents.filter(a=>a.alive).length);
  let leader=clans.slice().sort((a,b)=>(b.territory||0)-(a.territory||0))[0];if(!leader)return;let terr=(leader.territory||0)/totalTerr,pop=agents.filter(a=>a.alive&&a.c===leader.id).length/totalPop;
  if(terr>.57&&pop>.52){if(dominance.id===leader.id)dominance.years+=dt/5;else dominance={id:leader.id,years:0};if(dominance.years>=35)declareVictory(leader,'EMPIRE','dominant in territory and population for a generation')}else dominance={id:null,years:0};
  if((worldSetup.mode==='collapse'||worldSetup.mode==='scarcity')&&year>=600){let survivor=clans.slice().sort((a,b)=>agents.filter(x=>x.alive&&x.c===b.id).length-agents.filter(x=>x.alive&&x.c===a.id).length)[0];if(survivor)declareVictory(survivor,'SURVIVAL','outlasted six centuries of scarcity')}
}
let victoryBox=document.createElement('div');victoryBox.style.cssText='position:fixed;z-index:120;inset:0;display:none;place-items:center;background:#02060bd9;padding:20px';document.body.appendChild(victoryBox);
function declareVictory(c,type,why){victory={c:c.id,type,year};paused=true;victoryBox.innerHTML=`<div style="width:min(520px,94vw);background:#f5f7fa;color:#101721;border-radius:24px;padding:22px;box-shadow:0 25px 80px #000"><div style="font:1000 12px system-ui;letter-spacing:.12em;color:#66727d">ERA ${era} COMPLETE · Y${year}</div><div style="font:1000 29px/1 system-ui;margin:7px 0">${c.em} ${c.name}</div><div style="font:1000 18px system-ui">${type} VICTORY</div><p style="font:700 12px/1.45 system-ui;color:#52606d">${c.name} is ${why}. History does not have to end here.</p><button id="continueEra" style="width:100%;height:48px;background:#111d2b;color:white;font-size:13px">Continue History</button></div>`;victoryBox.style.display='grid';say(`🏆 ${c.name} achieves ${type.toLowerCase()} victory in Y${year}.`,true);setTimeout(()=>{$('continueEra').onclick=()=>{era++;victory=null;dominance={id:null,years:0};paused=false;victoryBox.style.display='none';say(`📜 Era ${era} begins. Empires can still fall.`,true)}},0)}
function setPOV(a){povAgent=a;director=false;$('director').classList.remove('on');inspectBox.style.display='none';if(a){cam.tz=2.25;$('focus').textContent='👁 POV · '+a.name+' · tap POV EXIT to leave';povExit.style.display='block'}}
let povExit=document.createElement('button');povExit.textContent='👁 POV EXIT';povExit.style.cssText='position:fixed;z-index:28;right:9px;top:calc(env(safe-area-inset-top) + 52px);display:none;background:#ffe17a;color:#17130a;padding:8px 10px;border-radius:999px;font:950 10px system-ui';povExit.onclick=()=>{povAgent=null;povExit.style.display='none';$('focus').textContent='👁 WATCH • tap people/buildings • drag • pinch zoom'};document.body.appendChild(povExit);
const inspectV10=inspectAt;inspectAt=function(p){let ok=inspectV10(p);if(ok&&selected){setTimeout(()=>{let q=$('followAgent');if(q){q.textContent='👁 POV';q.onclick=()=>setPOV(selected)}},0)}return ok};
const updateV10=update;update=function(dt){updateV10(dt);for(const c of clans)brainTick(c,dt);projectileTick(dt);checkEndgame(dt);if(povAgent){if(!povAgent.alive){say('☠️ Your POV character has died.',true);povAgent=null;povExit.style.display='none'}else{cam.tx=povAgent.x;cam.ty=povAgent.y;cam.tz=2.25}}};
const drawV10=draw;draw=function(){drawV10();ctx.save();ctx.translate(W/2,H/2);ctx.scale(cam.z,cam.z);ctx.translate(-cam.x,-cam.y);ctx.lineCap='round';for(const p of projectiles){let l=Math.hypot(p.vx,p.vy)||1,ux=p.vx/l,uy=p.vy/l;ctx.strokeStyle=p.kind==='bolt'?'#f4e4b8':'#e8d39a';ctx.lineWidth=(p.kind==='bolt'?3:2)/cam.z;ctx.beginPath();ctx.moveTo(p.x-ux*11,p.y-uy*11);ctx.lineTo(p.x+ux*5,p.y+uy*5);ctx.stroke();ctx.fillStyle='#b8c2c8';ctx.beginPath();ctx.moveTo(p.x+ux*8,p.y+uy*8);ctx.lineTo(p.x+ux*2-uy*3,p.y+uy*2+ux*3);ctx.lineTo(p.x+ux*2+uy*3,p.y+uy*2-ux*3);ctx.closePath();ctx.fill()}for(const a of agents){if(!a.alive)continue;ctx.save();ctx.translate(a.x,a.y);let c=clans[a.c];if(a.role==='guard'||a.role==='leader'){ctx.strokeStyle='#f1f4f6';ctx.lineWidth=3.4/cam.z;ctx.beginPath();ctx.moveTo(8,5);ctx.lineTo(18,-13);ctx.stroke();ctx.fillStyle=c.color;ctx.strokeStyle='#eee0ba';ctx.lineWidth=1.6/cam.z;ctx.beginPath();ctx.arc(-10,1,7,0,Math.PI*2);ctx.fill();ctx.stroke()}else if(a.role==='raider'){ctx.strokeStyle='#79502d';ctx.lineWidth=3.3/cam.z;ctx.beginPath();ctx.moveTo(7,7);ctx.lineTo(16,-10);ctx.stroke();ctx.fillStyle='#dce4e8';ctx.beginPath();ctx.moveTo(14,-14);ctx.lineTo(22,-11);ctx.lineTo(19,-5);ctx.lineTo(14,-7);ctx.closePath();ctx.fill()}else if(a.role==='heavy'){ctx.strokeStyle='#6f4b2d';ctx.lineWidth=4/cam.z;ctx.beginPath();ctx.moveTo(8,8);ctx.lineTo(20,-17);ctx.stroke();ctx.fillStyle='#e5eaed';ctx.fillRect(16,-21,10,5)}else if(a.role==='scout'){ctx.strokeStyle='#d7a24d';ctx.lineWidth=2.4/cam.z;ctx.beginPath();ctx.arc(11,0,9,-1.25,1.25);ctx.stroke()}ctx.restore()}ctx.restore()};
document.querySelector('.brand small').textContent="Dad's Crazy Simulation • CIVILISATIONS v10.5";
