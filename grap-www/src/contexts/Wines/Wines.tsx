import React, {useCallback, useEffect, useState} from "react";

import {Contract} from "web3-eth-contract";

import {grap as grapAddress} from "../../constants/tokenAddresses";
import useGrap from "../../hooks/useGrap";
// import { getWineContracts } from '../../grapUtils'

import Context from "./context";
import {Wine} from "./types";

const Wines: React.FC = ({children}) => {
  const [wines, setWines] = useState<Wine[]>([]);
  const grap = useGrap();

  const fetchWines = useCallback(async () => {
    // const pools: {[key: string]: Contract} = await getPoolContracts(grap);

    const WinesArr: Wine[] = [];
    // const poolKeys = Object.keys(pools);

    // for (let i = 0; i < poolKeys.length; i++) {
    // const poolKey = poolKeys[i];
    // const pool = pools[poolKey];
    // }
    // setWines(winesArr);
  }, [grap, setWines]);

  useEffect(() => {
    if (grap) {
      fetchWines();
    }
  }, [grap, fetchWines]);

  return <Context.Provider value={{wines}}>{children}</Context.Provider>;
};

export default Wines;
