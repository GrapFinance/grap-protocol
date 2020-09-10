import {Grap} from "../../grap";

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
  getTicketsEarned as gTE,
  getWineRewards as gWR,
  totalWineAmount as tWA,
  getBalance as gB,
  getUnclaimedWines as gUW,
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

const getTicketsEarned = async (
  grap: typeof Grap,
  account: string
): Promise<number> => {
  const tickets = (await gTE(grap, account)).toNumber() as number;
  return tickets;
};

const totalWineAmount = async (grap: typeof Grap): Promise<string> => {
  return tWA(grap);
};
const getBalance = async (grap: typeof Grap): Promise<number> => {
  return gB(grap);
};
const getUnclaimedWines = async (
  grap: typeof Grap,
  account: string
): Promise<any[]> => {
  const wines = await gUW(grap, account);
  return wines;
};

export const getStats = async (grap: typeof Grap, account: string) => {
  const curPrice = await getCurrentPrice(grap);
  const circSupply = await getCirculatingSupply(grap);
  const nextRebase = await getNextRebaseTimestamp(grap);
  const targetPrice = await getTargetPrice(grap);
  const totalSupply = await getTotalSupply(grap);
  const tickets = await getTicketsEarned(grap, account);
  const remainWineAmount = await totalWineAmount(grap);
  const balance = await getBalance(grap);
  const unclaimedWines = await getUnclaimedWines(grap, account);
  const rewards = await getAllReward(grap);
  const myRewards = rewards.filter((r) => r.user === account);
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply,
    rewards,
    myRewards,
    tickets,
    remainWineAmount,
    balance,
    unclaimedWines,
  };
};
