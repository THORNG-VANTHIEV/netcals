import {networkStart,parseCIDR,formatIPv4} from '../../subnet-calculator/domain/ipv4'
import {subnetFromNumber,type IPv4SubnetResult} from '../../subnet-calculator/domain/subnet'
export interface VLSMRequirement {id:string;name:string;requiredHosts:number;mode?:'lan'|'point-to-point'|'host-route';description?:string}
export interface VLSMAllocation extends VLSMRequirement {subnet:IPv4SubnetResult;unusedCapacity:number}
export interface VLSMPlan {parent:IPv4SubnetResult;canonicalized:boolean;allocations:VLSMAllocation[];allocatedAddresses:number;unallocatedAddresses:number;unallocatedStart:string|null;allocationPercent:number;demandEfficiencyPercent:number}
export function allocateVLSM(parentCIDR:string,requirements:VLSMRequirement[]):VLSMPlan {
  const {ip,prefix:parentPrefix}=parseCIDR(parentCIDR)
  if(!requirements.length) throw new Error('Add at least one requirement.')
  const parent=subnetFromNumber(ip,parentPrefix)
  const prepared=requirements.map((requirement,order)=>{
    const mode=requirement.mode||'lan'
    if(!requirement.name.trim()) throw new Error(`Requirement ${order+1} needs a name.`)
    if(!Number.isSafeInteger(requirement.requiredHosts)||requirement.requiredHosts<(mode==='lan'?1:0)) throw new Error(`${requirement.name}: enter a valid whole-number host demand.`)
    if(mode==='point-to-point'&&requirement.requiredHosts>2) throw new Error(`${requirement.name}: a /31 supports two endpoints.`)
    if(mode==='host-route'&&requirement.requiredHosts>1) throw new Error(`${requirement.name}: a /32 supports one host.`)
    if(mode==='lan'&&requirement.requiredHosts>0xffffffff-2) throw new Error(`${requirement.name}: demand exceeds IPv4 space.`)
    const size=mode==='point-to-point'?2:mode==='host-route'?1:2**Math.max(2,Math.ceil(Math.log2(requirement.requiredHosts+2)))
    return {...requirement,mode,size,order}
  }).sort((a,b)=>b.size-a.size||a.order-b.order)
  const allocations:VLSMAllocation[]=[]
  let cursor=parent.start
  for(const requirement of prepared) {
    const aligned=Math.ceil(cursor/requirement.size)*requirement.size
    if(aligned+requirement.size-1>parent.end) throw new Error('Insufficient address space: the full VLSM plan does not fit in the parent network.')
    const subnet=subnetFromNumber(aligned,32-Math.log2(requirement.size))
    allocations.push({...requirement,subnet,unusedCapacity:subnet.usableAddresses-requirement.requiredHosts})
    cursor=aligned+requirement.size
  }
  const allocatedAddresses=allocations.reduce((sum,item)=>sum+item.subnet.totalAddresses,0)
  const unallocatedAddresses=parent.totalAddresses-allocatedAddresses
  const demand=requirements.reduce((sum,item)=>sum+item.requiredHosts,0)
  const capacity=allocations.reduce((sum,item)=>sum+item.subnet.usableAddresses,0)
  return {parent,canonicalized:ip!==networkStart(ip,parentPrefix),allocations,allocatedAddresses,unallocatedAddresses,unallocatedStart:cursor<=parent.end?formatIPv4(cursor):null,allocationPercent:allocatedAddresses/parent.totalAddresses*100,demandEfficiencyPercent:capacity?demand/capacity*100:0}
}
