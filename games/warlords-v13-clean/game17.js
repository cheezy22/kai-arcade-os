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

  let portraitHidden=false,landscapeHidden=true,lastLandscape=innerWidth>innerHeight;
  const hud=$('hudToggle');
  function isLandscape(){return innerWidth>innerHeight}
  function applyR7HUD(){
    const land=isLandscape(),hidden=land?landscapeHidden:portraitHidden;
    document.body.classList.toggle('r7Immersive',hidden);
    document.body.classList.remove('immersive');
    if(hud){hud.textContent=hidden?'☰':'👁';hud.classList.toggle('r7Hidden',hidden);hud.classList.toggle('r7Shown',!hidden)}
    if(typeof historyBtn!=='undefined'&&historyBtn)historyBtn.style.display=hidden?'none':'';
    if(hidden&&typeof inspectBox!=='undefined'&&inspectBox)inspectBox.style.display='none';
    if(hidden)$('speedPanel')?.classList.remove('open');
  }
  if(hud)hud.onclick=()=>{if(isLandscape())landscapeHidden=!landscapeHidden;else portraitHidden=!portraitHidden;applyR7HUD()};
  function settleRotation(){setTimeout(()=>{const land=isLandscape();if(land!==lastLandscape&&land)landscapeHidden=true;lastLandscape=land;resize();clampCamera();applyR7HUD()},260)}
  addEventListener('resize',settleRotation);addEventListener('orientationchange',settleRotation);applyR7HUD();

  const rawRoadTarget=v115RoadTarget;
  v115RoadTarget=function(a){
    if(a&&a._r7RoadUntil>clock)return a._r7RoadTarget||null;
    const target=rawRoadTarget(a);
    if(a){a._r7RoadUntil=clock+2;a._r7RoadTarget=target||null}
    return target;
  };

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

  const rawRoadRebuild=rebuildRoadNetwork;let lastRoadRebuild=-999;
  rebuildRoadNetwork=function(){if(clock-lastRoadRebuild<10)return;lastRoadRebuild=clock;rawRoadRebuild()};
  const rawSettlementRebuild=rebuildSettlements;let lastSettlementRebuild=-999;
  rebuildSettlements=function(){if(clock-lastSettlementRebuild<8)return;lastSettlementRebuild=clock;rawSettlementRebuild()};

  const rawAddBuilding=addBuilding;
  addBuilding=function(c,x,y,type='camp'){
    if(type!=='castle'&&mode!=='build'){
      let own=0;for(const b of buildings)if(b.hp>0&&b.c===c)own++;
      if(own>=36||buildings.length>=520)return null;
    }
    return rawAddBuilding(c,x,y,type);
  };

  document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v13 CLEAN R7";
})();
const r10=document.createElement('script');r10.src='game20.js';document.body.appendChild(r10);
