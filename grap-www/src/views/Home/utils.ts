import { Grap } from '../../grap'

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
} from '../../grapUtils'

const getCurrentPrice = async (grap: typeof Grap): Promise<number> => {
  // FORBROCK: get current GRAP price
  return gCP(grap)
}

const getTargetPrice = async (grap: typeof Grap): Promise<number> => {
  // FORBROCK: get target GRAP price
  return gTP(grap)
}

const getCirculatingSupply = async (grap: typeof Grap): Promise<string> => {
  // FORBROCK: get circulating supply
  return gCS(grap)
}

const getNextRebaseTimestamp = async (grap: typeof Grap): Promise<number> => {
  // FORBROCK: get next rebase timestamp
  const nextRebase = await gNRT(grap) as number
  return nextRebase * 1000
}

const getTotalSupply = async (grap: typeof Grap): Promise<string> => {
  // FORBROCK: get total supply
  return gTS(grap)
}

export const getStats = async (grap: typeof Grap) => {
  const curPrice = await getCurrentPrice(grap)
  const circSupply = await getCirculatingSupply(grap)
  const nextRebase = await getNextRebaseTimestamp(grap)
  const targetPrice = await getTargetPrice(grap)
  const totalSupply = await getTotalSupply(grap)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}
