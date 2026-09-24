import {Routes,Route,Navigate,NavLink} from "react-router-dom";
import {Code2,LayoutDashboard,BookOpen,BrainCircuit,ShieldCheck,Network,BarChart3,Settings,UserCircle,LogOut,Trophy,GraduationCap,Lightbulb,LineChart,LockKeyhole,ChevronRight} from "lucide-react";
import {useEffect,useState} from "react";
import {api} from "./lib/api";
import Editor from "@monaco-editor/react";

const nav=[
["/dashboard","Dashboard",LayoutDashboard],["/problems","Problems",BookOpen],["/assessments","Assessments",GraduationCap],
["/ai-code-review","AI Code Review",BrainCircuit],["/mistake-fingerprint","Mistake Fingerprint",FingerprintIcon],
["/ai-independence","AI Independence",LineChart],["/learning-transfer","Learning Transfer",ChevronRight],
["/skill-graph","Skill Graph",Network],["/learning-debt","Learning Debt",Lightbulb],["/curriculum-intelligence","Curriculum Intelligence",GraduationCap],
["/code-ownership","Code Ownership",LockKeyhole],["/progress","Progress",BarChart3],["/leaderboard","Leaderboard",Trophy],
["/profile","Profile",UserCircle],["/settings","Settings",Settings],["/help","Help",BookOpen]
] as const;
function FingerprintIcon(p:any){return <BrainCircuit {...p}/>}

