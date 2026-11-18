import {useLocale} from '../../../app/providers/LocaleProvider'
import {useEffect,useRef,useState,type FormEvent} from 'react'
import {useLocation,useSearchParams} from 'react-router-dom'
import {ArrowRight,Link2,RotateCcw,Sparkles} from 'lucide-react'
import {Button,Card,ErrorNotice,Field,PageHeader} from '../../../components/ui'
import {calculateSubnet,type IPv4SubnetResult} from '../application/calculateSubnet'
import {SubnetResults} from './SubnetResults'
const presets=[8,16,24,25,26,27,28,29,30,31,32]
function initialResult(ip:string,prefix:string):IPv4SubnetResult|null{try{return calculateSubnet(ip,prefix)}catch{return null}}
export function SubnetCalculatorPage(){const {t}=useLocale();
  const [params,setParams]=useSearchParams()
  const location=useLocation()
  const previousSearch=useRef(location.search)
  const ownSearch=useRef<string|null>(null)
  const [ip,setIp]=useState(params.get('ip')??'192.168.1.10'),[prefix,setPrefix]=useState(params.get('prefix')??'26')
  const [result,setResult]=useState<IPv4SubnetResult|null>(()=>initialResult(params.get('ip')??'192.168.1.10',params.get('prefix')??'26'))
  const [error,setError]=useState(()=>{try{calculateSubnet(params.get('ip')??'192.168.1.10',params.get('prefix')??'26');return ''}catch(e){return (e as Error).message}}),[linkCopied,setLinkCopied]=useState(false)
  useEffect(()=>{
    if(previousSearch.current===location.search) return
    previousSearch.current=location.search
    if(ownSearch.current===location.search){ownSearch.current=null;return}
    ownSearch.current=null
    const nextParams=new URLSearchParams(location.search)
    const nextIP=nextParams.get('ip')??'192.168.1.10'
    const nextPrefix=nextParams.get('prefix')??'26'
    setIp(nextIP);setPrefix(nextPrefix)
    try{setResult(calculateSubnet(nextIP,nextPrefix));setError('')}
    catch(e){setResult(null);setError((e as Error).message)}
  },[location.search])
  useEffect(()=>{
    const onPopState=()=>{
      ownSearch.current=null
      const hash=window.location.hash
      const search=hash.includes('?')?hash.slice(hash.indexOf('?')):''
      previousSearch.current=search
      const nextParams=new URLSearchParams(search)
      const nextIP=nextParams.get('ip')??'192.168.1.10'
      const nextPrefix=nextParams.get('prefix')??'26'
      setIp(nextIP);setPrefix(nextPrefix)
      try{setResult(calculateSubnet(nextIP,nextPrefix));setError('')}
      catch(e){setResult(null);setError((e as Error).message)}
    }
    window.addEventListener('popstate',onPopState)
    return()=>window.removeEventListener('popstate',onPopState)
  },[])
  function submit(event:FormEvent){event.preventDefault();try{const next=calculateSubnet(ip,prefix);setResult(next);setError('');const nextParams=new URLSearchParams({ip:next.inputIP,prefix:String(next.prefix)});ownSearch.current=`?${nextParams}`===location.search?null:`?${nextParams}`;setParams(nextParams)}catch(e){setResult(null);setError((e as Error).message);document.getElementById((e as Error).message.includes('IPv4 address')?'ip-input':'prefix-input')?.focus()}}
  function reset(){setIp('192.168.1.10');setPrefix('26');setResult(calculateSubnet('192.168.1.10',26));setError('');ownSearch.current=location.search===''?null:'';setParams({})}
  async function share(){try{await navigator.clipboard.writeText(window.location.href);setLinkCopied(true);setTimeout(()=>setLinkCopied(false),1800)}catch{setError('Could not copy the link. Copy it from your browser address bar.')}}
  return <><PageHeader eyebrow="TOOLS / IPV4" title="Subnet Calculator" description="Turn any IPv4 address into a clear, complete network breakdown."><span className="header-badge"><Sparkles size={15}/>{t(" Instant results")}</span></PageHeader><Card className="form-card"><div className="card-heading"><div><h2>{t("Enter network details")}</h2><p>{t("Start with an address and a CIDR prefix or subnet mask.")}</p></div><span className="step-mark">01 / 02</span></div><form onSubmit={submit}><div className="form-grid"><Field id="ip-input" label="IPv4 address" value={ip} onChange={e=>{setIp(e.target.value);setResult(null);setError('')}} placeholder="e.g. 192.168.1.10" autoComplete="off"/><Field id="prefix-input" label="CIDR prefix or subnet mask" value={prefix} onChange={e=>{setPrefix(e.target.value);setResult(null);setError('')}} placeholder="/26 or 255.255.255.192" autoComplete="off"/></div><div className="preset-row"><span>{t("Quick presets")}</span>{presets.map(value=><button type="button" key={value} className={prefix===String(value)?'preset active':'preset'} onClick={()=>{setPrefix(String(value));setResult(null);setError('')}}>/{value}</button>)}</div>{error&&<ErrorNotice message={error}/>}<div className="form-actions"><Button type="submit">{t("Calculate subnet ")}<ArrowRight size={17}/></Button><Button type="button" variant="secondary" onClick={reset}><RotateCcw size={16}/>{t(" Reset")}</Button><Button type="button" variant="ghost" onClick={share} disabled={!result}><Link2 size={16}/>{t(linkCopied?'Link copied':'Share link')}</Button></div></form></Card>{result&&<SubnetResults result={result}/>}</>
}
