import {binaryIPv4,blockSize,formatIPv4,maskNumber,networkStart,parseIPv4,parsePrefixOrMask,type IPv4,type Prefix} from './ipv4'
export interface IPv4SubnetResult {inputIP:string;prefix:Prefix;cidr:string;mask:string;wildcardMask:string;networkAddress:string;hostField:string;broadcastAddress:string|null;firstAssignable:string;lastAssignable:string;totalAddresses:number;usableAddresses:number;addressType:'lan'|'point-to-point'|'host-route';start:IPv4;end:IPv4;binaryIP:string;binaryMask:string;binaryNetwork:string;addressClass:string;scope:string;scopeNote:string;increment:string}
function inBlock(ip:number,start:string,prefix:number):boolean{return networkStart(ip,prefix)===parseIPv4(start)}
export function classifyAddress(ip:IPv4):{addressClass:string;scope:string;scopeNote:string} {
  const first=Math.floor(ip/2**24)
  const addressClass=first<128?'Class A (historical)':first<192?'Class B (historical)':first<224?'Class C (historical)':first<240?'Class D (multicast)':'Class E (reserved)'
  let scope='Public or other',scopeNote='This educational label does not guarantee global reachability.'
  const ranges:[string,number,string][]=[['0.0.0.0',8,'Current network / unspecified'],['10.0.0.0',8,'Private'],['100.64.0.0',10,'Shared address space'],['127.0.0.0',8,'Loopback'],['169.254.0.0',16,'Link-local'],['172.16.0.0',12,'Private'],['192.0.0.0',24,'Special purpose'],['192.0.2.0',24,'Documentation'],['192.168.0.0',16,'Private'],['198.18.0.0',15,'Benchmarking'],['198.51.100.0',24,'Documentation'],['203.0.113.0',24,'Documentation'],['224.0.0.0',4,'Multicast'],['240.0.0.0',4,'Reserved']]
  for(const [start,prefix,label] of ranges) if(inBlock(ip,start,prefix)){scope=label;scopeNote='Category is based on the entered IP, not the entire subnet.';break}
  return {addressClass,scope,scopeNote}
}
export function subnetFromNumber(ip:IPv4,prefix:Prefix):IPv4SubnetResult {
  const size=blockSize(prefix),start=networkStart(ip,prefix),end=start+size-1
  const type=prefix===31?'point-to-point':prefix===32?'host-route':'lan'
  const mask=maskNumber(prefix),first=type==='lan'?start+1:start,last=type==='lan'?end-1:end
  return {inputIP:formatIPv4(ip),prefix,cidr:`${formatIPv4(start)}/${prefix}`,mask:formatIPv4(mask),wildcardMask:formatIPv4(0xffffffff-mask),networkAddress:formatIPv4(start),hostField:formatIPv4(ip-start),broadcastAddress:type==='lan'?formatIPv4(end):null,firstAssignable:formatIPv4(first),lastAssignable:formatIPv4(last),totalAddresses:size,usableAddresses:type==='lan'?Math.max(0,size-2):size,addressType:type,start,end,binaryIP:binaryIPv4(ip),binaryMask:binaryIPv4(mask),binaryNetwork:binaryIPv4(start),...classifyAddress(ip),increment:prefix===0?'Entire IPv4 space':prefix===32?'Single address':`${2**(8-(prefix%8||8))} in the relevant octet`}
}
export function calculateSubnet(ip:string,prefixOrMask:string|number):IPv4SubnetResult{return subnetFromNumber(parseIPv4(ip),parsePrefixOrMask(String(prefixOrMask)))}
