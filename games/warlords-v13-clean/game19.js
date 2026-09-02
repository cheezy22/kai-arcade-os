/* v13 R9 — fix spatial-index regression: rebuild once per world step, never per agent query */
(()=>{
  const GRID=180;
  let aGrid=new Map(),rGrid=new Map();
  const key=(x,y)=>`${Math.floor(x/GRID)},${Math.floor(y/GRID)}`;
  function put(map,k,v){let q=map.get(k);if(!q)map.set(k,q=[]);q.push(v)}
  function rebuild(){
    aGrid.clear();rGrid.clear();
    for(const a of agents)if(a.alive)put(aGrid,key(a.x,a.y),a);
    for(const r of resources)if(r.n>0)put(rGrid,key(r.x,r.y),r);
  }
  function eachNearby(map,x,y,range,fn){
    const minX=Math.floor((x-range)/GRID),maxX=Math.floor((x+range)/GRID),minY=Math.floor((y-range)/GRID),maxY=Math.floor((y+range)/GRID);
    for(let gy=minY;gy<=maxY;gy++)for(let gx=minX;gx<=maxX;gx++){
      const q=map.get(`${gx},${gy}`);if(!q)continue;
      for(let i=0;i<q.length;i++)fn(q[i]);
    }
  }
  nearestEnemy=function(a,range=260){
    const clan=clans[a.c];if(!clan)return null;let best=null,bd=range*range;
    eachNearby(aGrid,a.x,a.y,range,o=>{if(o===a||!o.alive||o.c===a.c||!clan.war.has(o.c))return;const dx=o.x-a.x,dy=o.y-a.y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=o}});
    return best;
  };
  nearestResource=function(a,kind){
    let best=null,bd=320*320;
    eachNearby(rGrid,a.x,a.y,320,r=>{if(r.n<=0||(kind&&r.kind!==kind))return;const dx=r.x-a.x,dy=r.y-a.y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=r}});
    return best;
  };

  // Critical fix: R8 keyed its cache to `clock`, but base update increments clock before
  // agent AI runs. That made every nearestEnemy/nearestResource call rebuild the whole grid.
  // Build our index exactly once before the wrapped world update instead.
  const r9Update=update;
  update=function(dt){rebuild();r9Update(dt)};

  // Slightly tighter fast-forward budget until the long-run test proves stable.
  const r9Run=runSimulation;
  runSimulation=function(realDt){
    if(paused||!$('startScreen').classList.contains('hidden'))return;
    if(!maxSpeed&&simSpeed<50)return r9Run(realDt);
    const start=performance.now(),budget=5;
    let remaining=maxSpeed?15:Math.min(realDt,.05)*simSpeed;
    const step=simSpeed>=100?.65:.4;
    const maxLoops=simSpeed>=100?10:15;
    let loops=0;
    while(remaining>0&&loops<maxLoops&&performance.now()-start<budget){const d=Math.min(step,remaining);update(d);remaining-=d;loops++}
  };

  document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v13 CLEAN R9";
})();
