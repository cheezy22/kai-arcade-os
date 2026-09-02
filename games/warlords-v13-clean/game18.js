/* v13 R8 — spatial AI + high-speed mobile stability */
(()=>{
  // The remaining late-game hotspot is agent decision-making: every hungry/fighting agent
  // used to scan the whole population/resource list. Build a cheap spatial index once per
  // simulation step and query nearby cells instead.
  const GRID=180;
  let agentGrid=new Map(),resourceGrid=new Map(),gridClock=-1;
  const key=(x,y)=>`${Math.floor(x/GRID)},${Math.floor(y/GRID)}`;
  function rebuildSpatial(){
    agentGrid=new Map();resourceGrid=new Map();
    for(const a of agents){if(!a.alive)continue;const k=key(a.x,a.y);let q=agentGrid.get(k);if(!q)agentGrid.set(k,q=[]);q.push(a)}
    for(const r of resources){if(r.n<=0)continue;const k=key(r.x,r.y);let q=resourceGrid.get(k);if(!q)resourceGrid.set(k,q=[]);q.push(r)}
    gridClock=clock;
  }
  function cellsAround(x,y,range,map){
    const minX=Math.floor((x-range)/GRID),maxX=Math.floor((x+range)/GRID),minY=Math.floor((y-range)/GRID),maxY=Math.floor((y+range)/GRID);let out=[];
    for(let gy=minY;gy<=maxY;gy++)for(let gx=minX;gx<=maxX;gx++){const q=map.get(`${gx},${gy}`);if(q)out.push(...q)}
    return out;
  }
  nearestEnemy=function(a,range=260){
    if(gridClock!==clock)rebuildSpatial();const clan=clans[a.c];if(!clan)return null;let best=null,bd=range*range;
    for(const o of cellsAround(a.x,a.y,range,agentGrid)){if(o===a||!o.alive||o.c===a.c||!clan.war.has(o.c))continue;const dx=o.x-a.x,dy=o.y-a.y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=o}}
    return best;
  };
  nearestResource=function(a,kind){
    if(gridClock!==clock)rebuildSpatial();let best=null,bd=320*320;
    for(const r of cellsAround(a.x,a.y,320,resourceGrid)){if(r.n<=0||(kind&&r.kind!==kind))continue;const dx=r.x-a.x,dy=r.y-a.y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=r}}
    return best;
  };

  // Rebuild the spatial index exactly before each world step, not separately for every agent.
  const spatialUpdate=update;
  update=function(dt){rebuildSpatial();spatialUpdate(dt)};

  // 100x is a time-lapse mode on iPhone: fewer, larger world steps with a hard wall-clock budget.
  // The simulation still advances quickly, but one animation frame can never monopolise the tab.
  const previousRun=runSimulation;
  runSimulation=function(realDt){
    if(paused||!$('startScreen').classList.contains('hidden'))return;
    if(!maxSpeed&&simSpeed<50)return previousRun(realDt);
    const start=performance.now();
    const budget=6;
    let remaining=maxSpeed?18:Math.min(realDt,.055)*simSpeed;
    const step=simSpeed>=100?0.8:0.45;
    const maxLoops=maxSpeed?14:(simSpeed>=500?14:simSpeed>=100?12:18);
    let loops=0;
    while(remaining>0&&loops<maxLoops){
      if(performance.now()-start>=budget)break;
      const d=Math.min(step,remaining);update(d);remaining-=d;loops++;
    }
  };

  // Expensive strategic layers do not need sub-second fidelity while fast-forwarding.
  const weaponR8=weaponTick;let weaponFastAt=-999;
  weaponTick=function(dt){if(simSpeed>=50||maxSpeed){if(clock<weaponFastAt)return;weaponFastAt=clock+2.2}weaponR8(dt)};
  const siegeR8=v115Sieges;let siegeFastAt=-999;
  v115Sieges=function(dt){if(simSpeed>=50||maxSpeed){if(clock<siegeFastAt)return;siegeFastAt=clock+2.5}siegeR8(dt)};
  const armyR8=armyTick;let armyFastAt=-999;
  armyTick=function(dt){if(simSpeed>=50||maxSpeed){if(clock<armyFastAt)return;armyFastAt=clock+3}armyR8(dt)};

  // Rendering every single RAF while doing century-scale time-lapse wastes half the phone budget.
  // At 50x+ draw every second RAF; input/UI remain responsive because the browser still gets every frame.
  const drawR8=draw;let drawFlip=false;
  draw=function(){if(simSpeed>=50||maxSpeed){drawFlip=!drawFlip;if(drawFlip)return}drawR8()};

  // Keep transient/history arrays bounded even if a centuries-long war produces constant events.
  const boundUpdate=update;
  update=function(dt){boundUpdate(dt);if(history.length>80)history.length=80;if(typeof worldChronicle!=='undefined'&&worldChronicle.length>100)worldChronicle.length=100;if(typeof refugeeFx!=='undefined'&&refugeeFx.length>70)refugeeFx.splice(0,refugeeFx.length-70);if(typeof armyOrders!=='undefined'&&armyOrders.length>24)armyOrders.splice(0,armyOrders.length-24)};

  document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v13 CLEAN R8";
})();
