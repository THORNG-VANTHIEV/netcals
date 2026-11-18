import {useEffect,useRef,useState} from 'react'
import {registerSW} from 'virtual:pwa-register'

interface InstallPromptEvent extends Event {
  prompt:()=>Promise<void>
  userChoice:Promise<{outcome:'accepted'|'dismissed'}>
}

function isInstalled(){
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & {standalone?:boolean}).standalone===true
}

export function usePWA(){
  const [installPrompt,setInstallPrompt]=useState<InstallPromptEvent|null>(null)
  const [installed,setInstalled]=useState(isInstalled)
  const [installHelp,setInstallHelp]=useState(false)
  const [offlineReady,setOfflineReady]=useState(false)
  const [needRefresh,setNeedRefresh]=useState(false)
  const registrationStarted=useRef(false)
  const updateSW=useRef<ReturnType<typeof registerSW>|null>(null)

  useEffect(()=>{
    const onInstallPrompt=(event:Event)=>{event.preventDefault();setInstallPrompt(event as InstallPromptEvent)}
    const onInstalled=()=>{setInstalled(true);setInstallPrompt(null);setInstallHelp(false)}
    window.addEventListener('beforeinstallprompt',onInstallPrompt)
    window.addEventListener('appinstalled',onInstalled)
    if(import.meta.env.PROD&&!registrationStarted.current){
      registrationStarted.current=true
      updateSW.current=registerSW({
        immediate:true,
        onNeedRefresh:()=>setNeedRefresh(true),
        onOfflineReady:()=>setOfflineReady(true),
      })
    }
    return()=>{
      window.removeEventListener('beforeinstallprompt',onInstallPrompt)
      window.removeEventListener('appinstalled',onInstalled)
    }
  },[])

  async function install(){
    if(!installPrompt){setInstallHelp(value=>!value);return}
    await installPrompt.prompt()
    const choice=await installPrompt.userChoice
    setInstallPrompt(null)
    if(choice.outcome==='accepted')setInstallHelp(false)
  }

  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||
    (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)
  const isAndroid=/Android/.test(navigator.userAgent)
  const installInstructions=isIOS
    ?'In Safari, tap Share and choose Add to Home Screen.'
    :isAndroid
      ?'Open the browser menu and choose Install app or Add to Home screen.'
      :'Open the browser menu and choose Install NetCalc Pro.'

  return {
    installed,install,installHelp,installInstructions,
    offlineReady,dismissOfflineReady:()=>setOfflineReady(false),
    needRefresh,dismissRefresh:()=>setNeedRefresh(false),
    refresh:()=>updateSW.current?.(true),
  }
}
