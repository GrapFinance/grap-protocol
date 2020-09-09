import React, {useCallback, useEffect, useState} from "react";

import useGrap from "../../hooks/useGrap";
import {getProposals} from "../../grapUtils";

import Context from "./context";
import {Proposal} from "./types";

const Proposals: React.FC = ({children}) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const grap = useGrap();

  const fetchProposals = useCallback(async () => {
    const propsArr: Proposal[] = await getProposals(grap);
    setProposals(propsArr);
  }, [grap, setProposals]);

  useEffect(() => {
    if (grap) {
      fetchProposals()
    }
  }, [grap, fetchProposals]);

  return <Context.Provider value={{proposals}}>{children}</Context.Provider>;
};

export default Proposals;
