import BigNumber from 'bignumber.js/bignumber';
import Web3 from 'web3';
import * as Types from "./types.js";
import { SUBTRACT_GAS_LIMIT, addressMap } from './constants.js';

import ERC20Json from '../clean_build/contracts/IERC20.json';
import GRAPJson from '../clean_build/contracts/GRAPDelegator.json';
import GRAPRebaserJson from '../clean_build/contracts/GRAPRebaser.json';
import GRAPReservesJson from '../clean_build/contracts/GRAPReserves.json';
import GRAPGovJson from '../clean_build/contracts/GovernorAlpha.json';
import GRAPTimelockJson from '../clean_build/contracts/Timelock.json';
import WETHJson from './weth.json';
import CRVJson from './crv.json';
import UNIFactJson from './unifact2.json';
import UNIPairJson from './uni2.json';
import UNIRouterJson from './uniR.json';

// basic pool
import WETHPoolJson from '../clean_build/contracts/GRAPETHPool.json';
import YAMPoolJson from '../clean_build/contracts/GRAPYAMPool.json';
import YFIPoolJson from '../clean_build/contracts/GRAPYFIPool.json';
import YFIIPoolJson from '../clean_build/contracts/GRAPYFIIPool.json';
import MKRPoolJson from '../clean_build/contracts/GRAPMKRPool.json';
import LENDPoolJson from '../clean_build/contracts/GRAPLENDPool.json';
import COMPPoolJson from '../clean_build/contracts/GRAPCOMPPool.json';
import CRVPoolJson from '../clean_build/contracts/GRAPCRVPool.json';
import LINKPoolJson from '../clean_build/contracts/GRAPLINKPool.json';
import SNXPoolJson from '../clean_build/contracts/GRAPSNXPool.json';

// uniswap pool
import IncJson from '../clean_build/contracts/GRAPIncentivizer.json';

// advanced pool
import YFFIPoolJson from '../clean_build/contracts/GRAPYFFIUNIVPool.json';
import YFIIBALPoolJson from '../clean_build/contracts/GRAPYFIIBALANCERPool.json';
import ETHUNIVPoolJson from '../clean_build/contracts/GRAPETHUNIVPool.json';
import DOGEFIUNIVPoolJson from '../clean_build/contracts/GRAPDOGEFIUNIVPool.json';
import ETHUNIVERRORPoolJson from '../clean_build/contracts/GRAPETHUNIVERRORPool.json'

// wine
import BrewMasterJson from '../clean_build/contracts/BrewMaster.json';
import GRAPWineJson from '../clean_build/contracts/GRAPWine.json';
import WineTraderJson from '../clean_build/contracts/WineTrader.json';

