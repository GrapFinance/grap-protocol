import React, {createContext, useEffect, useState} from "react";

import {useWallet} from "use-wallet";

import {Grap} from "../../grap";

export interface GrapContext {
  grap?: typeof Grap;
}

export const Context = createContext<GrapContext>({
  grap: undefined,
});

declare global {
  interface Window {
    grapsauce: any;
  }
}

const GrapProvider: React.FC = ({children}) => {
  const {ethereum} = useWallet();
  const [grap, setGrap] = useState<any>();

  useEffect(() => {
    if (ethereum) {
      const grapLib = new Grap(ethereum, "1", false, {
        defaultAccount: "",
        defaultConfirmations: 1,
        autoGasMultiplier: 1.5,
        testing: false,
        defaultGas: "6000000",
        defaultGasPrice: "1000000000000",
        accounts: [],
        ethereumNodeTimeout: 10000,
      });
      setGrap(grapLib);
      window.grapsauce = grapLib;
    }
  }, [ethereum]);

  return <Context.Provider value={{grap}}>{children}</Context.Provider>;
};

export default GrapProvider;
