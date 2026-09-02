/* v13 R7 — rotation-safe HUD + mobile performance governor */
(()=>{
  const style=document.createElement('style');
  style.textContent=`
    body.r7Immersive #top,body.r7Immersive #headline,body.r7Immersive #focus,body.r7Immersive #feed,body.r7Immersive #bar,body.r7Immersive #speedPanel{display:none!important}
    body.r7Immersive #inspectBox{display:none!important}
    #hudToggle.r7Shown{bottom:calc(env(safe-area-inset-bottom) + 72px)!important}
    #hudToggle.r7Hidden{bottom:max(8px,env(safe-area-inset-bottom))!important}
  `;
  document.head.appendChild(style);

  // One deterministic HUD state: landscape always immersive; portrait remembers the user's choice.
  let portraitHidden=false;
  const hud=$('hudToggle');
  function isLandscape(){return innerWidth>innerHeight}
  function applyR7HUD(){
    const hidden=isLandscape()||portraitHidden;
    document.body.classList.toggle('r7Immersive',hidden);
    // Neutralise the older R5 state so rotations cannot leave two competing HUD modes behind.
    document.body.classList.remove('immersive');
    if(hud){hud.textContent=hidden?'☰':'👁';hud.classList.toggle('r7Hidden',hidden);hud.classList.toggle('r7Shown',!hidden)}
    if(typeof historyBtn!=='undefined'&&historyBtn)historyBtn.style.display=hidden?'none':'';
    if(hidden&&typeof inspectBox!=='undefined'&&inspectBox)inspectBox.style.display='none';
    if(hidden)$('speedPanel')?.classList.remove('open');
  }
  if(hud)hud.onclick=()=>{if(isLandscape())return;portraitHidden=!portraitHidden;applyR7HUD()};
  function settleRotation(){setTimeout(()=>{resize();clampCamera();applyR7HUD()},260)}
  addEventListener('resize',settleRotation);addEventListener('orientationchange',settleRotation);applyR7HUD();

  // Cache road choices per person instead of rescanning every building on movement calls.
  const rawRoadTarget=v115RoadTarget;
  v115RoadTarget=function(a){
    if(a&&a._r7RoadUntil>clock)return a._r7RoadTarget||null;
    const target=rawRoadTarget(a);
    if(a){a._r7RoadUntil=clock+2;a._r7RoadTarget=target||null}
    return target;
  };

  // Mature worlds were doing these population-wide systems on nearly every high-speed substep.
  const rawWeaponTick=weaponTick;let nextWeapon=-999;
  weaponTick=function(dt){if(clock<nextWeapon)return;nextWeapon=clock+.7;rawWeaponTick(Math.min(.55,Math.max(.12,dt)))};
  const rawArmyTick=armyTick;let nextArmy=-999;
  armyTick=function(dt){if(clock<nextArmy)return;const elapsed=Math.max(.8,clock-nextArmy+.8);nextArmy=clock+1.1;rawArmyTick(Math.min(1.2,elapsed))};
  const rawSuccessionTick=successionTick;let nextSuccession=-999;
  successionTick=function(dt){if(clock<nextSuccession)return;nextSuccession=clock+1.4;rawSuccessionTick(1.4)};
  const rawSieges=v115Sieges;let nextSiege=-999;
  v115Sieges=function(dt){if(clock<nextSiege)return;nextSiege=clock+.9;rawSieges(Math.min(.7,Math.max(.18,dt)))};
  const rawRefugeeArrival=refugeeArrivalTick;let nextRefugeeArrival=-999;
  refugeeArrivalTick=function(){if(clock<nextRefugeeArrival)return;nextRefugeeArrival=clock+1.4;rawRefugeeArrival()};

  // Roads and settlement census are useful strategic summaries, not frame-by-frame physics.
  const rawRoadRebuild=rebuildRoadNetwork;let lastRoadRebuild=-999;
  rebuildRoadNetwork=function(){if(clock-lastRoadRebuild<10)return;lastRoadRebuild=clock;rawRoadRebuild()};
  const rawSettlementRebuild=rebuildSettlements;let lastSettlementRebuild=-999;
  rebuildSettlements=function(){if(clock-lastSettlementRebuild<8)return;lastSettlementRebuild=clock;rawSettlementRebuild()};

  // Stop centuries-old autonomous cities creating an unlimited building graph on a phone.
  const rawAddBuilding=addBuilding;
  addBuilding=function(c,x,y,type='camp'){
    if(type!=='castle'&&mode!=='build'){
      let own=0;for(const b of buildings)if(b.hp>0&&b.c===c)own++;
      if(own>=36||buildings.length>=520)return null;
    }
    return rawAddBuilding(c,x,y,type);
  };

  // 500x/1000x previously had no real-time budget and could attempt ~90 heavy world updates in one frame.
  // This keeps fast-forward fast but yields to iOS every frame instead of locking the tab until it dies.
  const rawRunSimulation=runSimulation;
  runSimulation=function(realDt){
    if(paused||!$('startScreen').classList.contains('hidden'))return;
    if(!maxSpeed&&simSpeed<=20)return rawRunSimulation(realDt);
    const start=performance.now();
    const budget=simSpeed<=100?10:8;
    let remaining=(maxSpeed?24:realDt*simSpeed);
    const step=maxSpeed||simSpeed>=500?.75:simSpeed>=100?.32:.16;
    const maxLoops=maxSpeed?24:simSpeed>=500?22:simSpeed>=100?30:45;
    let loops=0;
    while(remaining>0&&loops<maxLoops&&performance.now()-start<budget){const d=Math.min(step,remaining);update(d);remaining-=d;loops++}
  };

  document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v13 CLEAN R7";
})();
