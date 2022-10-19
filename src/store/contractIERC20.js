import IERC20ABI from '../assets/abi/IERC20ABI.json'

export function getIERC20Contract(tokenAddress, web3, from) {
  return web3
    ? new web3.eth.Contract(IERC20ABI, tokenAddress, {from})
    : null
}