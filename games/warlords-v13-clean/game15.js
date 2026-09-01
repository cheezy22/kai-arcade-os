/* v13 R3 — immersive HUD + instant God actions */
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

  // God actions should never leave the sheet sitting over the result.
  const modal=$('modal');
  const mapPlacement=new Set(['bless','meteor','lightning','eraseArea']);
  const immediate=new Set(['feast','forest','hero','blessClan','restoreNature','cutFood','cutWood','cutStone','burnFarms','famine','quake','storm','rebellion','forcedWar','peace','curseClan','chaos']);
  function wrapGod(id){
    const b=$(id);if(!b||b.dataset.instantGod==='1')return;
    const old=b.onclick;
    b.onclick=function(ev){
      if(typeof old==='function') old.call(this,ev);
      // Placement actions already switch mode; immediate actions execute first, then reveal map.
      if(mapPlacement.has(id)||immediate.has(id)){
        modal.classList.remove('open');
        $('speedPanel')?.classList.remove('open');
      }
    };
    b.dataset.instantGod='1';
  }
  [...mapPlacement,...immediate].forEach(wrapGod);

  // Any dynamically-added God control (Agents & Clans etc.) also closes the sheet when it arms a map placement mode.
  modal.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    setTimeout(()=>{
      if(mode!=='watch' && !['close','save','load','newWorld'].includes(b.id)) modal.classList.remove('open');
    },0);
  });
  document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v13 CLEAN R3";
})();