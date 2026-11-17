import {blockSize,networkStart,parseCIDR} from '../../subnet-calculator/domain/ipv4'
import {subnetFromNumber,type IPv4SubnetResult} from '../../subnet-calculator/domain/subnet'
export interface FLSMPlan {parent:IPv4SubnetResult;canonicalized:boolean;prefix:number;borrowedBits:number;possibleCount:number;requestedCount:number;hostsPerSubnet:number;unallocatedCount:number;row:(index:number)=>IPv4SubnetResult}
export function calculateFLSM(parentCIDR:string,mode:'subnets'|'hosts',amount:number):FLSMPlan {
  const {ip,prefix:parentPrefix}=parseCIDR(parentCIDR)
  if(!Number.isSafeInteger(amount)||amount<1) throw new Error('Enter a positive whole number.')
  const start=networkStart(ip,parentPrefix)
  let prefix:number
  if(mode==='subnets') {prefix=parentPrefix+Math.ceil(Math.log2(amount));if(prefix>32) throw new Error('That many subnets cannot fit inside the parent network.')}
  else {if(amount>0xffffffff-2) throw new Error('Host requirement is too large for IPv4.');const size=2**Math.max(2,Math.ceil(Math.log2(amount+2)));prefix=32-Math.log2(size);if(prefix<parentPrefix) throw new Error('A subnet with that many LAN hosts will not fit inside the parent.')}
  const possibleCount=2**(prefix-parentPrefix),requestedCount=mode==='subnets'?amount:possibleCount,size=blockSize(prefix)
  return {parent:subnetFromNumber(ip,parentPrefix),canonicalized:ip!==start,prefix,borrowedBits:prefix-parentPrefix,possibleCount,requestedCount,hostsPerSubnet:Math.max(0,size-2),unallocatedCount:possibleCount-requestedCount,row:(index:number)=>{if(!Number.isSafeInteger(index)||index<0||index>=requestedCount) throw new Error('Subnet row is out of range.');return subnetFromNumber(start+index*size,prefix)}}
}
