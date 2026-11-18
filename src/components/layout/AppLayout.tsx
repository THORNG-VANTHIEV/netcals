import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {NavLink,Outlet,useLocation,useNavigate} from 'react-router-dom'
import {Activity,ArrowRightLeft,Binary,BookOpen,Calculator,Check,ChevronDown,Command,Download,Grid2X2,House,LayoutDashboard,Menu,Moon,MoreHorizontal,Network,Search,Sun,Table2,X} from 'lucide-react'
import {useLocale} from '../../app/providers/LocaleProvider'
import {useTheme} from '../../app/providers/ThemeProvider'
import {usePWA} from '../../app/usePWA'

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
const mobileItems=[
  {to:'/',label:'Home',icon:House},
  {to:'/tools/subnet-calculator',label:'Subnet',icon:Calculator},
  {to:'/tools/flsm-calculator',label:'FLSM',icon:Grid2X2},
  {to:'/tools/vlsm-calculator',label:'VLSM',icon:Network},
]

export function AppLayout(){
  const [open,setOpen]=useState(false)
  const [searchOpen,setSearchOpen]=useState(false)
  const [search,setSearch]=useState('')
  const navigate=useNavigate()
  const location=useLocation()
  const {theme,toggle}=useTheme()
  const {locale,setLocale,t}=useLocale()
  const pwa=usePWA()
  const searchRef=useRef<HTMLInputElement>(null)
  const drawerRef=useRef<HTMLElement>(null)
  const moreRef=useRef<HTMLButtonElement>(null)
  const closeRef=useRef<HTMLButtonElement>(null)
  const moreActive=!mobileItems.some(item=>item.to===location.pathname)
  const results=search.trim()?items.filter(item=>item.label.toLowerCase().includes(search.toLowerCase())||t(item.label).toLowerCase().includes(search.toLowerCase())):[]

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
        event.preventDefault()
        setSearchOpen(true)
        requestAnimationFrame(()=>searchRef.current?.focus())
      }
      if(event.key==='Escape'){
        if(open){setOpen(false);moreRef.current?.focus()}
        else if(searchOpen){setSearchOpen(false);setSearch('')}
      }
    }
    document.addEventListener('keydown',onKey)
    return()=>document.removeEventListener('keydown',onKey)
  },[open,searchOpen])

  useEffect(()=>{setOpen(false);setSearchOpen(false);setSearch('')},[location.pathname])
  useLayoutEffect(()=>{window.scrollTo(0,0)},[location.pathname])
  useEffect(()=>{
    if(!open)return
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    closeRef.current?.focus()
    return()=>{document.body.style.overflow=previous}
  },[open])

  function goTo(to:string){navigate(to);setSearch('');setSearchOpen(false)}
  function closeDrawer(){setOpen(false);moreRef.current?.focus()}
  function selectDrawerItem(){setOpen(false);if(window.matchMedia('(max-width:680px)').matches)requestAnimationFrame(()=>moreRef.current?.focus())}
  function trapDrawerFocus(event:React.KeyboardEvent<HTMLElement>){
    if(event.key!=='Tab')return
    const focusable=[...(drawerRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]')??[])]
    if(!focusable.length)return
    const first=focusable[0],last=focusable[focusable.length-1]
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }

  return <div className="app-shell">
    <aside ref={drawerRef} className={`sidebar ${open?'sidebar-open':''}`} role={open?'dialog':undefined} aria-modal={open||undefined} aria-label={open?t('Main navigation'):undefined} onKeyDown={open?trapDrawerFocus:undefined}>
      <div className="brand"><span className="brand-mark"><Activity size={24} strokeWidth={2.5}/></span><span><strong>NetCalc<span> Pro</span></strong><small>{t('NETWORK TOOLKIT')}</small></span><button ref={closeRef} className="mobile-close icon-btn" onClick={closeDrawer} aria-label={t('Close navigation')}><X/></button></div>
      <div className="sidebar-install">
        {pwa.installed?<div className="install-complete"><Check size={18}/>{t('Installed and ready offline')}</div>:<button type="button" onClick={pwa.install}><Download size={18}/>{t('Install app')}</button>}
        {pwa.installHelp&&<p role="status">{t(pwa.installInstructions)}</p>}
      </div>
      <div className="sidebar-section-label">{t('WORKSPACE')}</div>
      <nav aria-label={t('Main navigation')}>
        {items.slice(0,1).map(item=><NavLink key={item.to} to={item.to} end onClick={selectDrawerItem} className={({isActive})=>`nav-link ${isActive?'active':''}`}><item.icon size={18}/>{t(item.label)}</NavLink>)}
        <div className="sidebar-section-label tools-label">{t('TOOLS')}</div>
        {items.slice(1,6).map(item=><NavLink key={item.to} to={item.to} onClick={selectDrawerItem} className={({isActive})=>`nav-link ${isActive?'active':''}`}><item.icon size={18}/>{t(item.label)}</NavLink>)}
        <div className="sidebar-section-label tools-label">{t('RESOURCES')}</div>
        {items.slice(6).map(item=><NavLink key={item.to} to={item.to} onClick={selectDrawerItem} className={({isActive})=>`nav-link ${isActive?'active':''}`}><item.icon size={18}/>{t(item.label)}</NavLink>)}
      </nav>
      <div className="sidebar-bottom"><span className="sidebar-bottom-icon"><Command size={19}/></span><div><strong>{t('Built for clarity.')}</strong><small>{t('Every address, explained.')}</small></div></div>
    </aside>
    {open&&<button className="nav-backdrop" aria-label={t('Close navigation')} onClick={closeDrawer}/>}
    <div className="main-shell">
      <header className="topbar">
        <button className="mobile-menu icon-btn" onClick={()=>setOpen(true)} aria-label={t('Open navigation')}><Menu size={23}/></button>
        <NavLink to="/" className="mobile-brand" aria-label="NetCalc Pro"><span className="mobile-brand-mark"><Activity size={20} strokeWidth={2.5}/></span><strong>NetCalc <span>Pro</span></strong></NavLink>
        <div className={`search-wrap ${searchOpen?'search-open':''}`}><Search size={18}/><input ref={searchRef} aria-label={t('Search tools')} placeholder={t('Search tools...')} value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&results[0])goTo(results[0].to)}}/><kbd>⌘ K</kbd><button className="search-close icon-btn" type="button" onClick={()=>{setSearchOpen(false);setSearch('')}} aria-label={t('Close search')}><X size={19}/></button>{results.length>0&&<div className="search-results">{results.map(item=><button key={item.to} onClick={()=>goTo(item.to)}><item.icon size={18}/>{t(item.label)}</button>)}</div>}</div>
        <div className="top-actions"><span className="status"><span/> {t('Runs in your browser')}</span><button className="mobile-search-trigger icon-btn" type="button" onClick={()=>{setSearchOpen(true);requestAnimationFrame(()=>searchRef.current?.focus())}} aria-label={t('Search tools')}><Search size={21}/></button><button className="icon-btn theme-btn" onClick={toggle} aria-label={t(`Switch to ${theme==='light'?'dark':'light'} theme`)}>{theme==='light'?<Moon size={19}/>:<Sun size={19}/>}</button><button className="language-btn" type="button" onClick={()=>setLocale(locale==='en'?'km':'en')} title={locale==='en'?'Switch to Khmer':'ប្តូរទៅ English'} aria-label={locale==='en'?'Switch to Khmer':'ប្តូរទៅ English'}>{locale==='en'?'EN':'ខ្មែរ'} <ChevronDown size={15}/></button></div>
      </header>
      <main className="content"><div key={location.pathname} className="mobile-page-transition"><Outlet/></div></main>
      <footer className="footer"><span>© {new Date().getFullYear()} Mr. Vanthiev. {t('All rights reserved.')}</span><span>{t('IPv4 calculations run locally in your browser.')}</span></footer>
    </div>
    <nav className="bottom-nav" aria-label={t('Mobile navigation')}>
      {mobileItems.map(item=><NavLink key={item.to} to={item.to} end className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`}><item.icon size={21} strokeWidth={2}/><span>{t(item.label)}</span></NavLink>)}
      <button ref={moreRef} className={`bottom-nav-link ${moreActive||open?'active':''}`} type="button" onClick={()=>setOpen(true)} aria-label={t('More tools')} aria-expanded={open}><MoreHorizontal size={22}/><span>{t('More')}</span></button>
    </nav>
    {(pwa.offlineReady||pwa.needRefresh)&&<div className="pwa-toast" role="status"><span>{t(pwa.needRefresh?'Update available. Refresh when ready.':'Ready for offline use.')}</span>{pwa.needRefresh&&<button type="button" className="pwa-refresh" onClick={pwa.refresh}>{t('Refresh')}</button>}<button type="button" className="pwa-toast-close" aria-label={t('Dismiss')} onClick={pwa.needRefresh?pwa.dismissRefresh:pwa.dismissOfflineReady}><X size={17}/></button></div>}
  </div>
}
