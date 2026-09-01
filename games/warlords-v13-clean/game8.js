/* v11.1 organic roads — roads connect useful neighbours, not every building to the castle */
let roadNetwork=[],roadClock=0;
function roadKey(a,b){const A=buildings.indexOf(a),B=buildings.indexOf(b);return A<B?A+':'+B:B+':'+A}
function roadCurve(a,b,seed){
 const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 const bend=Math.sin(seed*12.9898)*Math.min(48,len*.16);
 return [{x:a.x,y:a.y},{x:a.x+dx*.34+nx*bend,y:a.y+dy*.34+ny*bend},{x:a.x+dx*.68-nx*bend*.55,y:a.y+dy*.68-ny*bend*.55},{x:b.x,y:b.y}]
}
function rebuildRoadNetwork(){roadNetwork=[];const used=new Set();for(const c of clans){const own=buildings.filter(b=>b.hp>0&&b.c===c.id);if(own.length<2)continue;
 // Each structure joins its closest sensible neighbour. This produces branches instead of castle spokes.
 for(const b of own){let choices=own.filter(o=>o!==b).map(o=>({o,d:Math.hypot(o.x-b.x,o.y-b.y)})).filter(q=>q.d<330).sort((x,y)=>x.d-y.d);if(!choices.length)continue;
   let target=choices[0].o;
   // farms prefer another farm/camp or town edge; military buildings prefer castle/barracks/tower
   if(b.type==='farm'){let q=choices.find(x=>['farm','camp'].includes(x.o.type));if(q&&q.d<choices[0].d*1.55)target=q.o}
   if(['barracks','watchtower'].includes(b.type)){let q=choices.find(x=>['castle','barracks','watchtower'].includes(x.o.type));if(q&&q.d<choices[0].d*1.65)target=q.o}
   const k=roadKey(b,target);if(!used.has(k)){used.add(k);roadNetwork.push({c:c.id,a:b,b:target,p:roadCurve(b,target,buildings.indexOf(b)+buildings.indexOf(target)*.37)})}
 }
 // capitals get only a few arterial links to nearby clusters, never every building.
 const castle=own.find(b=>b.type==='castle');if(castle){const far=own.filter(b=>b!==castle&&Math.hypot(b.x-castle.x,b.y-castle.y)>150).sort((a,b)=>Math.hypot(a.x-castle.x,a.y-castle.y)-Math.hypot(b.x-castle.x,b.y-castle.y)).slice(0,2);for(const b of far){const k=roadKey(castle,b);if(!used.has(k)){used.add(k);roadNetwork.push({c:c.id,a:castle,b,p:roadCurve(castle,b,buildings.indexOf(b)*.73)})}}}
 }}
function drawOrganicRoads(){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';for(const r of roadNetwork){const p=r.p;if(!p||p.length<4)continue;ctx.strokeStyle='rgba(49,38,27,.42)';ctx.lineWidth=9/cam.z;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.bezierCurveTo(p[1].x,p[1].y,p[2].x,p[2].y,p[3].x,p[3].y);ctx.stroke();ctx.strokeStyle='rgba(201,174,119,.46)';ctx.lineWidth=3.2/cam.z;ctx.stroke()}
 ctx.restore()}
// Replace the old radial road renderer completely.
drawRoads=function(){drawOrganicRoads()};
const updateRoadsV111=update;update=function(dt){updateRoadsV111(dt);roadClock-=dt;if(roadClock<=0){roadClock=4;rebuildRoadNetwork()}};
rebuildRoadNetwork();
document.querySelector('.brand small').textContent="Dad's Crazy Simulation • THE LIVING WORLD v11.1";
