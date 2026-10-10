import 'dotenv/config';
import express from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scenarios, intentions, validateField, bowlerEligibility, evaluate, simulate, scoreDecision, type Decision, type Analysis, type Scenario } from './src/domain.js';
export const app=express(); app.use(express.json({limit:'16kb'}));
const decisionSchema=z.object({scenarioId:z.string(),bowlerId:z.string(),field:z.array(z.string()).length(9),intention:z.enum(['stumps','outside-off','short','contain']),reason:z.string().max(500).default(''),hand:z.enum(['R','L'])});
export const analysisSchema=z.object({overall:z.string().min(5).max(2000),strengths:z.array(z.string()).min(1).max(5),vulnerabilities:z.array(z.string()).min(1).max(5),fieldFit:z.string(),adjustments:z.array(z.object({suggestion:z.string(),tradeoff:z.string()})).min(1).max(2),assumptions:z.array(z.string()).min(1).max(8)});
export async function analyze(s:Scenario,d:Decision):Promise<Analysis> {
 const fallback=evaluate(s,d); if(!process.env.OPENAI_API_KEY)return fallback;
 try {
 const response=await fetch(`${(process.env.OPENAI_BASE_URL??'https://api.openai.com/v1').replace(/\/$/,'')}/chat/completions`,{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL??'gpt-4.1-mini',response_format:{type:'json_object'},messages:[{role:'system',content:'You are a cricket tactics analyst. Analyze only the pre-outcome context. All supplied scenarios and player profiles are illustrative. Never invent shot tendencies, conditions, boundary dimensions, real fields, future outcomes, precise causal probabilities or calibrated win probabilities. Earlier economy does not prove death-over ability. Treat intentions as plans not executed deliveries. Named coordinates are abstractions. Return JSON exactly with keys overall:string,strengths:string[],vulnerabilities:string[],fieldFit:string,adjustments:[{suggestion:string,tradeoff:string}] (1-2),assumptions:string[]. Include unknowns and tradeoffs.'},{role:'user',content:JSON.stringify({ruleset:'ICC men T20I July2025 uninterrupted20overs; max4bowler,no consecutive,max2outside first6/max5after,max5legside,max2legbehind',scenario:s,decision:d})}]})});
 if(!response.ok)throw new Error('Provider error'); const data=await response.json() as {choices?:{message?:{content?:string}}[]}; const parsed=analysisSchema.parse(JSON.parse(data.choices?.[0]?.message?.content??''));
 return {...parsed,mode:'AI analysis',assumptions:[...parsed.assumptions,'Illustrative challenge; no historical future delivery data was supplied.']};
 }catch {return {...fallback,assumptions:[...fallback.assumptions,'The AI provider was unavailable or returned invalid output; deterministic demo feedback is shown.']};}
}
const locked=new Map<string,{decision:Decision;scenario:Scenario;analysis:Analysis;simulation:ReturnType<typeof simulate>;score:ReturnType<typeof scoreDecision>}>();
// Scripted synthetic outcomes live only on the server and are never in AI input or public scenarios.
const outcomes:Record<string,{bowlerId:string;deliveries:string[];runs:number;wickets:number}>={death:{bowlerId:'b1',deliveries:['1','4','W','1','2','4'],runs:12,wickets:1},powerplay:{bowlerId:'b1',deliveries:['0','1','4','W','0','1'],runs:6,wickets:1},middle:{bowlerId:'b4',deliveries:['1','0','2','1','0','4'],runs:8,wickets:0}};
app.get('/api/scenarios',(_req,res)=>res.json(scenarios));
app.post('/api/decisions',async(req,res)=>{
 const parsed=decisionSchema.safeParse(req.body);if(!parsed.success){res.status(400).json({error:'Invalid decision',issues:parsed.error.issues});return;}
 const d=parsed.data,s=scenarios.find(s=>s.id===d.scenarioId);if(!s){res.status(404).json({error:'Scenario not found'});return;}
 const b=s.bowlers.find(b=>b.id===d.bowlerId);if(!b){res.status(400).json({error:'Unknown bowler'});return;}
 const errors=validateField(d.field,s),eligibility=bowlerEligibility(b,s);if(eligibility)errors.push(eligibility);if(d.hand!==s.batters[0].hand)errors.push('Field handedness must match the current batter.');
 if(errors.length){res.status(400).json({error:errors.join(' ')});return;}
 const id=randomUUID();const snapshot=structuredClone(d);const result={decision:snapshot,scenario:structuredClone(s),analysis:await analyze(s,snapshot),simulation:simulate(s,d.bowlerId),score:scoreDecision(s,snapshot)};
 if(locked.size>200)locked.delete(locked.keys().next().value!);locked.set(id,result);res.json({id,decision:result.decision,analysis:result.analysis,simulation:result.simulation,score:result.score});
});
app.get('/api/decisions/:id/reveal',(req,res)=>{const result=locked.get(req.params.id);if(!result){res.status(404).json({error:'Locked decision not found. Restart and lock again.'});return;}const outcome=outcomes[result.scenario.id];res.json({mode:'Scripted scenario outcome',decision:result.decision,bowler:result.scenario.bowlers.find(b=>b.id===outcome.bowlerId)?.name,...outcome,explanation:'This scripted outcome is a comparison, not an answer key. A coherent plan can concede runs; one over cannot prove tactical quality. No real captain field is known or represented.'});});
if(resolve(process.argv[1]??'')===fileURLToPath(import.meta.url)) {
if(process.argv.includes('--production')) {app.use(express.static(resolve('dist')));app.get('/{*splat}',(_req,res)=>res.sendFile(resolve('dist/index.html')));}
else { const {createServer}=await import('vite'); const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares); }
app.listen(Number(process.env.PORT??3000),'0.0.0.0',()=>console.log('Captain’s Call running at http://localhost:'+ (process.env.PORT??3000)));

}


