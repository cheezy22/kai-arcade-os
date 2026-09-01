/* v12.2 obvious + reliable God population controls */
(function(){
let godUiLastClanCount=-1;
function makePanel(){
  const sheet=document.querySelector('#modal .sheet');
  if(!sheet)return;
  let wrap=document.getElementById('godPopPanel');
  if(!wrap){
    const worldSection=[...sheet.querySelectorAll('.section')].find(x=>x.textContent.trim()==='World');
    if(!worldSection)return;
    wrap=document.createElement('div');wrap.id='godPopPanel';
    wrap.innerHTML=`<div class="section">👥 AGENTS & CLANS</div><div class="card" style="margin:6px 0 10px"><b>Choose clan</b><div id="godPopClans" style="display:flex;gap:6px;overflow-x:auto;min-height:44px;margin:8px 0"></div><div class="mini" id="godPopHint">Pick a clan, role and amount. Role buttons add 1 immediately; Spawn on Map uses the chosen amount.</div><div class="grid" style="grid-template-columns:repeat(3,1fr)"><button data-poprole="random">🎲 Random</button><button data-poprole="worker">🧺 Worker</button><button data-poprole="builder">🔨 Builder</button><button data-poprole="guard">🛡 Guard</button><button data-poprole="raider">🪓 Raider</button><button data-poprole="scout">🏹 Scout</button><button data-poprole="medic">➕ Medic</button><button data-poprole="heavy">🔨 Heavy</button><button data-poprole="leader">👑 Leader</button></div><div class="grid"><button data-popcount="1" class="on">+1</button><button data-popcount="5">+5</button><button data-popcount="10">+10</button><button data-popcount="25">+25</button></div><div class="grid" style="grid-template-columns:1fr 1fr"><button id="godSpawnMap" style="background:#d8ecff">📍 Spawn on Map</button><button id="godCreateClan" style="background:#ffe5a8">🏳️ Create New Clan</button></div></div>`;
    sheet.insertBefore(wrap,worldSection);
    wrap.querySelectorAll('[data-poprole]').forEach(b=>b.onclick=()=>{godSpawnRole=b.dataset.poprole;wrap.querySelectorAll('[data-poprole]').forEach(x=>x.classList.toggle('on',x===b));godSpawnHome(godSpawnRole,1);renderClanPicks()});
    wrap.querySelectorAll('[data-popcount]').forEach(b=>b.onclick=()=>{godSpawnCount=+b.dataset.popcount;wrap.querySelectorAll('[data-popcount]').forEach(x=>x.classList.toggle('on',x===b))});
    document.getElementById('godSpawnMap').onclick=()=>{if(!clans.length){say('👥 Create a world first.',true);return}godAgentTapMode={role:godSpawnRole,count:godSpawnCount};$('modal').classList.remove('open');mode='godagentspawn';$('focus').textContent=`👥 SPAWN ${godSpawnCount} ${godSpawnRole.toUpperCase()} • tap map`};
    document.getElementById('godCreateClan').onclick=()=>{$('modal').classList.remove('open');mode='godcreateclan';$('focus').textContent='🏳️ CREATE NEW CLAN • tap an empty place on map'};
  }
  renderClanPicks();
}
function renderClanPicks(){
  let el=document.getElementById('godPopClans');if(!el)return;
  if(!clans.length){el.innerHTML='<span style="padding:11px;color:#687480">No clans yet — start or load a world.</span>';return}
  if(!clans[godAgentClan])godAgentClan=clans[0].id;
  el.innerHTML='';
  for(const c of clans){let b=document.createElement('button');b.textContent=`${c.em} ${c.name}`;b.dataset.godpick=c.id;b.style.cssText=`flex:0 0 auto;min-width:92px;background:${c.color};color:white;border:3px solid ${c.id===godAgentClan?'#111':'transparent'};box-shadow:${c.id===godAgentClan?'0 0 0 2px #fff inset':'none'}`;b.onclick=()=>{godAgentClan=c.id;renderClanPicks()};el.appendChild(b)}
  godUiLastClanCount=clans.length;
  let hint=document.getElementById('godPopHint'),c=clans[godAgentClan];if(hint&&c)hint.textContent=`Selected: ${c.em} ${c.name}. Choose a role or amount, then Spawn on Map.`;
}
function createGodClanAt(x,y){
  if(clans.length>=16){say('🏳️ The world is at the 16-clan safety limit.',true);return null}
  let id=clans.length,base=(typeof fractureNames!=='undefined'?fractureNames[id%fractureNames.length]:null)||`Godborn ${id+1}`,name=`${base} Dominion`,color=`hsl(${Math.floor((id*137.5+47)%360)} 72% 54%)`,em=(typeof fractureEm!=='undefined'&&fractureEm[id%fractureEm.length])||'🏳️';
  let c={id,name,em,color,home:{x,y},food:140,wood:100,stone:70,morale:88,rage:18,wealth:55,trait:pick(PERSONAL),war:new Set(),allies:new Set(),relations:{},kills:0,deaths:0,territory:0,leader:null,hero:null,grudge:{},buildClock:R(5,10),dipClock:R(6,12),dynastyName:pick(['Godborn','Hearth','Crisp','McCrumb','Thorn'])};
  clans.push(c);addBuilding(id,x,y,'castle');addBuilding(id,x+R(-75,75),y+R(-75,75),'farm');
  for(let i=0;i<10;i++)spawnAgent(id,x+R(-80,80),y+R(-80,80),i<2?'guard':pick(['worker','builder','scout','medic']));
  let chief=spawnAgent(id,x+R(-20,20),y+R(-20,20),'leader');chief.name='Chief '+chief.name.replace(/^Chief /,'');chief.fame=12;c.leader=chief;c.rulerDynasty=chief.dynasty||c.dynastyName;godAgentClan=id;
  if(typeof rebuildSettlements==='function')rebuildSettlements();say(`🏳️ The gods create ${c.name} from nothing.`,true);burst(x,y,color);renderClanPicks();return c
}
/* Route both special map modes through godTap itself so iPhone pointer handling cannot swallow them. */
const godTapV122=godTap;
godTap=function(sx,sy){
  let p=worldPoint(sx,sy);
  if(mode==='godcreateclan'){createGodClanAt(clamp(p.x,80,WORLD.w-80),clamp(p.y,80,WORLD.h-80));mode='watch';$('focus').textContent='👁 WATCH • tap people/buildings • drag • pinch zoom';return}
  if(mode==='godagentspawn'&&godAgentTapMode){let c=godClan();if(c){godSpawnAt(c,godAgentTapMode.role,godAgentTapMode.count,clamp(p.x,20,WORLD.w-20),clamp(p.y,20,WORLD.h-20));say(`⚡ ${godAgentTapMode.count} ${godAgentTapMode.role} appear for ${c.name}.`,true);burst(p.x,p.y,c.color)}godAgentTapMode=null;mode='watch';$('focus').textContent='👁 WATCH • tap people/buildings • drag • pinch zoom';return}
  godTapV122(sx,sy)
};
/* The old v11.6 pointerup handler sees watch mode after godTap now, so it becomes harmless. */
const more=document.getElementById('more'),old=more.onclick;more.onclick=function(e){if(old)old.call(this,e);makePanel();setTimeout(renderClanPicks,0)};
const renderCardsV122=renderCards;renderCards=function(){renderCardsV122();if($('modal').classList.contains('open')){makePanel();if(godUiLastClanCount!==clans.length)renderClanPicks()}};
makePanel();
document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v12.2";
})();