export class Contracts {
  constructor(
    provider,
    networkId,
    web3,
    options
  ) {
    this.web3 = web3;
    this.defaultConfirmations = options.defaultConfirmations;
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5;
    this.confirmationType = options.confirmationType || Types.ConfirmationType.Confirmed;
    this.defaultGas = options.defaultGas;
    this.defaultGasPrice = options.defaultGasPrice;

    this.uni_pair = new this.web3.eth.Contract(UNIPairJson);
    this.uni_router = new this.web3.eth.Contract(UNIRouterJson);
    this.uni_fact = new this.web3.eth.Contract(UNIFactJson);

    // advanced pool
    this.yffi_grap_univ_pool = new this.web3.eth.Contract(YFFIPoolJson.abi);
    this.grap_yfii_bal_pool = new this.web3.eth.Contract(YFIIBALPoolJson.abi);
    this.eth_grap_univ_pool = new this.web3.eth.Contract(ETHUNIVPoolJson.abi);
    this.etherror_grap_univ_pool = new this.web3.eth.Contract(ETHUNIVERRORPoolJson.abi);
    this.dogefi_grap_univ_pool = new this.web3.eth.Contract(DOGEFIUNIVPoolJson.abi);

    this.eth_pool = new this.web3.eth.Contract(WETHPoolJson.abi);
    // this.weth_pool = this.eth_pool;
    this.yfi_pool = new this.web3.eth.Contract(YFIPoolJson.abi);
    this.yfii_pool = new this.web3.eth.Contract(YFIIPoolJson.abi);
    this.yam_pool = new this.web3.eth.Contract(YAMPoolJson.abi);
    this.crv_pool = new this.web3.eth.Contract(CRVPoolJson.abi);
    this.comp_pool = new this.web3.eth.Contract(COMPPoolJson.abi);
    this.link_pool = new this.web3.eth.Contract(LINKPoolJson.abi);
    this.lend_pool = new this.web3.eth.Contract(LENDPoolJson.abi);
    this.mkr_pool = new this.web3.eth.Contract(MKRPoolJson.abi);
    this.snx_pool = new this.web3.eth.Contract(SNXPoolJson.abi);

    this.ycrvUNIV_pool = new this.web3.eth.Contract(IncJson.abi);

    this.yfi = new this.web3.eth.Contract(ERC20Json.abi);
    this.yam = new this.web3.eth.Contract(ERC20Json.abi);
    this.crv = new this.web3.eth.Contract(ERC20Json.abi);
    this.grap = new this.web3.eth.Contract(GRAPJson.abi);
    this.comp = new this.web3.eth.Contract(ERC20Json.abi);
    this.yam = new this.web3.eth.Contract(ERC20Json.abi);
    this.link = new this.web3.eth.Contract(ERC20Json.abi);
    this.lend = new this.web3.eth.Contract(ERC20Json.abi);
    this.mkr = new this.web3.eth.Contract(ERC20Json.abi);
    this.yfii = new this.web3.eth.Contract(ERC20Json.abi);
    this.snx = new this.web3.eth.Contract(ERC20Json.abi);
    this.ycrv = new this.web3.eth.Contract(ERC20Json.abi);
    this.yffi = new this.web3.eth.Contract(ERC20Json.abi);
    this.dogefi = new this.web3.eth.Contract(ERC20Json.abi);
    this.erc20 = new this.web3.eth.Contract(ERC20Json.abi);

    this.ycrvUNIV = new this.web3.eth.Contract(ERC20Json.abi);
    this.uni_lp = this.ycrvUNIV;

    this.yffi_grap_univ = new this.web3.eth.Contract(ERC20Json.abi);
    this.grap_yfii_bal = new this.web3.eth.Contract(ERC20Json.abi);
    this.eth_grap_univ = new this.web3.eth.Contract(ERC20Json.abi);
    this.etherror_grap_univ = new this.web3.eth.Contract(ERC20Json.abi);
    this.dogefi_grap_univ = new this.web3.eth.Contract(ERC20Json.abi);

    this.rebaser = new this.web3.eth.Contract(GRAPRebaserJson.abi);
    this.reserves = new this.web3.eth.Contract(GRAPReservesJson.abi);
    this.gov = new this.web3.eth.Contract(GRAPGovJson.abi);
    this.timelock = new this.web3.eth.Contract(GRAPTimelockJson.abi);
    this.weth = new this.web3.eth.Contract(WETHJson);

    // wine
    this.brewMaster = new this.web3.eth.Contract(BrewMasterJson.abi);
    this.grapWine = new this.web3.eth.Contract(GRAPWineJson.abi);
    this.wineTrader = new this.web3.eth.Contract(WineTraderJson.abi);

    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount);
  }


  setProvider(
    provider,
    networkId
  ) {
    this.grap.setProvider(provider);
    this.rebaser.setProvider(provider);
    this.reserves.setProvider(provider);
    this.gov.setProvider(provider);
    this.timelock.setProvider(provider);

    // wine
    this.brewMaster.setProvider(provider);
    this.grapWine.setProvider(provider);
    this.wineTrader.setProvider(provider);
    const contracts = [
      // advanced pool
      { contract: this.yffi_grap_univ_pool, json: YFFIPoolJson },
      { contract: this.grap_yfii_bal_pool, json: YFIIBALPoolJson },
      { contract: this.eth_grap_univ_pool, json: ETHUNIVPoolJson },
      { contract: this.dogefi_grap_univ_pool, json: DOGEFIUNIVPoolJson },
      { contract: this.etherror_grap_univ_pool, json: ETHUNIVERRORPoolJson },

      // basic
      { contract: this.grap, json: GRAPJson },
      { contract: this.rebaser, json: GRAPRebaserJson },
      { contract: this.reserves, json: GRAPReservesJson },
      { contract: this.gov, json: GRAPGovJson },
      { contract: this.timelock, json: GRAPTimelockJson },
      { contract: this.eth_pool, json: WETHPoolJson },
      { contract: this.yfi_pool, json: YFIPoolJson },
      { contract: this.yfii_pool, json: YFIIPoolJson },
      { contract: this.yam_pool, json: YAMPoolJson },
      { contract: this.crv_pool, json: CRVPoolJson },
      { contract: this.mkr_pool, json: MKRPoolJson },
      { contract: this.snx_pool, json: SNXPoolJson },
      { contract: this.lend_pool, json: LENDPoolJson },
      { contract: this.link_pool, json: LINKPoolJson },
      { contract: this.comp_pool, json: COMPPoolJson },
      { contract: this.ycrvUNIV_pool, json: IncJson },

      // wine
      { contract: this.brewMaster, json: BrewMasterJson },
      { contract: this.grapWine, json: GRAPWineJson },
      { contract: this.wineTrader, json: WineTraderJson },
    ]

    contracts.forEach(contract => this.setContractProvider(
        contract.contract,
        contract.json,
        provider,
        networkId,
      ),
    );
    this.yfi.options.address = addressMap["YFI"];
    this.yfii.options.address = addressMap["YFII"];
    this.crv.options.address = addressMap["CRV"];
    this.yam.options.address = addressMap["YAM"];
    this.weth.options.address = addressMap["WETH"];
    this.comp.options.address = addressMap["COMP"];
    this.link.options.address = addressMap["LINK"];
    this.lend.options.address = addressMap["LEND"];
    this.mkr.options.address = addressMap["MKR"];
    this.snx.options.address = addressMap["SNX"];
    this.ycrv.options.address = addressMap["YCRV"];
    this.yffi.options.address = addressMap["YFFI"];
    this.dogefi.options.address = addressMap["DOGEFI"];
    this.ycrvUNIV.options.address = addressMap["YCRVUNIV"];
    this.uni_fact.options.address = addressMap["uniswapFactoryV2"];
    this.uni_router.options.address = addressMap["UNIRouter"];

    // new pool
    this.yffi_grap_univ.options.address = addressMap["YFFIUNIV"];
    this.grap_yfii_bal.options.address = addressMap["YFIIBAL"];
    this.eth_grap_univ.options.address = addressMap["ETHUNIV"];
    this.etherror_grap_univ.options.address = addressMap["ETHUNIV"];
    this.dogefi_grap_univ.options.address = addressMap["DOGEFIUNIV"];


    this.pools = [
      // advanced pool
      {"tokenAddr": this.yffi_grap_univ.options.address, "poolAddr": this.yffi_grap_univ_pool.options.address},
      {"tokenAddr": this.grap_yfii_bal.options.address, "poolAddr": this.grap_yfii_bal_pool.options.address},
      {"tokenAddr": this.eth_grap_univ.options.address, "poolAddr": this.eth_grap_univ_pool.options.address},

      {"tokenAddr": this.etherror_grap_univ.options.address, "poolAddr": this.etherror_grap_univ_pool.options.address},
      {"tokenAddr": this.dogefi_grap_univ.options.address, "poolAddr": this.dogefi_grap_univ_pool.options.address},

      // basic
      {"tokenAddr": this.yam.options.address, "poolAddr": this.yam_pool.options.address},
      {"tokenAddr": this.weth.options.address, "poolAddr": this.eth_pool.options.address},
      {"tokenAddr": this.yfi.options.address, "poolAddr": this.yfi_pool.options.address},
      {"tokenAddr": this.yfii.options.address, "poolAddr": this.yfii_pool.options.address},
      {"tokenAddr": this.crv.options.address, "poolAddr": this.crv_pool.options.address},
      {"tokenAddr": this.comp.options.address, "poolAddr": this.comp_pool.options.address},
      {"tokenAddr": this.link.options.address, "poolAddr": this.link_pool.options.address},
      {"tokenAddr": this.lend.options.address, "poolAddr": this.lend_pool.options.address},
      {"tokenAddr": this.mkr.options.address, "poolAddr": this.mkr_pool.options.address},
      {"tokenAddr": this.snx.options.address, "poolAddr": this.snx_pool.options.address},
      {"tokenAddr": this.ycrvUNIV.options.address, "poolAddr": this.ycrvUNIV_pool.options.address},
    ]
  }

  setDefaultAccount(
    account
  ) {
    this.yfi.options.from = account;
    this.crv.options.from = account;
    this.grap.options.from = account;
    this.weth.options.from = account;
  }

  async callContractFunction(
    method,
    options
  ) {
    const { confirmations, confirmationType, autoGasMultiplier, ...txOptions } = options;

    if (!this.blockGasLimit) {
      await this.setGasLimit();
    }

    if (!txOptions.gasPrice && this.defaultGasPrice) {
      txOptions.gasPrice = this.defaultGasPrice;
    }

    if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
      let gasEstimate;
      if (this.defaultGas && confirmationType !== Types.ConfirmationType.Simulate) {
        txOptions.gas = this.defaultGas;
      } else {
        try {
          console.log("estimating gas");
          gasEstimate = await method.estimateGas(txOptions);
        } catch (error) {
          const data = method.encodeABI();
          const { from, value } = options;
          const to = method._parent._address;
          error.transactionData = { from, value, data, to };
          throw error;
        }

        const multiplier = autoGasMultiplier || this.autoGasMultiplier;
        const totalGas = Math.floor(gasEstimate * multiplier);
        txOptions.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
      }

      if (confirmationType === Types.ConfirmationType.Simulate) {
        let g = txOptions.gas;
        return { gasEstimate, g };
      }
    }

    if (txOptions.value) {
      txOptions.value = new BigNumber(txOptions.value).toFixed(0);
    } else {
      txOptions.value = '0';
    }

    const promi = method.send(txOptions);

    const OUTCOMES = {
      INITIAL: 0,
      RESOLVED: 1,
      REJECTED: 2,
    };

    let hashOutcome = OUTCOMES.INITIAL;
    let confirmationOutcome = OUTCOMES.INITIAL;

    const t = confirmationType !== undefined ? confirmationType : this.confirmationType;

    if (!Object.values(Types.ConfirmationType).includes(t)) {
      throw new Error(`Invalid confirmation type: ${t}`);
    }

    let hashPromise;
    let confirmationPromise;

    if (t === Types.ConfirmationType.Hash || t === Types.ConfirmationType.Both) {
      hashPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          promi.on('transactionHash', (txHash) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.RESOLVED;
              resolve(txHash);
              if (t !== Types.ConfirmationType.Both) {
                const anyPromi = promi ;
                anyPromi.off();
              }
            }
          });
        },
      );
    }

    if (t === Types.ConfirmationType.Confirmed || t === Types.ConfirmationType.Both) {
      confirmationPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (
              (t === Types.ConfirmationType.Confirmed || hashOutcome === OUTCOMES.RESOLVED)
              && confirmationOutcome === OUTCOMES.INITIAL
            ) {
              confirmationOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          const desiredConf = confirmations || this.defaultConfirmations;
          if (desiredConf) {
            promi.on('confirmation', (confNumber, receipt) => {
              if (confNumber >= desiredConf) {
                if (confirmationOutcome === OUTCOMES.INITIAL) {
                  confirmationOutcome = OUTCOMES.RESOLVED;
                  resolve(receipt);
                  const anyPromi = promi ;
                  anyPromi.off();
                }
              }
            });
          } else {
            promi.on('receipt', (receipt) => {
              confirmationOutcome = OUTCOMES.RESOLVED;
              resolve(receipt);
              const anyPromi = promi ;
              anyPromi.off();
            });
          }
        },
      );
    }

    if (t === Types.ConfirmationType.Hash) {
      const transactionHash = await hashPromise;
      if (this.notifier) {
          this.notifier.hash(transactionHash)
      }
      return { transactionHash };
    }

    if (t === Types.ConfirmationType.Confirmed) {
      return confirmationPromise;
    }

    const transactionHash = await hashPromise;
    if (this.notifier) {
        this.notifier.hash(transactionHash)
    }
    return {
      transactionHash,
      confirmation: confirmationPromise,
    };
  }

  async callConstantContractFunction(
    method,
    options
  ) {
    const m2 = method;
    const { blockNumber, ...txOptions } = options;
    return m2.call(txOptions, blockNumber);
  }

  async setGasLimit() {
    const block = await this.web3.eth.getBlock('latest');
    this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT;
  }

  setContractProvider(
    contract,
    contractJson,
    provider,
    networkId,
  ){
    contract.setProvider(provider);
    try {
      contract.options.address = contractJson.networks[networkId]
        && contractJson.networks[networkId].address;
    } catch (error) {
      // console.log(error)
    }
  }
}
