import {createContext,useContext,useEffect,useState,type ReactNode} from 'react'
type Theme='light'|'dark'
const ThemeContext=createContext<{theme:Theme;toggle:()=>void}>({theme:'light',toggle:()=>{}})
export function ThemeProvider({children}:{children:ReactNode}){
  const [theme,setTheme]=useState<Theme>(()=>{try{return localStorage.getItem('netcalc-theme')==='dark'?'dark':'light'}catch{return 'light'}})
  useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('netcalc-theme',theme)}catch{/* local storage unavailable */}},[theme])
  return <ThemeContext.Provider value={{theme,toggle:()=>setTheme(current=>current==='light'?'dark':'light')}}>{children}</ThemeContext.Provider>
}
export const useTheme=()=>useContext(ThemeContext)
