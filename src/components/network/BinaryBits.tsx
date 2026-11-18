import {parseIPv4} from '../../features/subnet-calculator/domain/ipv4'
import {useLocale} from '../../app/providers/LocaleProvider'
export function BinaryBits({ip,prefix,label}:{ip:string;prefix:number;label:string}){
  const {locale}=useLocale()
  const value=parseIPv4(ip)
  const bits=value.toString(2).padStart(32,'0').split('')
  return <div className="binary-line"><div className="binary-label"><strong>{label}</strong><span>{ip}</span></div><div className="binary-octets" aria-label={locale==='km'?`${label}: ${bits.join('')}, ${prefix} network bits ដំបូង និង ${32-prefix} host bits`:`${label}: ${bits.join('')}, first ${prefix} network bits and ${32-prefix} host bits`}>{[0,1,2,3].map(octet=><span className="octet" key={octet}>{bits.slice(octet*8,octet*8+8).map((bit,i)=><span key={i} className={octet*8+i<prefix?'network-bit':'host-bit'}>{bit}</span>)}</span>)}</div></div>
}
