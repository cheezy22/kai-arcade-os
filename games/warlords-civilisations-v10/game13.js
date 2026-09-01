/* v12.3 hard fix: live clan picker + iPhone-safe God placement */
(function(){
function liveClanButtons(){
  const el=document.getElementById('godPopClans'); if(!el)return;
  const current=[...el.querySelectorAll('[data-godpick]')].map(b=>Number(b.dataset.godpick));
  const ids=clans.map(c=>c.id);
  const needs=current.length!==ids.length||current.some((id,i)=>id!==ids[i])||el.textContent.includes('No clans yet');
  if(!needs)return;
  if(!clans.length){el.innerHTML='<span style="padding:11px;color:#687480">No clans yet — start or load a world.</span>';return}
  if(!clans.some(c=>c.id===godAgentClan))godAgentClan=clans[0].id;
  el.innerHTML='';
  for(const c of clans){
    const b=document.createElement('button'); b.dataset.godpick=String(c.id); b.textContent=`${c.em} ${c.name}`;
    b.style.cssText=`flex:0 0 auto;min-width:96px;padding:10px 9px;background:${c.color};color:#fff;border:3px solid ${c.id===godAgentClan?'#111':'transparent'};box-shadow:${c.id===godAgentClan?'0 0 0 2px #fff inset':'none'}`;
    b.onclick=()=>{godAgentClan=c.id;document.querySelectorAll('#godPopClans [data-godpick]').forEach(x=>{let on=Number(x.dataset.godpick)===godAgentClan;x.style.borderColor=on?'#111':'transparent';x.style.boxShadow=on?'0 0 0 2px #fff inset':'none'});let h=document.getElementById('godPopHint');if(h)h.textContent=`Selected: ${c.em} ${c.name}. Choose role/count, then Spawn on Map.`};
    el.appendChild(b);
  }
  const chosen=clans.find(c=>c.id===godAgentClan)||clans[0],h=document.getElementById('godPopHint');
  if(h&&chosen)h.textContent=`Selected: ${chosen.em} ${chosen.name}. Choose role/count, then Spawn on Map.`;
}
function ensurePanelReady(){
  if(typeof liveClanButtons!=='function')return;
  liveClanButtons();
  const panel=document.getElementById('godPopPanel'); if(!panel)return;
  const create=document.getElementById('godCreateClan'),spawn=document.getElementById('godSpawnMap');
  if(create&&!create.dataset.v123){create.dataset.v123='1';create.onclick=()=>{$('modal').classList.remove('open');mode='godcreateclan';$('focus').textContent='🏳️ CREATE NEW CLAN • tap the map'};}
  if(spawn&&!spawn.dataset.v123){spawn.dataset.v123='1';spawn.onclick=()=>{if(!clans.length){say('👥 Create a world first.',true);return}if(!clans.some(c=>c.id===godAgentClan))godAgentClan=clans[0].id;godAgentTapMode={role:godSpawnRole,count:godSpawnCount};$('modal').classList.remove('open');mode='godagentspawn';$('focus').textContent=`👥 SPAWN ${godSpawnCount} ${godSpawnRole.toUpperCase()} • tap map`};}
}
/* Keep the picker synchronised independently of renderCards. */
setInterval(()=>{if(document.getElementById('modal')?.classList.contains('open'))ensurePanelReady()},250);
const more=document.getElementById('more');more.addEventListener('click',()=>{setTimeout(ensurePanelReady,0);setTimeout(ensurePanelReady,120)});
for(const id of ['startNew','continueWorld'])document.getElementById(id)?.addEventListener('click',()=>setTimeout(ensurePanelReady,120));
/* Capture the tap before drag/pointer handlers can swallow it on iPhone. */
C.addEventListener('pointerup',e=>{
  if(mode!=='godcreateclan'&&mode!=='godagentspawn')return;
  const r=C.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top,p=worldPoint(sx,sy);
  if(mode==='godcreateclan'){
    if(typeof createGodClanAt==='function')createGodClanAt(clamp(p.x,80,WORLD.w-80),clamp(p.y,80,WORLD.h-80));
    else {say('🏳️ Clan creation unavailable.',true)}
  } else if(godAgentTapMode){
    const c=godClan(); if(c){godSpawnAt(c,godAgentTapMode.role,godAgentTapMode.count,clamp(p.x,20,WORLD.w-20),clamp(p.y,20,WORLD.h-20));say(`⚡ ${godAgentTapMode.count} ${godAgentTapMode.role} appear for ${c.name}.`,true);burst(p.x,p.y,c.color)}
    godAgentTapMode=null;
  }
  mode='watch';$('focus').textContent='👁 WATCH • tap people/buildings • drag • pinch zoom';
},true);
ensurePanelReady();
document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v12.3";
})();
