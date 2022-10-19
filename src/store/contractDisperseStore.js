import DisperseABI from '../assets/abi/DisperseABI.json'

export const DISPERSE_CONTRACT = '0x9c92b550689f2121D4E11801C17235129Aa679aA';

export function getDisperseContract(contractAddress, web3) {
  return web3
    ? new web3.eth.Contract(DisperseABI, contractAddress, {
      from: web3.eth.defaultAccount,
    })
    : null
}