function Shell({children}:{children:React.ReactNode}){
 return <div className="min-h-screen flex bg-[#080b12]">
  <aside className="w-64 shrink-0 border-r border-[#202938] bg-[#0a0e16] p-3 hidden md:flex flex-col sticky top-0 h-screen">
   <div className="flex items-center gap-2 px-3 py-4 mb-2"><div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center"><Code2 size={21}/></div><div><div className="font-bold">CodePilotX</div><div className="text-xs muted">Coding intelligence</div></div></div>
   <nav className="space-y-1 overflow-auto flex-1">{nav.map(([to,label,Icon])=><NavLink key={to} to={to} className={({isActive})=>`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${isActive?"bg-indigo-500/15 text-white":"text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={17}/>{label}</NavLink>)}</nav>
   <div className="border-t border-[#202938] pt-3 mt-3"><div className="px-3 text-xs muted mb-2">Authenticated student</div><div className="px-3 py-2 rounded-lg bg-white/5 text-sm">Student</div></div>
  </aside>
  <main className="flex-1 min-w-0">{children}</main>
 </div>
}

function Login(){
 const [id,setId]=useState(""); const [err,setErr]=useState("");
 const submit=(e:any)=>{e.preventDefault(); try{crypto.randomUUID();}catch{} localStorage.setItem("codepilotx_token",id||crypto.randomUUID()); location.href="/dashboard"};
 return <div className="min-h-screen flex items-center justify-center p-6"><div className="card p-8 w-full max-w-md"><div className="flex items-center gap-2 mb-6"><Code2/><h1 className="text-2xl font-bold">CodePilotX</h1></div><p className="muted mb-6">Human–AI collaborative coding intelligence.</p><form onSubmit={submit} className="space-y-4"><label className="block text-sm">Development UUID token<input value={id} onChange={e=>setId(e.target.value)} placeholder="Paste Supabase user UUID" className="w-full mt-2 bg-[#080b12] border border-[#283345] rounded-lg p-3 outline-none"/></label><button className="w-full bg-indigo-500 hover:bg-indigo-400 rounded-lg p-3 font-semibold">Continue</button></form><p className="text-xs muted mt-5">Production: replace this development token flow with Supabase Auth JWT verification.</p></div></div>
}

function Page({title,children}:{title:string,children?:React.ReactNode}){return <Shell><div className="p-5 md:p-8 max-w-7xl mx-auto"><div className="mb-7"><h1 className="text-2xl font-bold">{title}</h1><p className="muted text-sm mt-1">Derived from your persisted activity.</p></div>{children}</div></Shell>}

function Dashboard(){
 const [d,setD]=useState<any>(null); useEffect(()=>{api("/dashboard").then(setD).catch(()=>setD({error:true}))},[]);
 if(!d)return <Page title="Dashboard"><div className="muted">Loading…</div></Page>;
 const cards=[["Problems Solved",d.problems_solved],["Submissions",d.submissions],["AI Assistance",d.ai_assistance_interactions],["Independent Coding",d.independent_submissions]];
 return <Page title="Dashboard"><div className="grid md:grid-cols-4 gap-4 mb-6">{cards.map(([a,b])=><div className="card p-5" key={a as string}><div className="muted text-sm">{a}</div><div className="text-3xl font-bold mt-2">{b}</div></div>)}</div><div className="card p-6"><h2 className="font-semibold mb-2">Coding Activity</h2>{d.has_activity?<pre className="text-sm text-slate-300">{JSON.stringify(d.activity,null,2)}</pre>:<div className="py-12 text-center muted">No coding activity yet.<br/>Complete your first problem to start building your learning intelligence.</div>}</div></Page>
}

function Problems(){
 const [items,setItems]=useState<any[]>([]); useEffect(()=>{api("/problems").then(x=>setItems(x.items))},[]);
 return <Page title="Problems"><div className="grid md:grid-cols-2 gap-4">{items.map(p=><a href={`/problems/${p.id}`} className="card p-5 hover:border-indigo-400/50" key={p.id}><div className="flex justify-between"><h2 className="font-semibold">{p.title}</h2><span className="text-xs px-2 py-1 rounded bg-white/5">{p.difficulty}</span></div><p className="muted text-sm mt-3 line-clamp-2">{p.description}</p><div className="text-xs mt-4 text-indigo-300">{p.topic}</div></a>)}</div></Page>
}

function Problem({id}:{id:string}){
 const [p,setP]=useState<any>(); const [code,setCode]=useState(""); const [language,setLanguage]=useState("python"); const [result,setResult]=useState<any>(); const [ai,setAi]=useState<any>(); const [loading,setLoading]=useState(false);
 useEffect(()=>{api(`/problems/${id}`).then(x=>{setP(x);setCode(x.starter_code?.python||"")})},[id]);
 if(!p)return <Page title="Problem"><div className="muted">Loading…</div></Page>;
 const run=async(submit=false)=>{setLoading(true);setResult(null);try{const r=await api(submit?"/code/submit":"/code/run",{method:"POST",body:JSON.stringify({problem_id:id,language,source_code:code})});setResult(r)}catch(e:any){setResult({status:"error",stderr:e.message})}finally{setLoading(false)}};
 const review=async()=>{try{setAi(await api("/ai/review",{method:"POST",body:JSON.stringify({problem_id:id,language,source_code:code,test_results:result||{},previous_errors:result?.stderr?[result.stderr]:[]})}))}catch(e:any){setAi({error:e.message})}};
 return <Page title={p.title}><div className="grid lg:grid-cols-2 gap-4"><div className="card p-6"><div className="text-sm text-indigo-300 mb-3">{p.difficulty} · {p.topic}</div><p className="leading-7">{p.description}</p><h3 className="font-semibold mt-6">Constraints</h3><p className="muted mt-2">{p.constraints}</p><h3 className="font-semibold mt-6">Examples</h3><pre className="bg-black/20 p-3 rounded-lg text-sm mt-2 overflow-auto">{JSON.stringify(p.examples,null,2)}</pre></div><div className="card overflow-hidden"><div className="flex items-center justify-between p-3 border-b border-[#202938]"><select value={language} onChange={e=>{setLanguage(e.target.value);setCode(p.starter_code?.[e.target.value]||"")}} className="bg-[#080b12] border border-[#283345] rounded px-3 py-2 text-sm"><option>python</option><option>javascript</option><option>java</option><option>cpp</option></select><div className="flex gap-2"><button onClick={()=>run(false)} className="px-3 py-2 rounded bg-white/10 text-sm">{loading?"Running…":"Run"}</button><button onClick={()=>run(true)} className="px-3 py-2 rounded bg-indigo-500 text-sm">Submit</button></div></div><Editor height="430px" theme="vs-dark" language={language==="cpp"?"cpp":language} value={code} onChange={v=>setCode(v||"")}/><div className="p-3 border-t border-[#202938] flex justify-between"><button onClick={review} className="text-sm text-indigo-300 flex gap-2 items-center"><BrainCircuit size={16}/>Review My Code</button></div></div></div>{result&&<div className="card p-5 mt-4"><h2 className="font-semibold">Execution Result</h2><pre className="text-sm mt-3 whitespace-pre-wrap">{JSON.stringify(result,null,2)}</pre></div>}{ai&&<div className="card p-5 mt-4"><h2 className="font-semibold">AI Code Review</h2><pre className="text-sm mt-3 whitespace-pre-wrap">{JSON.stringify(ai,null,2)}</pre><div className="flex gap-2 mt-4"><button className="px-3 py-2 bg-emerald-500/15 text-emerald-300 rounded">Accept</button><button className="px-3 py-2 bg-amber-500/15 text-amber-300 rounded">Modify</button><button className="px-3 py-2 bg-red-500/15 text-red-300 rounded">Reject</button></div></div>}</Page>
}

function Empty({title,text}:{title:string,text:string}){return <Page title={title}><div className="card p-12 text-center"><div className="text-lg font-semibold">{text}</div><p className="muted mt-2">This module will populate from your real activity; no fabricated metrics are shown.</p></div></Page>}

function App(){
 return <Routes>
  <Route path="/login" element={<Login/>}/><Route path="/" element={<Navigate to="/dashboard" replace/>}/>
  <Route path="/dashboard" element={<Dashboard/>}/><Route path="/problems" element={<Problems/>}/>
  <Route path="/problems/:id" element={<ProblemRoute/>}/>
  <Route path="/assessments" element={<Empty title="Assessments" text="Complete an assessment to generate insights."/>}/>
  <Route path="/ai-code-review" element={<Empty title="AI Code Review" text="Open a coding problem to review your code with AI."/>}/>
  <Route path="/mistake-fingerprint" element={<DataPage endpoint="/mistakes" title="Mistake Fingerprint" keyName="items"/>}/>
  <Route path="/ai-independence" element={<DataPage endpoint="/independence" title="AI Independence" keyName="none"/>}/>
  <Route path="/learning-transfer" element={<Empty title="Learning Transfer" text="Complete an AI-assisted problem to generate a transfer challenge."/>}/>
  <Route path="/skill-graph" element={<DataPage endpoint="/skills" title="Skill Graph" keyName="items"/>}/>
  <Route path="/learning-debt" element={<DataPage endpoint="/learning-debt" title="Learning Debt" keyName="items"/>}/>
  <Route path="/curriculum-intelligence" element={<Empty title="Curriculum Intelligence" text="Your curriculum recommendations will appear after enough evidence exists."/>}/>
  <Route path="/code-ownership" element={<Empty title="Code Ownership" text="Complete a code ownership verification to generate ownership evidence."/>}/>
  <Route path="/progress" element={<DataPage endpoint="/progress" title="Progress" keyName="events"/>}/>
  <Route path="/leaderboard" element={<DataPage endpoint="/leaderboard" title="Leaderboard" keyName="items"/>}/>
  <Route path="/profile" element={<Empty title="Profile" text="Your persisted student profile will appear here."/>}/>
  <Route path="/settings" element={<Empty title="Settings" text="Settings are persisted through the backend API."/>}/>
  <Route path="/help" element={<Empty title="Help" text="Learn how CodePilotX uses your coding evidence."/>}/>
 </Routes>
}
function ProblemRoute(){const id=location.pathname.split("/").pop()!;return <Problem id={id}/>}
function DataPage({endpoint,title,keyName}:{endpoint:string,title:string,keyName:string}){
 const [d,setD]=useState<any>(); useEffect(()=>{api(endpoint).then(setD).catch(e=>setD({error:e.message}))},[endpoint]);
 return <Page title={title}><div className="card p-6"><pre className="text-sm whitespace-pre-wrap">{d?JSON.stringify(keyName==="none"?d:d?.[keyName],null,2):"Loading…"}</pre></div></Page>
}
export default App;
