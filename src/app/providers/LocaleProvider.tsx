import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react'
import {translations} from '../translations'

export type Locale='en'|'km'
type LocaleContextValue={locale:Locale;setLocale:(locale:Locale)=>void;t:(text:string)=>string}
const LocaleContext=createContext<LocaleContextValue|null>(null)
const STORAGE_KEY='netcalc-language'

function initialLocale():Locale {
  try {return localStorage.getItem(STORAGE_KEY)==='km'?'km':'en'} catch {return 'en'}
}

export function LocaleProvider({children}:{children:ReactNode}) {
  const [locale,setLocale]=useState<Locale>(initialLocale)
  useEffect(()=>{
    document.documentElement.lang=locale
    document.title=locale==='km'?'NetCalc Pro — ឧបករណ៍គណនា IPv4':'NetCalc Pro — IPv4 Network Toolkit'
    try {localStorage.setItem(STORAGE_KEY,locale)} catch { /* Browsers can disable storage. */ }
  },[locale])
  const value=useMemo<LocaleContextValue>(()=>({locale,setLocale,t:(text:string)=>{
    if(locale==='en')return text
    const match=text.match(/^(\s*)([\s\S]*?)(\s*)$/)
    if(!match)return text
    return match[1]+(translations[match[2]]??match[2])+match[3]
  }}),[locale])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(){const value=useContext(LocaleContext);if(!value)throw new Error('LocaleProvider is missing');return value}
