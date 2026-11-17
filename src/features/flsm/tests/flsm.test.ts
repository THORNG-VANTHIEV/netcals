import {describe,expect,it} from 'vitest'
import {calculateFLSM} from '../application/calculateFLSM'
describe('FLSM planning',()=>{
  it('splits /24 into four /26 networks',()=>{const plan=calculateFLSM('192.168.1.0/24','subnets',4);expect([plan.prefix,plan.hostsPerSubnet,plan.possibleCount]).toEqual([26,62,4]);expect(Array.from({length:4},(_,i)=>plan.row(i).cidr)).toEqual(['192.168.1.0/26','192.168.1.64/26','192.168.1.128/26','192.168.1.192/26'])})
  it('canonicalizes the parent and reports unused blocks',()=>{const plan=calculateFLSM('192.168.1.123/24','subnets',3);expect(plan.canonicalized).toBe(true);expect(plan.parent.cidr).toBe('192.168.1.0/24');expect(plan.unallocatedCount).toBe(1)})
  it('keeps huge results lazy',()=>{const plan=calculateFLSM('0.0.0.0/0','subnets',4294967296);expect(plan.row(4294967295).cidr).toBe('255.255.255.255/32')})
  it('uses normal LAN host rule',()=>{expect(calculateFLSM('10.0.0.0/24','hosts',2).prefix).toBe(30);expect(()=>calculateFLSM('10.0.0.0/31','hosts',1)).toThrow()})
})
