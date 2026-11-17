import {describe,expect,it} from 'vitest'
import {allocateVLSM} from '../application/allocateVLSM'
describe('VLSM planning',()=>{
  const demands=[{id:'a',name:'A',requiredHosts:100},{id:'b',name:'B',requiredHosts:50},{id:'c',name:'C',requiredHosts:20}]
  it('allocates sorted requirements and reports address utilization',()=>{const plan=allocateVLSM('192.168.10.0/24',demands);expect(plan.allocations.map(item=>item.subnet.cidr)).toEqual(['192.168.10.0/25','192.168.10.128/26','192.168.10.192/27']);expect([plan.unallocatedStart,plan.unallocatedAddresses,plan.allocationPercent]).toEqual(['192.168.10.224',32,87.5])})
  it('fails the whole plan on overflow',()=>{expect(()=>allocateVLSM('192.168.1.0/24',[{id:'a',name:'A',requiredHosts:200},{id:'b',name:'B',requiredHosts:100}])).toThrow(/Insufficient/)})
  it('supports explicit point-to-point and host routes',()=>{const plan=allocateVLSM('10.0.0.0/29',[{id:'a',name:'P2P',requiredHosts:2,mode:'point-to-point'},{id:'b',name:'Host',requiredHosts:1,mode:'host-route'}]);expect(plan.allocations.map(item=>item.subnet.cidr)).toEqual(['10.0.0.0/31','10.0.0.2/32'])})
  it('escapes dangerous CSV labels through the adapter',async()=>{const {csv}=await import('../../../shared/lib/export');expect(csv(['Name'],[['=HYPERLINK("x")']])).toContain("'=HYPERLINK")})
})
