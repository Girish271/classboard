import{useEffect,useState}from'react';import{useNavigate}from'react-router-dom';import Logo from'../components/Logo';import ConfigMissing from'../components/ConfigMissing';import{firebaseConfigured}from'../lib/firebase';import{useAuth}from'../hooks/useAuth';export default function Login(){const{login,profile}=useAuth(),nav=useNavigate();const[e,setE]=useState(''),[p,setP]=useState(''),[busy,setBusy]=useState(false),[err,setErr]=useState('');useEffect(()=>{if(profile)nav('/'+profile.role,{replace:true})},[profile,nav]);if(!firebaseConfigured)return <ConfigMissing/>;return <div className="grid min-h-screen place-items-center bg-canvas p-5"><div className="w-full max-w-md card p-7 sm:p-9"><Logo large/><h1 className="mt-8 text-3xl font-extrabold">Welcome back</h1><p className="mt-2 text-slate-500">Sign in to your classroom workspace.</p>{err&&<div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>}<form className="mt-6 space-y-4" onSubmit={async x=>{x.preventDefault();setBusy(true);setErr('');try{await login(e,p)}catch (a: any) {
  console.error('LOGIN ERROR:', {
    code: a?.code,
    message: a?.message,
    name: a?.name,
  });

  setErr(
    `${a?.code || 'unknown-error'}: ${
      a?.message?.replace('Firebase: ', '') || 'Invalid login.'
    }`
  );
}finally{setBusy(false)}}}><label className="block"><span className="label">Email</span><input className="field" type="email" required value={e} onChange={x=>setE(x.target.value)} /></label><label className="block"><span className="label">Password</span><input className="field" type="password" required value={p} onChange={x=>setP(x.target.value)}/></label><button className="btn-primary w-full" disabled={busy}>{busy?'Signing in...':'Sign in'}</button></form></div></div>}
