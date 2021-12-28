import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { ETHAuth, Proof } from "@0xsequence/ethauth";
import { sequenceContext } from "@0xsequence/network";
import { ethers } from "ethers";
import { configureLogger } from "@0xsequence/utils";
import { sequence } from "0xsequence";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { CHAIN_IDS, injected, walletconnect } from "./web3/connectors";
import { SwappableAsset, NftSwap } from "@traderxyz/nft-swap-sdk";
configureLogger({ logLevel: "DEBUG" });

const network = "polygon";
let wallet: sequence.provider.Wallet | undefined;
if (!wallet) {
  wallet = new sequence.Wallet(network);
}

const MAKER_ASSET: SwappableAsset = {
  type: "ERC20",
  // tokenAddress: "0xeb8f08a975ab53e34d8a0330e0d34de942c95926", // rinkeby
  //  tokenAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // matic
  tokenAddress: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  amount: "10000",
};
const TAKER_ASSET: SwappableAsset = {
  type: "ERC1155",
  tokenAddress: "0x631998e91476DA5B870D741192fc5Cbc55F5a52E",
  tokenId: "65638",
  amount: "17",
};

function App() {
  const { activate, chainId, error, account, deactivate, library } =
    useWeb3React<Web3Provider>();

  const [nftClient, setNftClient] = useState<NftSwap | null>(null);

  useEffect(() => {
    if (!account) {
      return;
    }
    if (!nftClient) {
      return;
    }
    const doAsync = async () => {
      const res = await nftClient.loadApprovalStatus(TAKER_ASSET, account);
      console.log(res, "approval taker asset");
    };
    doAsync();
  }, [account, nftClient]);

  useEffect(() => {
    if (!library || !chainId) {
      setNftClient(null);
      return;
    }
    try {
      const signer = library.getSigner();

      const _nftClient = new NftSwap(library, signer, chainId);

      setNftClient(_nftClient);
    } catch (e) {
      console.log(e);
    }
  }, [library, chainId]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentlyActivating, setCurrentlyActivating] = useState<
    "metamask" | "wc" | undefined
  >(undefined);

  const activeWithMetamask = useCallback(async () => {
    setErrorMessage(null);
    setCurrentlyActivating("metamask");
    try {
      await activate(injected, undefined, true);
    } catch (e: any) {
      console.log(e.name);
      if (
        e.name === "NoEthereumProviderError" ||
        e.message?.includes("No Ethereum provider was found")
      ) {
        setErrorMessage("No MetaMask detected.");
      } else if (
        e.message.includes("Already processing eth_requestAccounts") ||
        e.message.includes(`Request of type 'wallet_requestPermissions'`)
      ) {
        setErrorMessage("Check MetaMask for an existing login request");
      } else if (e.message.includes("The user rejected the request")) {
        setErrorMessage("The MetaMask login was closed, try connecting again");
      } else {
        setErrorMessage(e.message ?? "Something went wrong logging in");
        console.log(e, Object.keys(e));
      }
      setCurrentlyActivating(undefined);
      return;
    }
    setTimeout(() => {
      setCurrentlyActivating(undefined);
    }, 1500);
  }, [activate]);

  const activeWithWalletConnect = useCallback(async () => {
    setErrorMessage(null);
    setCurrentlyActivating("wc");
    try {
      await activate(walletconnect, undefined, true);
    } catch (e: any) {
      setCurrentlyActivating(undefined);
      setErrorMessage(
        e.message ?? "Something went wrong logging in with WalletConnect"
      );
      console.log(e);
      return;
    }
    setTimeout(() => {
      setCurrentlyActivating(undefined);
    }, 1500);
  }, [activate]);

  const logoutUser = useCallback(async () => {
    deactivate();
  }, [deactivate]);

  const approveTakerAsset = async () => {
    try {
      const tx = await nftClient?.approveTokenOrNftByAsset(
        TAKER_ASSET,
        account!
      );
      const txReceipt = await tx?.wait();
      console.log("txReceipt", txReceipt?.transactionHash);
    } catch (e) {
      console.log("approveUsdc", e);
    }
  };

  const approveMakerAsset = async () => {
    const tx = await nftClient?.approveTokenOrNftByAsset(MAKER_ASSET, account!);
    const txReceipt = await tx?.wait();
    console.log("txReceipt", txReceipt?.transactionHash);
  };

  const signOrder = async () => {
    if (!nftClient || !account || !library) {
      return;
    }

    const order = nftClient.buildOrder([MAKER_ASSET], [TAKER_ASSET], account);

    console.log("doing the thing");

    try {
      const signedOrder = await nftClient.signOrder(
        order,
        account,
        library.getSigner()
      );
      console.log("signedOrder", signedOrder, signedOrder.signature);

      const hash = nftClient.getOrderHash(order);
      console.log("hash", hash);
      const signedHash = nftClient.getOrderHash(signedOrder);
      console.log("signedHash", signedHash);

      localStorage.setItem("signedorder", JSON.stringify(signedOrder));
      console.log("saved order to local storage");

      // const tx = await nftClient.fillSignedOrder(signedOrder, undefined, {   gasLimit: '600000',})
      // console.log('tx', tx);
    } catch (e) {
      console.log(e);
      console.log((e as any).message);
      console.log("err", e);
    }
  };

  const fillOrder = async () => {
    if (!nftClient || !account || !library) {
      return;
    }

    try {
      const signedOrderRaw = localStorage.getItem("signedorder");
      if (signedOrderRaw == null) {
        throw new Error("no signed order in local storage");
      }
      const signedOrder = JSON.parse(signedOrderRaw);

      const tx = await nftClient.fillSignedOrder(signedOrder, undefined, {
        gasLimit: "600000",
      });
      console.log("tx", tx);
    } catch (e) {
      console.log(e);
      console.log((e as any).message);
      console.log("err", e);
    }
  };

  const connectSequence = async (authorize: boolean = true) => {
    const connectDetails = await wallet!.connect({
      app: "Demo Dapp",
      authorize,
      // keepWalletOpened: true
    });

    console.warn("connectDetails", { connectDetails });

    if (authorize) {
      const ethAuth = new ETHAuth();

      const decodedProof = await ethAuth.decodeProof(
        connectDetails.proof!.proofString,
        true
      );

      console.warn({ decodedProof });

      const isValid = await wallet!.commands.isValidTypedDataSignature(
        await wallet!.getAddress(),
        connectDetails.proof!.typedData,
        decodedProof.signature,
        await wallet!.getAuthChainId()
      );
      console.log("isValid?", isValid);
      if (!isValid) throw new Error("sig invalid");
    }

    // wallet.closeWallet()
  };

  return (
    <div className="App">
      <div>
        <button onClick={() => connectSequence()}>
          connect with sequence sdk
        </button>
        <button onClick={() => activeWithWalletConnect()}>
          connect with walletconnect
        </button>
        <button onClick={() => activeWithMetamask()}>
          connect with metamask
        </button>
        <button onClick={() => logoutUser()}>log out</button>
        {account ? account : "not logged in"}
      </div>
      <div>
        <button onClick={() => approveTakerAsset()}>approve taker asset</button>
        <button onClick={() => approveMakerAsset()}>approve maker asset</button>
        <button onClick={() => signOrder()}>
          sign order and save to local storage
        </button>
        <button onClick={() => fillOrder()}>fill order in local storage</button>
        chain: {chainId ?? "not connected"}
      </div>
    </div>
  );
}

export default App;
