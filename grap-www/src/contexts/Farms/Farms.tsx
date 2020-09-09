import React, {useCallback, useEffect, useState} from "react";

import {Contract} from "web3-eth-contract";

import {grap as grapAddress} from "../../constants/tokenAddresses";
import useGrap from "../../hooks/useGrap";
import {getPoolContracts} from "../../grapUtils";

import Context from "./context";
import {Farm} from "./types";

import dogefi from "../../assets/img/dogefi.png";

const NAME_FOR_POOL: {[key: string]: string} = {
  // new pools
  yffi_grap_univ_pool: "Oh. YFFI",
  grap_yfii_bal_pool: "YFII is friend.",
  eth_grap_univ_pool: "We all love ETH.",
  etherror_grap_univ_pool: "Error ETH POOL.",
  dogefi_grap_univ_pool: "DOGEFI is lovely.",

  // price uniswap
  ycrvUNIV_pool: "Eternal Lands",

  // old
  eth_pool: "Weth Homestead",
  yam_pool: "YAM",
  crv_pool: "Curvy Fields",
  yfi_pool: "YFI Farm",
  yfii_pool: "YFII Farm",
  comp_pool: "Compounding Hills",
  link_pool: "Marine Gardens",
  lend_pool: "Aave Agriculture",
  snx_pool: "Spartan Grounds",
  mkr_pool: "Maker Range",
};

const ICON_FOR_POOL: {[key: string]: React.ReactNode} = {
  grap_yfii_bal_pool: "✨",
  yffi_grap_univ_pool: "🔥",
  eth_grap_univ_pool: "😍",
  etherror_grap_univ_pool: "🚫",
  dogefi_grap_univ_pool: <img src={dogefi} height="96" />,

  ycrvUNIV_pool: "🌈",

  yfi_pool: "🐋",
  yfii_pool: "🦈",
  yam_pool: "🍠",
  eth_pool: "🌎",
  crv_pool: "🚜",
  comp_pool: "💸",
  link_pool: "🔗",
  lend_pool: "🏕️",
  snx_pool: "⚔️",
  mkr_pool: "🐮",
};

const isActivatePool: string[] = [
  "ycrvUNIV_pool",
  "grap_yfii_bal_pool",
  "eth_grap_univ_pool",
  "etherror_grap_univ_pool",
  "dogefi_grap_univ_pool",
];

const Farms: React.FC = ({children}) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const grap = useGrap();

  const fetchPools = useCallback(async () => {
    const pools: {[key: string]: Contract} = await getPoolContracts(grap);

    const farmsArr: Farm[] = [];
    const poolKeys = Object.keys(pools);

    for (let i = 0; i < poolKeys.length; i++) {
      const poolKey = poolKeys[i];
      const pool = pools[poolKey];
      let tokenKey = poolKey.replace("_pool", "");
      if (tokenKey === "eth") {
        tokenKey = "weth";
      } else if (tokenKey === "ycrvUNIV") {
        tokenKey = "uni_lp";
      }

      const method =
        tokenKey === "etherror_grap_univ"
          ? pool.methods["eth_grap_univ"]
          : pool.methods[tokenKey];

      if (method) {
        try {
          let tokenAddress = "";
          tokenAddress = await method().call();
          farmsArr.push({
            contract: pool,
            name: NAME_FOR_POOL[poolKey],
            depositToken: tokenKey,
            depositTokenAddress: tokenAddress,
            earnToken: "grap",
            earnTokenAddress: grapAddress,
            icon: ICON_FOR_POOL[poolKey],
            id: tokenKey,
            isActivate: isActivatePool.includes(poolKey),
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
    const highPriority = ["etherror_grap_univ"];
    farmsArr.sort(
      (a, b) =>
        (a.isActivate ? -1 : 1) +
        (highPriority.includes(a.depositToken) ? 1 : 0)
    );

    setFarms(farmsArr);
  }, [grap, setFarms]);

  useEffect(() => {
    if (grap) {
      fetchPools();
    }
  }, [grap, fetchPools]);

  return <Context.Provider value={{farms}}>{children}</Context.Provider>;
};

export default Farms;
