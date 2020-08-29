import {Contract} from "web3-eth-contract";

export interface Wine {
  contract: Contract;
  name: string;
  icon: React.ReactNode;
  id: string;
}

export interface WinesContext {
  wines: Wine[];
}
