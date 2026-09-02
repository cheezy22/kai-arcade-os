/* v13 R10 — clean stability governor: no R8/R9 stack, throttle autosave, cap mature-world growth, add crash diagnostics */
(()=>{
  // Tiny diagnostics badge so an iPhone screenshot tells us what was growing before a failure.
  const diag=document.createElement('div');diag.id='r10diag';diag.style.cssText='position:fixed;z-index:25;left:8px;bottom:calc(env(safe-area-inset-bottom) + 74px);background:#07111ed9;border:1px solid #34506a;border-radius:999px;padding:4px 7px;color:#cfe0ee;font:800 8px system-ui;pointer-events:none;opacity:.7';document.body.appendChild(diag);
  let diagAt=0;
  function updateDiag(){if(performance.now()<diagAt)return;diagAt=performance.now()+1000;diag.textContent=`R10 • Y${year} • A${agents.length} B${buildings.length} R${resources.length} FX${fx.length}`;diag.style.display=document.body.classList.contains('r7Immersive')?'none':'block'}

  // Preserve the last JS error for the next launch. A full iOS tab kill will not generate one,
  // but if this is a deterministic exception we will finally have evidence instead of guessing.
  function rememberError(msg){try{localStorage.setItem('wos-r10-last-error',String(msg).slice(0,700))}catch(e){}}
  addEventListener('error',e=>rememberError(`${e.message||'error'} @ ${e.filename||''}:${e.lineno||0}`));
  addEventListener('unhandledrejection',e=>rememberError(`promise: ${e.reason?.stack||e.reason||'unknown'}`));

  // Autosave was serialising the entire living world every 2 real seconds, including at 100x.
  // On iOS that creates large temporary JSON strings and repeated memory spikes. At fast-forward,
  // permit one autosave every 15 real seconds; explicit Save still goes through because silent=false.
  if(typeof persist==='function'){
    const rawPersist=persist;let lastFastPersist=0;
    persist=function(silent=false){
      if(silent&&(simSpeed>=50||maxSpeed)){
        const now=performance.now();if(now-lastFastPersist<15000)return;lastFastPersist=now;
      }
      return rawPersist(silent);
    };
  }

  // Stop mature worlds from expanding without bound. This is deliberately generous: it only
  // trims background civilians from the largest clans, never leaders, heroes or current fighters.
  function populationGovernor(){
    const HARD=360;if(agents.length<=HARD)return;
    let excess=agents.length-HARD;
    const protectedRole=new Set(['leader','guard','raider','heavy','scout']);
    const candidates=agents.filter(a=>a.alive&&!protectedRole.has(a.role)&&a!==selected).sort((a,b)=>(b.age||0)-(a.age||0));
    for(let i=0;i<candidates.length&&excess>0;i++,excess--)candidates[i].alive=false;
  }
  function worldBounds(){
    if(resources.length>260)resources.splice(0,resources.length-260);
    if(fx.length>180)fx.splice(0,fx.length-180);
    if(battles.length>36)battles.splice(0,battles.length-36);
    if(typeof weaponFx!=='undefined'&&weaponFx.length>90)weaponFx.splice(0,weaponFx.length-90);
    if(typeof siegeFx!=='undefined'&&siegeFx.length>55)siegeFx.splice(0,siegeFx.length-55);
    if(typeof projectiles!=='undefined'&&projectiles.length>100)projectiles.splice(0,projectiles.length-100);
    if(typeof refugeeFx!=='undefined'&&refugeeFx.length>40)refugeeFx.splice(0,refugeeFx.length-40);
    if(typeof armyOrders!=='undefined'&&armyOrders.length>18)armyOrders.splice(0,armyOrders.length-18);
    if(typeof worldChronicle!=='undefined'&&worldChronicle.length>90)worldChronicle.length=90;
  }

  const rawUpdate=update;let governorAt=-999;
  update=function(dt){
    rawUpdate(dt);
    if(clock>=governorAt){governorAt=clock+2;populationGovernor();worldBounds()}
  };

  // Replace every earlier high-speed wrapper with one conservative time-lapse loop.
  // 100x is still ~100 simulation seconds per real second when the phone has headroom,
  // but no animation frame gets more than ~4ms of simulation work.
  runSimulation=function(realDt){
    if(paused||!$('startScreen').classList.contains('hidden'))return;
    if(!maxSpeed&&simSpeed<=20){let remaining=realDt*simSpeed,loops=0;const step=simSpeed<=8?.035:.06;while(remaining>0&&loops<120){const d=Math.min(step,remaining);update(d);remaining-=d;loops++}return}
    const start=performance.now();
    const budget=4;
    const target=maxSpeed?8:Math.min(realDt,.045)*simSpeed;
    const step=simSpeed>=100?.5:.22;
    let remaining=target,loops=0;
    const maxLoops=simSpeed>=100?9:14;
    while(remaining>0&&loops<maxLoops&&performance.now()-start<budget){const d=Math.min(step,remaining);update(d);remaining-=d;loops++}
  };

  const rawDraw=draw;let flip=false;
  draw=function(){updateDiag();if(simSpeed>=50||maxSpeed){flip=!flip;if(flip)return}rawDraw()};

  const err=(()=>{try{return localStorage.getItem('wos-r10-last-error')}catch(e){return null}})();
  if(err){setTimeout(()=>say('🧪 Previous JS error: '+err,true),1200);try{localStorage.removeItem('wos-r10-last-error')}catch(e){}}
  document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v13 CLEAN R10";
})();
