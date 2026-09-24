const BASE=import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function api(path:string, options:RequestInit={}) {
  const token=localStorage.getItem("codepilotx_token") || "";
  const headers=new Headers(options.headers);
  headers.set("Content-Type","application/json");
  if(token) headers.set("Authorization",`Bearer ${token}`);
  const r=await fetch(`${BASE}${path}`,{...options,headers});
  if(!r.ok){
    const body=await r.json().catch(()=>({}));
    throw new Error(body.detail || "Request failed");
  }
  return r.json();
}
