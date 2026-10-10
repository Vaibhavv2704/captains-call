import { describe,it } from 'node:test';
import assert from 'node:assert/strict';
const expect=(actual:unknown)=>({toBe:(expected:unknown)=>assert.equal(actual,expected),toEqual:(expected:unknown)=>assert.deepEqual(actual,expected),toBeNull:()=>assert.equal(actual,null),toContain:(expected:string)=>assert.ok(String(actual).includes(expected)),toHaveLength:(expected:number)=>assert.equal((actual as unknown[]).length,expected),toBeLessThanOrEqual:(expected:number)=>assert.ok(Number(actual)<=expected)});
import {scenarios,presets,presetFor,positions,getPosition,bowlerEligibility,validateField,applyDelivery,simulate,evaluate,scoreDecision,type Decision} from '../src/domain';
const s=scenarios[0]; const d:Decision={scenarioId:s.id,bowlerId:'b1',field:presets.boundary,intention:'contain',reason:'Protect boundary risk and save a bowler for final over',hand:'R'};
describe('cricket rules',()=>{
 it('blocks exhausted and consecutive bowlers',()=>{expect(bowlerEligibility(s.bowlers[0],s)).toBeNull();expect(bowlerEligibility(scenarios[1].bowlers[1],scenarios[1])).toContain('previous');expect(bowlerEligibility(s.bowlers[2],s)).toContain('limit');});
 it('validates nine unique fielders, phase and leg behind',()=>{expect(validateField(presets.boundary,s)).toEqual([]);expect(validateField(presets.boundary,scenarios[1]).join()).toContain('limit is 2');expect(validateField(Array(9).fill('point'),s).join()).toContain('same position');expect(validateField(['point'],s).join()).toContain('exactly nine');for(const scenario of scenarios)expect(validateField(presetFor('balanced',scenario),scenario)).toEqual([]);});
 it('mirrors coordinates and preserves cricket sides',()=>{for(const p of positions){expect(getPosition(p.id,'L')!.x).toBe(560-p.x);expect(getPosition(p.id,'L')!.side).toBe(p.side);}});
});
describe('match mechanics',()=>{
 it('changes strike on odd runs and over boundaries',()=>{const st={runs:50,wickets:2,legalBalls:65,striker:0,target:100};expect(applyDelivery(st,{runs:1})).toEqual({...st,runs:51,legalBalls:66,striker:0});expect(applyDelivery({...st,legalBalls:64},{runs:1}).striker).toBe(1);});
 it('wide is not legal ball; wicket and terminal state',()=>{const st={runs:99,wickets:9,legalBalls:119,striker:0,target:100};expect(applyDelivery(st,{runs:1,wide:true}).legalBalls).toBe(119);expect(applyDelivery(st,{runs:0,wicket:true}).wickets).toBe(10);expect(applyDelivery({...st,runs:100},{runs:6})).toEqual({...st,runs:100});});
 it('simulator is reproducible, normalized and no field claims',()=>{const a=simulate(s,'b1');expect(a).toEqual(simulate(s,'b1'));expect(a.distribution.reduce((n,b)=>n+b.count,0)).toBe(2000);expect(a.basis).toContain('Illustrative');expect(a.examples.every(e=>e.deliveries.filter(x=>x!=='Wd').length<=6)).toBe(true);});
});
it('demo evaluation is labeled and scoring transparent',()=>{expect(evaluate(s,d).mode).toBe('Demo analysis');expect(scoreDecision(s,d).categories).toHaveLength(4);expect(scoreDecision(s,d).total).toBeLessThanOrEqual(100);expect(d.field).toEqual(presets.boundary);});


import { app, analyze } from '../server';
it('provider malformed output and missing key fall back honestly',async()=>{
 const oldKey=process.env.OPENAI_API_KEY, oldFetch=globalThis.fetch;
 try { delete process.env.OPENAI_API_KEY;expect((await analyze(s,d)).mode).toBe('Demo analysis');process.env.OPENAI_API_KEY='test';globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:'not-json'}}]}),{status:200});expect((await analyze(s,d)).mode).toBe('Demo analysis');globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({overall:'Missing structured fields'})}}]}),{status:200});expect((await analyze(s,d)).mode).toBe('Demo analysis');globalThis.fetch=async()=>{throw new Error('Timeout');};expect((await analyze(s,d)).mode).toBe('Demo analysis'); }
 finally {if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;globalThis.fetch=oldFetch;}
});
it('API keeps reveal private until validated lock and snapshots field state',async()=>{
 const oldKey=process.env.OPENAI_API_KEY;delete process.env.OPENAI_API_KEY;
 const listener=app.listen(0,'127.0.0.1'); await new Promise<void>(r=>listener.once('listening',r));const address=listener.address() as {port:number};const url=`http://127.0.0.1:${address.port}`;
 try {const pub=await(await fetch(url+'/api/scenarios')).json();expect(JSON.stringify(pub).includes('deliveries')).toBe(false);expect((await fetch(url+'/api/decisions/not-locked/reveal')).status).toBe(404);
 const invalid=await fetch(url+'/api/decisions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...d,bowlerId:'b3'})});expect(invalid.status).toBe(400);
 const resp=await fetch(url+'/api/decisions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});expect(resp.status).toBe(200);const lock=await resp.json();expect(lock.decision.field).toEqual(d.field);expect(lock.analysis.mode).toBe('Demo analysis');expect(JSON.stringify(lock).includes('deliveries')).toBe(true); // simulations are hypothetical paths, not recorded outcomes
 const reveal=await(await fetch(url+`/api/decisions/${lock.id}/reveal`)).json();expect(reveal.mode).toBe('Scripted scenario outcome');expect(reveal.decision.field).toEqual(d.field);expect(reveal.deliveries).toHaveLength(6);
 }finally {await new Promise<void>((r,e)=>listener.close(err=>err?e(err):r()));if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;}
});
it('rejects three leg-side fielders behind the popping crease',()=>{expect(validateField(['leg-slip','short-fine-leg','fine-leg','point','cover','mid-on','mid-off','square-leg','third-man'],s).join()).toContain('Only two');});

it('rejects more than five leg-side fielders',()=>{expect(validateField(['mid-on','midwicket','square-leg','fine-leg','long-on','deep-midwicket','point','cover','mid-off'],s).join()).toContain('five fielders');});

it('field geometry agrees with circle, crease and handedness semantics',()=>{
 for(const p of positions){const radius=Math.hypot(p.x-280,p.y-246.4);expect(p.outside?radius>117.6:radius<=110).toBe(true);expect(p.behind).toBe(p.y<196);expect(p.side==='off').toBe(p.x>280);const mirrored=getPosition(p.id,'L')!;expect(mirrored.side==='off').toBe(mirrored.x<280);}
});
it('powerplay presets are distinct and legal',()=>{
 const fields=['attacking','balanced','boundary'].map(name=>presetFor(name,scenarios[1]));expect(new Set(fields.map(f=>f.join())).size).toBe(3);for(const field of fields)expect(validateField(field,scenarios[1])).toEqual([]);
});
it('illustrative bowling figures reconcile with the match situation',()=>{for(const scenario of scenarios){expect(scenario.bowlers.reduce((n,b)=>n+b.overs,0)).toBe(scenario.overs);expect(scenario.bowlers.reduce((n,b)=>n+b.runs,0)).toBeLessThanOrEqual(scenario.score);expect(scenario.bowlers.reduce((n,b)=>n+b.wickets,0)).toBeLessThanOrEqual(scenario.wickets);}});
