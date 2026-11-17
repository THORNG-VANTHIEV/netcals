import {useEffect,useRef,useState} from 'react'
import {NavLink,Outlet,useNavigate} from 'react-router-dom'
import {Activity,ArrowRightLeft,Binary,BookOpen,Calculator,ChevronDown,Command,Grid2X2,LayoutDashboard,Menu,Moon,Network,Search,Sun,Table2,X} from 'lucide-react'
import {useTheme} from '../../app/providers/ThemeProvider'
const items=[
  {to:'/',label:'Dashboard',icon:LayoutDashboard},
  {to:'/tools/subnet-calculator',label:'Subnet Calculator',icon:Calculator},
  {to:'/tools/flsm-calculator',label:'FLSM Calculator',icon:Grid2X2},
  {to:'/tools/vlsm-calculator',label:'VLSM Planner',icon:Network},
  {to:'/tools/cidr-converter',label:'CIDR Converter',icon:ArrowRightLeft},
  {to:'/tools/binary-visualizer',label:'Binary Visualizer',icon:Binary},
  {to:'/reference/subnet-table',label:'Subnet Table',icon:Table2},
  {to:'/learn/subnetting',label:'Learn Subnetting',icon:BookOpen},
]
export function AppLayout(){
  const [open,setOpen]=useState(false),[search,setSearch]=useState('')
  const navigate=useNavigate(),{theme,toggle}=useTheme()
  const searchRef=useRef<HTMLInputElement>(null)
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchRef.current?.focus()}};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[])
  const results=search.trim()?items.filter(item=>item.label.toLowerCase().includes(search.toLowerCase())):[]
  return <div className="app-shell"><aside className={`sidebar ${open?'sidebar-open':''}`}><div className="brand"><span className="brand-mark"><Activity size={24} strokeWidth={2.5}/></span><span><strong>NetCalc<span> Pro</span></strong><small>NETWORK TOOLKIT</small></span><button className="mobile-close icon-btn" onClick={()=>setOpen(false)} aria-label="Close navigation"><X/></button></div><div className="sidebar-section-label">WORKSPACE</div><nav aria-label="Main navigation">{items.slice(0,1).map(item=><NavLink key={item.to} to={item.to} end onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><item.icon size={18}/>{item.label}</NavLink>)}<div className="sidebar-section-label tools-label">TOOLS</div>{items.slice(1,6).map(item=><NavLink key={item.to} to={item.to} onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><item.icon size={18}/>{item.label}</NavLink>)}<div className="sidebar-section-label tools-label">RESOURCES</div>{items.slice(6).map(item=><NavLink key={item.to} to={item.to} onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><item.icon size={18}/>{item.label}</NavLink>)}</nav><div className="sidebar-bottom"><span className="sidebar-bottom-icon"><Command size={19}/></span><div><strong>Built for clarity.</strong><small>Every address, explained.</small></div></div></aside>{open&&<button className="nav-backdrop" aria-label="Close navigation" onClick={()=>setOpen(false)}/>}<div className="main-shell"><header className="topbar"><button className="mobile-menu icon-btn" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu size={23}/></button><div className="search-wrap"><Search size={18}/><input ref={searchRef} aria-label="Search tools" placeholder="Search tools..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&results[0]){navigate(results[0].to);setSearch('')}}}/><kbd>⌘ K</kbd>{results.length>0&&<div className="search-results">{results.map(item=><button key={item.to} onClick={()=>{navigate(item.to);setSearch('')}}><item.icon size={16}/>{item.label}</button>)}</div>}</div><div className="top-actions"><span className="status"><span/> Runs in your browser</span><button className="icon-btn theme-btn" onClick={toggle} aria-label={`Switch to ${theme==='light'?'dark':'light'} theme`}>{theme==='light'?<Moon size={19}/>:<Sun size={19}/>}</button><button className="language-btn" title="Khmer interface is planned for a future version" aria-label="Language: English. Khmer coming later" disabled>EN <ChevronDown size={15}/></button></div></header><main className="content"><Outlet/></main><footer className="footer"><span>© 2026 NetCalc Pro</span><span>IPv4 calculations run locally in your browser.</span></footer></div></div>
}
