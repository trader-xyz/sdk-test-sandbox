import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const MAINNET_CHAIN_ID = 1;
const BSC_CHAIN_ID = 56;
const KOVAN_CHAIN_ID = 42;
const RINKEBY_CHAIN_ID = 4;
const MATIC_CHAIN_ID = 137;
const ROPSTEN_CHAIN_ID = 3;
const AVALANCHE_CHAIN_ID = 43114;
const ARBITRUM_CHAIN_ID = 42161;
const ARBITRUM_RINKEBY_CHAIN_ID = 421611;

export const CHAIN_IDS = {
  MAINNET: MAINNET_CHAIN_ID,
  BSC: BSC_CHAIN_ID,
  KOVAN: KOVAN_CHAIN_ID,
  RINKEBY: RINKEBY_CHAIN_ID,
  MATIC: MATIC_CHAIN_ID,
  ROPSTEN: ROPSTEN_CHAIN_ID,
  AVALANCHE: AVALANCHE_CHAIN_ID,
  ARBITRUM: ARBITRUM_CHAIN_ID,
  ARBITRUM_TESTNET: ARBITRUM_RINKEBY_CHAIN_ID,
};

// const SUPPORTED_CHAINS = [CHAIN_IDS.ARBITRUM, CHAIN_IDS.ARBITRUM_TESTNET]

// import { WalletLinkConnector } from '@web3-react/walletlink-connector'
// import { LedgerConnector } from '@web3-react/ledger-connector'
// import { TrezorConnector } from '@web3-react/trezor-connector'
// import { LatticeConnector } from '@web3-react/lattice-connector'
// import { FrameConnector } from '@web3-react/frame-connector'
// import { AuthereumConnector } from '@web3-react/authereum-connector'
// import { FortmaticConnector } from '@web3-react/fortmatic-connector'
// import { MagicConnector } from '@web3-react/magic-connector'
// import { PortisConnector } from '@web3-react/portis-connector'
// import { TorusConnector } from '@web3-react/torus-connector'

export const POLLING_INTERVAL = 12000;
const RPC_URLS: { [chainId: number]: string } = {
  //   [CHAIN_IDS.MAINNET]: ETH_MAINNET_HTTP,
  //   [CHAIN_IDS.ARBITRUM]: ARBITRUM_MAINNET_HTTP,
  [CHAIN_IDS.MAINNET]:
    "https://eth-mainnet.alchemyapi.io/v2/V0c30N-WLxYwgrEj46Cov4eeiC178XZI",
  [CHAIN_IDS.RINKEBY]:
    "https://eth-rinkeby.alchemyapi.io/v2/V0c30N-WLxYwgrEj46Cov4eeiC178XZI",
  [CHAIN_IDS.MATIC]:
    "https://polygon-mainnet.g.alchemy.com/v2/VMBpFqjMYv2w-MWnc9df92w3R2TpMvSG",
};

// const ARBITRUM_RINKEBY_CHAIN_ID = 421611; // https://chainlist.org/
// const CHAIN_IDS = {

// }

export const injected = new InjectedConnector({
  // allow any chain to 'connect' so we can help redirect them
});

// export const network = new NetworkConnector({
//   urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
//   defaultChainId: 1,
// })

export const walletconnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  qrcode: true,
  clientMeta: {
    name: "Trader.xyz Sample app",
    description: "Sample app",
    url: `https://localhost:3000`,
    icons: [],
  },
});

// export const walletlink = new WalletLinkConnector({
//   url: RPC_URLS[1],
//   appName: 'web3-react example',
//   supportedChainIds: [1, 3, 4, 5, 42, 10, 137, 69, 420, 80001]
// })

// export const ledger = new LedgerConnector({ chainId: 1, url: RPC_URLS[1], pollingInterval: POLLING_INTERVAL })

// export const trezor = new TrezorConnector({
//   chainId: 1,
//   url: RPC_URLS[1],
//   pollingInterval: POLLING_INTERVAL,
//   manifestEmail: 'dummy@abc.xyz',
//   manifestAppUrl: 'http://localhost:1234'
// })

// export const lattice = new LatticeConnector({
//   chainId: 4,
//   appName: 'web3-react',
//   url: RPC_URLS[4]
// })

// export const frame = new FrameConnector({ supportedChainIds: [1] })

// export const authereum = new AuthereumConnector({ chainId: 42 })

// export const fortmatic = new FortmaticConnector({ apiKey: process.env.FORTMATIC_API_KEY as string, chainId: 4 })

// export const magic = new MagicConnector({
//   apiKey: process.env.MAGIC_API_KEY as string,
//   chainId: 4,
//   email: 'hello@example.org'
// })

// export const portis = new PortisConnector({ dAppId: process.env.PORTIS_DAPP_ID as string, networks: [1, 100] })

// export const torus = new TorusConnector({ chainId: 1 })
