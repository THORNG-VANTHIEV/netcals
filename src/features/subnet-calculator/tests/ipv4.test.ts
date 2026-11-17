import {describe,expect,it} from 'vitest'
import {calculateSubnet} from '../domain/subnet'
import {parseIPv4,parseMask,parsePrefix} from '../domain/ipv4'
describe('IPv4 subnet arithmetic',()=>{
  it('calculates normal ranges and canonical CIDR',()=>{const s=calculateSubnet('192.168.1.10',26);expect([s.cidr,s.broadcastAddress,s.firstAssignable,s.lastAssignable,s.usableAddresses,s.hostField]).toEqual(['192.168.1.0/26','192.168.1.63','192.168.1.1','192.168.1.62',62,'0.0.0.10'])})
  it('handles /0 without signed overflow',()=>{const s=calculateSubnet('203.0.113.4',0);expect([s.networkAddress,s.mask,s.totalAddresses,s.broadcastAddress]).toEqual(['0.0.0.0','0.0.0.0',4294967296,'255.255.255.255'])})
  it('handles /31 endpoints and /32 host route',()=>{const p2p=calculateSubnet('10.0.0.0',31),host=calculateSubnet('10.0.0.5',32);expect([p2p.firstAssignable,p2p.lastAssignable,p2p.broadcastAddress,p2p.usableAddresses]).toEqual(['10.0.0.0','10.0.0.1',null,2]);expect([host.cidr,host.broadcastAddress,host.usableAddresses]).toEqual(['10.0.0.5/32',null,1])})
  it('keeps high unsigned addresses valid',()=>{expect(calculateSubnet('250.250.250.250',24).cidr).toBe('250.250.250.0/24')})
  it('rejects invalid and ambiguous inputs',()=>{for(const ip of ['192.168.1.999','192.168.001.1','1..2.3','-1.2.3.4'])expect(()=>parseIPv4(ip)).toThrow();expect(()=>parseMask('255.0.255.0')).toThrow();expect(()=>parsePrefix(33)).toThrow();expect(parseMask('0.0.0.0')).toBe(0);expect(parseMask('255.255.255.255')).toBe(32)})
})
