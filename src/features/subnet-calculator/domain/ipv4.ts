export type IPv4 = number
export type Prefix = number
export function parseIPv4(value:string):IPv4 {
  const parts=value.trim().split('.')
  if(parts.length!==4||parts.some(part=>!/^(0|[1-9]\d{0,2})$/.test(part)||Number(part)>255)) throw new Error('Enter a valid IPv4 address with four decimal octets (0–255).')
  return parts.reduce((result,part)=>result*256+Number(part),0)
}
export function formatIPv4(value:IPv4):string {
  if(!Number.isInteger(value)||value<0||value>0xffffffff) throw new Error('IPv4 number is out of range.')
  return [24,16,8,0].map(shift=>Math.floor(value/2**shift)%256).join('.')
}
export function parsePrefix(value:string|number):Prefix {
  const input=String(value).trim().replace(/^\//,'')
  if(!/^(0|[1-9]\d?)$/.test(input)||Number(input)>32) throw new Error('Prefix must be an integer from /0 to /32.')
  return Number(input)
}
export function maskNumber(prefix:Prefix):number {return prefix===0?0:2**32-2**(32-prefix)}
export function parseMask(value:string):Prefix {
  const mask=parseIPv4(value)
  for(let prefix=0;prefix<=32;prefix++) if(maskNumber(prefix)===mask) return prefix
  throw new Error('Subnet mask must have contiguous 1 bits followed by 0 bits.')
}
export function parsePrefixOrMask(value:string):Prefix {return value.includes('.')?parseMask(value):parsePrefix(value)}
export function parseCIDR(value:string):{ip:IPv4;prefix:Prefix} {
  const parts=value.trim().split('/')
  if(parts.length!==2) throw new Error('Enter a network like 192.168.1.0/24.')
  return {ip:parseIPv4(parts[0]),prefix:parsePrefix(parts[1])}
}
export function blockSize(prefix:Prefix):number{return 2**(32-prefix)}
export function networkStart(ip:IPv4,prefix:Prefix):number {const size=blockSize(prefix);return Math.floor(ip/size)*size}
export function binaryIPv4(ip:IPv4):string {return [24,16,8,0].map(shift=>(Math.floor(ip/2**shift)%256).toString(2).padStart(8,'0')).join('.')}
