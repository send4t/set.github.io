import BigNumber from 'bignumber.js'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export function web3BNToFloatString(
  bn,
  divideBy,
  decimals,
  roundingMode = BigNumber.ROUND_DOWN
) {
  const converted = new BigNumber(bn.toString())
  const divided = converted.div(divideBy)
  return divided.toFixed(decimals, roundingMode)
}

export function cutAddress(address) {
  return address.slice(0, 3) + "..." + address.slice(address.length - 3, address.length)
}

export function isErrorExist(errors, index, fieldType) {
  if (typeof errors.list !== 'undefined') {
    if (typeof errors.list[index] !== 'undefined') {
      if (typeof errors.list[index][fieldType] !== 'undefined') {
        return true
      }
    }
  } else {
    return false
  }
}