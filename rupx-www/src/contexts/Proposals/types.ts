
export type ProposalStatusCode = number;

export interface Proposal {
  id: string,
  proposer: string,
  targets: Array<string>,
  signatures: Array<string>,
  startBlock: number,
  endBlock: number,
  values: Array<string>,
  description: string,
  status: ProposalStatusCode,
  transactionHash: string
}

export interface ProposalStatus {
  id: string,
  proposer: string,
  eta: number,
  startBlock: number,
  endBlock: number,
  forVotes: string,
  againstVotes: string,
  canceled: boolean,
  executed: boolean
}

export interface ProposalsContext {
  proposals: Proposal[]
}