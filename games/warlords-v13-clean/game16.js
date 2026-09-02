/* v13 R6 — disasters must be visible, readable and materially affect the world */
(()=>{
  const style=document.createElement('style');
  style.textContent=`
    #disasterFlash{position:fixed;z-index:19;inset:0;pointer-events:none;opacity:0;display:flex;align-items:center;justify-content:center;text-align:center;font:1000 clamp(24px,8vw,58px)/1 system-ui;text-shadow:0 4px 18px #000;color:#fff}
    #disasterFlash.show{animation:disasterFlash .95s ease-out}
    #disasterFlash .sub{display:block;font-size:12px;margin-top:10px;letter-spacing:.08em}
    @keyframes disasterFlash{0%{opacity:0}12%{opacity:1}55%{opacity:.82}100%{opacity:0}}
    #world.quakeShake{animation:quakeShake .72s linear}
    @keyframes quakeShake{0%,100%{transform:translate(0,0)}10%{transform:translate(-8px,5px)}20%{transform:translate(9px,-5px)}30%{transform:translate(-7px,-6px)}40%{transform:translate(8px,6px)}50%{transform:translate(-5px,3px)}60%{transform:translate(6px,-4px)}75%{transform:translate(-3px,3px)}}
  `;
  document.head.appendChild(style);
  const flash=document.createElement('div');flash.id='disasterFlash';document.body.appendChild(flash);
  function announce(icon,title,sub,bg='rgba(80,20,10,.45)'){
    flash.style.background=bg;flash.innerHTML=`<div>${icon} ${title}<span class="sub">${sub||''}</span></div>`;
    flash.classList.remove('show');void flash.offsetWidth;flash.classList.add('show');
  }
  function boundedFx(x,y,color,text='•',n=24,spread=80){
    for(let i=0;i<n;i++)fx.push({x:x+R(-spread,spread),y:y+R(-spread,spread),vx:R(-90,90),vy:R(-100,45),life:R(.5,1.1),max:1.1,text:i<n*.3?text:'•',color});
    if(fx.length>220)fx.splice(0,fx.length-220);
  }
  function aliveClanAgents(cid){return agents.filter(a=>a.alive&&a.c===cid)}

  // Meteor: unmistakable local catastrophe, but bounded so it cannot freeze a mature phone world.
  meteor=function(x,y){
    const radius=165,inner=72;let killed=0,damaged=0,destroyed=0;
    for(const a of agents){if(!a.alive)continue;const d=Math.hypot(a.x-x,a.y-y);if(d>radius)continue;const f=1-d/radius;a.hp-=55+f*145;a.morale=Math.max(0,(a.morale||50)-35);if(d<inner||a.hp<=0){a.alive=false;killed++}else{a.vx=(a.vx||0)+(a.x-x)/Math.max(8,d)*(90+f*130);a.vy=(a.vy||0)+(a.y-y)/Math.max(8,d)*(90+f*130)}}
    for(const b of buildings){if(!b||b.hp<=0)continue;const d=Math.hypot(b.x-x,b.y-y);if(d>radius)continue;const f=1-d/radius;const hit=55+f*150;b.hp-=hit;damaged++;if(b.type!=='castle'&&b.hp<=0){b.hp=0;destroyed++}else if(b.type==='castle')b.hp=Math.max(1,b.hp)}
    boundedFx(x,y,'#ffb05a','🔥',42,70);if(battles.length<45)battles.push({x,y,life:1.6,max:1.6});
    announce('☄️','METEOR STRIKE',`${killed} dead • ${destroyed} buildings destroyed`,'rgba(255,80,20,.48)');
    say(`☄️ METEOR: ${killed} souls killed, ${damaged} buildings hit, ${destroyed} destroyed.`,true);
  };

  lightning=function(x,y){
    let killed=0,hit=0;for(const a of agents){if(!a.alive)continue;const d=Math.hypot(a.x-x,a.y-y);if(d<82){hit++;a.hp-=R(85,145);a.morale=Math.max(0,(a.morale||50)-25);if(a.hp<=0){a.alive=false;killed++}}}
    for(const b of buildings){if(b.hp>0&&Math.hypot(b.x-x,b.y-y)<58)b.hp=Math.max(1,b.hp-R(18,48))}
    boundedFx(x,y,'#fff28a','⚡',24,28);announce('⚡','LIGHTNING',`${hit} struck • ${killed} killed`,'rgba(235,245,255,.58)');say(`⚡ LIGHTNING: ${hit} struck, ${killed} killed.`,true);
  };

  quake=function(){
    let damaged=0,destroyed=0,injured=0;
    for(const b of buildings){if(b.hp<=0)continue;if(Math.random()<.78){const hit=R(45,115);b.hp-=hit;damaged++;if(b.type!=='castle'&&b.hp<=0){b.hp=0;destroyed++}else if(b.type==='castle')b.hp=Math.max(1,b.hp)}}
    for(const a of agents){if(!a.alive)continue;a.x=clamp(a.x+R(-65,65),12,WORLD.w-12);a.y=clamp(a.y+R(-65,65),12,WORLD.h-12);a.morale=Math.max(0,(a.morale||50)-R(8,22));if(Math.random()<.18){a.hp-=R(8,30);injured++;if(a.hp<=0)a.alive=false}}
    for(let i=0;i<28;i++)boundedFx(R(0,WORLD.w),R(0,WORLD.h),'#c98c57','•',1,18);
    C.classList.remove('quakeShake');void C.offsetWidth;C.classList.add('quakeShake');announce('🌋','EARTHQUAKE',`${damaged} buildings hit • ${destroyed} destroyed`,'rgba(120,65,25,.5)');say(`🌋 EARTHQUAKE: ${damaged} buildings damaged, ${destroyed} destroyed, ${injured} souls injured.`,true);
  };

  let stormUntil=0,stormNext=0;
  divineStorm=function(){stormUntil=Math.max(stormUntil,clock+14);stormNext=clock;announce('🌪️','DIVINE STORM','14 years of violent weather','rgba(35,75,105,.52)');say('🌪 DIVINE STORM: violent winds batter the world.',true)};

  famineClan=function(){
    if(!clans.length)return;let c=clans.slice().sort((a,b)=>(a.food||0)-(b.food||0))[0];if(!c)return;
    c.food=0;c.morale=Math.max(5,(c.morale||50)-35);c.rage=Math.min(100,(c.rage||0)+25);let afflicted=0;
    for(const a of aliveClanAgents(c.id)){a.hunger=Math.max(a.hunger||0,82);a.morale=Math.max(0,(a.morale||50)-25);if(Math.random()<.22)a.hp-=R(5,18);afflicted++}
    resources=resources.filter(r=>!(r.kind==='food'&&Math.hypot(r.x-c.home.x,r.y-c.home.y)<330));
    announce('☠️','FAMINE',`${c.name} • ${afflicted} souls starving`,'rgba(80,70,25,.5)');say(`☠️ FAMINE grips ${c.name}: stores emptied and ${afflicted} souls are starving.`,true);
  };

  burnFarms=function(){
    const farms=buildings.filter(b=>b.hp>0&&b.type==='farm');let burned=0;
    for(const b of farms){if(Math.random()<.72){b.hp=0;burned++;boundedFx(b.x,b.y,'#ff9a4d','🔥',7,16)}}
    announce('🔥','FARMS BURN',`${burned} of ${farms.length} farms destroyed`,'rgba(145,45,15,.48)');say(`🔥 FARM FIRES: ${burned} of ${farms.length} farms destroyed.`,true);
  };

  const disasterUpdate=update;update=function(dt){
    disasterUpdate(dt);
    if(clock<stormUntil){
      const gust=55*dt;for(const a of agents){if(!a.alive)continue;a.vx=(a.vx||0)+R(-gust,gust);a.vy=(a.vy||0)+R(-gust,gust);if(Math.random()<dt*.018){a.hp-=R(2,9);a.morale=Math.max(0,(a.morale||50)-2)}}
      if(clock>=stormNext){stormNext=clock+1.2;let x=R(40,WORLD.w-40),y=R(40,WORLD.h-40);boundedFx(x,y,'#cfe9ff','／',10,75)}
    }
  };

  document.querySelector('.brand small').textContent="Dad's Crazy Simulation • FRACTURE v13 CLEAN R6";
})();