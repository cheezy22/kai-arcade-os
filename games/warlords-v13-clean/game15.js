/* v13 R4 — immersive HUD + instant God actions + safe meteor */
(()=>{
  const HIDE_IDS=['top','headline','focus','feed','bar','speedPanel'];
  let portraitImmersive=false;
  let landscapeImmersive=matchMedia('(orientation: landscape)').matches;
  const style=document.createElement('style');
  style.textContent=`
    body.immersive #top,body.immersive #headline,body.immersive #focus,body.immersive #feed,body.immersive #bar,body.immersive #speedPanel{display:none!important}
    #hudToggle{position:fixed;z-index:26;right:max(8px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom));width:42px;height:42px;border-radius:50%;background:#0d1723d9;color:#fff;border:1px solid #40566b;font-size:17px;padding:0;box-shadow:0 4px 18px #0008}
    .modal.open~#hudToggle,.modal.open #hudToggle{display:none}
    @media (orientation:landscape){#hudToggle{opacity:.72}}
  `;
  document.head.appendChild(style);
  const hud=document.createElement('button');hud.id='hudToggle';hud.textContent='👁';hud.title='Show/hide interface';document.body.appendChild(hud);
  function applyHUD(){
    const land=matchMedia('(orientation: landscape)').matches;
    const hide=land?landscapeImmersive:portraitImmersive;
    document.body.classList.toggle('immersive',hide);
    hud.textContent=hide?'☰':'👁';
  }
  hud.onclick=()=>{
    const land=matchMedia('(orientation: landscape)').matches;
    if(land) landscapeImmersive=!landscapeImmersive; else portraitImmersive=!portraitImmersive;
    applyHUD();
  };
  addEventListener('orientationchange',()=>setTimeout(applyHUD,120));
  addEventListener('resize',applyHUD);applyHUD();

  // Replace the old meteor with a bounded version. The old effect could cascade through
  // too many agents/buildings/FX at once and lock the phone on a mature world.
  meteor=function(x,y){
    const radius=125, inner=55;
    let killed=0, damaged=0;
    for(const a of agents){
      if(!a.alive)continue;
      const d=Math.hypot(a.x-x,a.y-y);if(d>radius)continue;
      const force=1-d/radius;
      a.hp-=35+force*100;
      a.vx=(a.vx||0)+(a.x-x)/Math.max(8,d)*(70+force*110);
      a.vy=(a.vy||0)+(a.y-y)/Math.max(8,d)*(70+force*110);
      if(d<inner||a.hp<=0){a.alive=false;killed++}
    }
    for(const b of buildings){
      if(!b||b.hp<=0)continue;
      const d=Math.hypot(b.x-x,b.y-y);if(d>radius)continue;
      const force=1-d/radius;
      b.hp=Math.max(1,b.hp-(25+force*95));
      damaged++;
    }
    // Keep spectacle bounded so a late-game world cannot generate thousands of objects in one tap.
    for(let i=0;i<34;i++)fx.push({x:x+R(-34,34),y:y+R(-34,34),vx:R(-90,90),vy:R(-120,45),life:R(.45,.9),max:.9,text:i<8?'🔥':'•',color:i<8?'#ffb05a':'#ffd9a1'});
    if(fx.length>260)fx.splice(0,fx.length-260);
    battles.push({x,y,life:1.25,max:1.25});
    say(`☄️ Meteor strike — ${killed} souls lost, ${damaged} buildings damaged.`,true);
  };

  // God actions should never leave the sheet sitting over the result.
  const modal=$('modal');
  const mapPlacement=new Set(['bless','meteor','lightning','eraseArea']);
  const immediate=new Set(['feast','forest','hero','blessClan','restoreNature','cutFood','cutWood','cutStone','burnFarms','famine','quake','storm','rebellion','forcedWar','peace','curseClan','chaos']);
  function wrapGod(id){
    const b=$(id);if(!b||b.dataset.instantGod==='1')return;
    const old=b.onclick;
    b.onclick=function(ev){
      if(typeof old==='function') old.call(this,ev);
      if(mapPlacement.has(id)||immediate.has(id)){
        modal.classList.remove('open');
        $('speedPanel')?.classList.remove('open');
      }
    };
    b.dataset.instantGod='1';
  }
  [...mapPlacement,...immediate].forEach(wrapGod);
  modal.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    setTimeout(()=>{
      if(mode!=='watch' && !['close','save','load','newWorld'].includes(b.id)) modal.classList.remove('open');
    },0);
  });
  document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v13 CLEAN R4";
})();