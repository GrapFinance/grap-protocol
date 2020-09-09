import {Grap} from "../../grap";

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
  getTicketsEarned as gTE,
  getWineRewards as gWR,
} from "../../grapUtils";

const getCurrentPrice = async (grap: typeof Grap): Promise<number> => {
  // FORBROCK: get current GRAP price
  return gCP(grap);
};

const getTargetPrice = async (grap: typeof Grap): Promise<number> => {
  // FORBROCK: get target GRAP price
  return gTP(grap);
};

const getCirculatingSupply = async (grap: typeof Grap): Promise<string> => {
  // FORBROCK: get circulating supply
  return gCS(grap);
};

const getNextRebaseTimestamp = async (grap: typeof Grap): Promise<number> => {
  // FORBROCK: get next rebase timestamp
  const nextRebase = (await gNRT(grap)) as number;
  return nextRebase * 1000;
};

const getTotalSupply = async (grap: typeof Grap): Promise<string> => {
  // FORBROCK: get total supply
  return gTS(grap);
};

const getAllReward = async (grap: typeof Grap): Promise<Array<any>> => {
  const rewards: Array<any> = (await gWR(grap, ["Reward", "Airdrop"])) as Array<
    any
  >;
  return rewards;
};

const getTicketsEarned = async (grap: typeof Grap): Promise<number> => {
  const tickets = (await gTE(grap)).toNumber() as number;
  return tickets;
};

export const getStats = async (grap: typeof Grap) => {
  const curPrice = 0;
  // await getCurrentPrice(grap);
  const circSupply = "0";
  // await getCirculatingSupply(grap);
  const nextRebase = 0;
  // await getNextRebaseTimestamp(grap);
  const targetPrice = 0;
  // await getTargetPrice(grap);
  const totalSupply = "10";
  // await getTotalSupply(grap);
  const rewards = await getAllReward(grap);
  const tickets = await getTicketsEarned(grap);
  console.log("============");
  console.log(tickets);
  debugger;
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply,
    rewards,
    tickets,
  };
};
