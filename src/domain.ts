export type Hand = 'R' | 'L';
export type Bowler = { id:string; name:string; style:string; overs:number; runs:number; wickets:number };
export type Scenario = { id:string; title:string; phase:'Powerplay'|'Middle overs'|'Death overs'; battingTeam:string; bowlingTeam:string; score:number; wickets:number; overs:number; target:number; ballsRemaining:number; batters:{name:string; hand:Hand; runs:number; balls:number}[]; recent:string[]; bowlers:Bowler[]; prompt:string; lastBowlerId:string; illustrative:true };
export type Position = {id:string;name:string;x:number;y:number;outside:boolean;side:'off'|'leg';behind:boolean};
export const positions:Position[] = [
 ['leg-slip','Leg slip',241,145,false,'leg',true],['slip','Slip',330,155,false,'off',true],['point','Point',380,211,false,'off',false],['cover','Cover',384,271,false,'off',false],['mid-off','Mid-off',333,338,false,'off',false],['mid-on','Mid-on',227,338,false,'leg',false],['midwicket','Midwicket',176,275,false,'leg',false],['square-leg','Square leg',180,211,false,'leg',false],['fine-leg','Fine leg',155,90,true,'leg',true],['third-man','Third man',405,90,true,'off',true],['long-on','Long-on',205,432,true,'leg',false],['long-off','Long-off',355,432,true,'off',false],['deep-cover','Deep cover',477,320,true,'off',false],['deep-midwicket','Deep midwicket',84,322,true,'leg',false],['deep-point','Deep point',493,208,true,'off',false],['deep-square-leg','Deep square leg',68,208,true,'leg',false],['short-fine-leg','Short fine leg',216,158,false,'leg',true],['gully','Gully',357,171,false,'off',true],['short-cover','Short cover',344,246,false,'off',false],['short-midwicket','Short midwicket',216,246,false,'leg',false]
].map(([id,name,x,y,outside,side,behind])=>({id,name,x,y,outside,side,behind})) as Position[];
export function getPosition(id:string,hand:Hand='R'):Position|undefined { const p=positions.find(p=>p.id===id); return p?{...p,x:hand==='L'?560-p.x:p.x}:undefined; }
export const intentions = [ {id:'stumps',label:'Attack the stumps',description:'Target the wicket; execution is not guaranteed.'},{id:'outside-off',label:'Bowl outside off',description:'An off-side line with appropriate cover.'},{id:'short',label:'Short-ball plan',description:'Use a legal short-ball intention, with catching and boundary cover.'},{id:'contain',label:'Contain scoring',description:'Protect scoring areas with a controlled line.'} ];
const bowlers = (overs:number[]):Bowler[] => ['Arjun Rao','Dev Malik','Kabir Shah','Rohan Patel','Aman Iyer'].map((name,i)=>({id:`b${i+1}`,name,style:['Right-arm pace','Left-arm pace','Leg spin','Off spin','Right-arm medium'][i],overs:overs[i],runs:[28,24,31,22,27][i],wickets:[2,1,0,1,1][i]}));
export const scenarios:Scenario[] = [
 {id:'death',title:'The final twelve',phase:'Death overs',battingTeam:'Mumbai Mavericks',bowlingTeam:'Delhi Defenders',score:178,wickets:5,overs:18,target:201,ballsRemaining:12,batters:[{name:'A. Mehta',hand:'R',runs:54,balls:32},{name:'S. Khan',hand:'L',runs:18,balls:10}],recent:['1','4','0','6','1','W'],bowlers:bowlers([3,3,4,4,4]).map((b,i)=>({...b,runs:[28,24,43,40,43][i]})),lastBowlerId:'b3',prompt:'23 needed from 12. Who bowls the penultimate over?',illustrative:true},
 {id:'powerplay',title:'Break the opening stand',phase:'Powerplay',battingTeam:'Chennai Chargers',bowlingTeam:'Delhi Defenders',score:42,wickets:0,overs:4,target:171,ballsRemaining:96,batters:[{name:'N. Sethi',hand:'R',runs:26,balls:15},{name:'V. Das',hand:'R',runs:15,balls:9}],recent:['4','1','0','2','1','4'],bowlers:bowlers([2,2,0,0,0]).map(b=>({...b,runs:b.overs?21:0,wickets:0})),lastBowlerId:'b2',prompt:'Two outside the circle. Can you create a wicket chance?',illustrative:true},
 {id:'middle',title:'The left-handed puzzle',phase:'Middle overs',battingTeam:'Bengaluru Blazers',bowlingTeam:'Delhi Defenders',score:91,wickets:3,overs:11,target:176,ballsRemaining:54,batters:[{name:'I. Sen',hand:'L',runs:31,balls:24},{name:'P. Nair',hand:'R',runs:9,balls:7}],recent:['1','0','2','1','W','1'],bowlers:bowlers([3,2,2,2,2]).map((b,i)=>({...b,runs:[26,15,20,14,16][i],wickets:[1,1,0,1,0][i]})),lastBowlerId:'b3',prompt:'85 needed from 54. Build a coherent plan for the left-hander.',illustrative:true}
];
export const presets:Record<string,string[]> = {
 attacking:['slip','gully','point','cover','mid-off','mid-on','square-leg','third-man','fine-leg'],
 balanced:['point','cover','mid-off','mid-on','square-leg','third-man','fine-leg','deep-cover','deep-midwicket'],
 boundary:['point','cover','mid-on','square-leg','third-man','fine-leg','long-on','long-off','deep-midwicket']
};
export const powerplayPresets:Record<string,string[]> = {
 attacking:[...presets.attacking],
 balanced:['point','cover','mid-off','mid-on','square-leg','midwicket','short-fine-leg','third-man','deep-cover'],
 boundary:['point','cover','mid-off','mid-on','square-leg','midwicket','short-fine-leg','long-on','long-off']
};
export function presetFor(name:string,scenario:Scenario):string[] { const available=scenario.overs<6?powerplayPresets:presets; return [...(available[name]??available.balanced)]; }
export function bowlerEligibility(b:Bowler,s:Scenario):string|null { if(b.overs>=4)return 'Four-over limit reached'; if(b.id===s.lastBowlerId)return 'Bowled the previous over; consecutive overs are not allowed'; return null; }
export function validateField(field:string[],s:Scenario):string[] {
 const errors:string[]=[]; if(field.length!==9)errors.push('Place exactly nine fielders (bowler and wicketkeeper are separate).');
 if(new Set(field).size!==field.length)errors.push('Two fielders cannot occupy the same position.');
 const ps=field.map(id=>positions.find(p=>p.id===id)); if(ps.some(p=>!p))errors.push('Unknown field position.');
 const outside=ps.filter(p=>p?.outside).length,max=s.overs<6?2:5;
 if(outside>max)errors.push(`${outside} outside the circle; ${s.overs<6?'powerplay':'non-powerplay'} limit is ${max}.`);
 if(ps.filter(p=>p?.side==='leg').length>5)errors.push('Only five fielders may be on the leg side.');
 if(ps.filter(p=>p?.side==='leg'&&p.behind).length>2)errors.push('Only two fielders may be behind the popping crease on the leg side.');
 return errors;
}
export type Decision = {scenarioId:string;bowlerId:string;field:string[];intention:string;reason:string;hand:Hand};
export type Analysis = {mode:'Demo analysis'|'AI analysis';overall:string;strengths:string[];vulnerabilities:string[];fieldFit:string;adjustments:{suggestion:string;tradeoff:string}[];assumptions:string[]};
export function evaluate(s:Scenario,d:Decision):Analysis {
 const off=d.field.filter(id=>positions.find(p=>p.id===id)?.side==='off').length;
 const outside=d.field.filter(id=>positions.find(p=>p.id===id)?.outside).length;
 const fit=d.intention==='outside-off'?off>=5:d.intention==='short'?d.field.includes('deep-square-leg')||d.field.includes('fine-leg'):d.intention==='contain'?outside>=(s.overs<6?2:4):d.field.includes('mid-on')&&d.field.includes('mid-off');
 return {mode:'Demo analysis',overall:`${s.overs>=16?'With '+(s.target-s.score)+' needed from '+s.ballsRemaining+', boundary prevention matters.':'Balance a wicket opportunity against free scoring.'} ${fit?'The field broadly supports your intention.':'Your line and field need closer alignment.'}`,strengths:[`A legal field with ${outside} boundary positions preserves a clear plan.`,`${s.bowlers.find(b=>b.id===d.bowlerId)?.name} has an over available and did not bowl the previous over.`],vulnerabilities:[outside<4&&s.overs>=16?'Several boundary sectors are unprotected at the death.':'Singles remain available between named positions.', 'Delivery execution can undo the plan; earlier economy alone does not establish death-over suitability.'],fieldFit:fit?'The selected cover is consistent with the tactical intention; it is not proof that a delivery will be executed.':'The selected intention has limited cover in its likely scoring areas. Consider moving one fielder before repeating this plan.',adjustments:[{suggestion:d.intention==='outside-off'?'Consider deep cover instead of a leg-side boundary fielder, if not already occupied.':d.intention==='short'?'Consider deep square leg instead of a close leg-side fielder, within the outside-circle limit.':'Consider long-off instead of a close catcher, if phase restrictions allow.',tradeoff:'Extra boundary cover sacrifices a catching chance or makes the single easier.'}],assumptions:['All player profiles, scores and conditions in this challenge are illustrative.','No shot tendencies, pitch assessment or boundary dimensions are supplied.','Named positions and the inner circle are approximate; handedness defines off and leg side.','Field placement affects feedback, not this uncalibrated baseline simulator.']};
}
export type MatchState={runs:number;wickets:number;legalBalls:number;striker:number;target:number};
export type Delivery={runs:number;wicket?:boolean;wide?:boolean};
export function applyDelivery(s:MatchState,d:Delivery):MatchState { if(s.runs>=s.target||s.wickets>=10||s.legalBalls>=120)return {...s}; const n={...s,runs:s.runs+d.runs,wickets:s.wickets+(d.wicket?1:0),legalBalls:s.legalBalls+(d.wide?0:1)}; if(!d.wide&&d.runs%2===1)n.striker=1-n.striker; if(!d.wide&&n.legalBalls%6===0)n.striker=1-n.striker; return n; }
export type Simulation={simulations:number;basis:string;meanRuns:number;wicketChance:number;distribution:{label:string;count:number;percent:number}[];examples:{deliveries:string[];runs:number;wickets:number}[];limitation:string};
export function simulate(s:Scenario,bowlerId:string,n=2000):Simulation {
 let seed=12345+Array.from(s.id+bowlerId).reduce((a,c)=>a+c.charCodeAt(0),0); const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296;};
 const bins=[0,0,0,0,0],examples:Simulation['examples']=[]; let runsTotal=0,wicketOvers=0;
 // Illustrative frequencies: dot .24, single .30, two .10, four .16, six .10, wicket .07, wide .03. No player calibration.
 for(let i=0;i<n;i++){let st:MatchState={runs:s.score,wickets:s.wickets,legalBalls:s.overs*6,striker:0,target:s.target}; const start=st.legalBalls; const deliveries:string[]=[];
 while(st.legalBalls-start<6&&st.legalBalls<120&&st.runs<s.target&&st.wickets<10){const r=random(); const d:Delivery=r<.24?{runs:0}:r<.54?{runs:1}:r<.64?{runs:2}:r<.80?{runs:4}:r<.90?{runs:6}:r<.97?{runs:0,wicket:true}:{runs:1,wide:true}; deliveries.push(d.wicket?'W':d.wide?'Wd':String(d.runs)); st=applyDelivery(st,d);}
 const runs=st.runs-s.score,wickets=st.wickets-s.wickets; runsTotal+=runs;if(wickets)wicketOvers++; bins[Math.min(4,Math.floor(runs/5))]++; if(i<3)examples.push({deliveries,runs,wickets}); }
 return {simulations:n,basis:'Illustrative seeded baseline; not empirical',meanRuns:Math.round(runsTotal/n*10)/10,wicketChance:Math.round(wicketOvers/n*100),distribution:bins.map((count,i)=>({label:['0–4','5–9','10–14','15–19','20+'][i],count,percent:Math.round(count/n*1000)/10})),examples,limitation:'Field, intention and bowler skill do not change these illustrative frequencies. Supports legal bat runs, striker wickets and one-run wides; no no-balls, free hits, byes, run-outs, retirements, DLS or shortened matches.'};
}
export type GameScore={total:number;label:string;categories:{name:string;points:number;max:number;explanation:string}[]};
export function scoreDecision(s:Scenario,d:Decision):GameScore { const a=evaluate(s,d),text=d.reason.toLowerCase(); const categories=[{name:'Match context',points:10+(/run|ball|over|target|wicket|powerplay|death/.test(text)?15:0),max:25,explanation:'10 for a legal decision; +15 for explicitly mentioning runs, balls, wickets or phase.'},{name:'Plan coherence',points:a.fieldFit.startsWith('The selected cover')?25:10,max:25,explanation:'25 if named coverage supports the chosen intention; otherwise 10.'},{name:'Risk awareness',points:/risk|boundary|single|trade|catch|execution/.test(text)?25:10,max:25,explanation:'10 baseline; +15 for mentioning a risk, trade-off or execution.'},{name:'Remaining overs',points:/remaining|next|final|save|reserve|last/.test(text)?25:10,max:25,explanation:'10 baseline; +15 for explicitly planning the remaining overs.'}]; return {total:categories.reduce((a,c)=>a+c.points,0),label:'Transparent game metric, not a validated cricket IQ score',categories}; }





