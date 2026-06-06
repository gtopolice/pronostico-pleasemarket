"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import {
  AbstractSigner,
  BrowserProvider,
  TransactionRequest,
  TransactionResponse,
} from "ethers";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BASE_SEPOLIA_CHAIN_ID = 84532;

function appendAttribution(data?: `0x${string}`): `0x${string}` | undefined {
  return data;
}

class SmartAccountSigner extends AbstractSigner {
  constructor(
    private smartClient: any,
    provider: BrowserProvider,
  ) {
    super(provider);
  }

  async getAddress(): Promise<string> {
    return this.smartClient.account.address;
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const m = typeof message === "string" ? message : { raw: message };
    return this.smartClient.signMessage({ message: m });
  }

  async signTransaction(_transaction: TransactionRequest): Promise<string> {
    throw new Error("Smart accounts do not support signTransaction.");
  }

  connect(provider: BrowserProvider | null): SmartAccountSigner {
    return new SmartAccountSigner(this.smartClient, provider as any);
  }

  async signTypedData(domain: any, types: any, value: any): Promise<string> {
    return this.smartClient.signTypedData({
      domain,
      types,
      primaryType: Object.keys(types)[0],
      message: value,
    });
  }

  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    const hash = await this.smartClient.sendTransaction({
      to: tx.to as `0x${string}`,
      data: appendAttribution(tx.data as `0x${string}`),
      value: tx.value ? BigInt(tx.value.toString()) : undefined,
    });
    return this.handleResponse(hash);
  }

  private async handleResponse(hash: string): Promise<TransactionResponse> {
    const response = await this.provider?.getTransaction(hash);
    if (!response) {
      return {
        hash,
        confirmations: 0,
        from: await this.getAddress(),
        wait: async () => this.provider?.waitForTransaction(hash) as any,
      } as any;
    }
    return response;
  }
}

export function usePrivySigner() {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { client: smartClient } = useSmartWallets();
  const [signer, setSigner] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSigner = async () => {
      if (!ready) {
        setIsLoading(true);
        return;
      }

      if (!authenticated || !wallets?.length) {
        setSigner(null);
        setProvider(null);
        setAddress(null);
        setIsLoading(false);
        return;
      }

      try {
        const embeddedWallet = wallets.find(
          (w) => w.walletClientType === "privy" || (w as any).connectorType === "embedded",
        );
        if (!embeddedWallet) {
          setSigner(null);
          setProvider(null);
          setIsLoading(false);
          return;
        }

        let ethereumProvider: any = null;
        if (typeof (embeddedWallet as any).getEthereumProvider === "function") {
          ethereumProvider = await (embeddedWallet as any).getEthereumProvider();
        } else if ((embeddedWallet as any).provider) {
          ethereumProvider = (embeddedWallet as any).provider;
        }
        if (!ethereumProvider) throw new Error("Could not get embedded wallet provider");

        const ethersProvider = new BrowserProvider(ethereumProvider);
        const network = await ethersProvider.getNetwork();
        if (Number(network.chainId) !== BASE_SEPOLIA_CHAIN_ID) {
          if (typeof (embeddedWallet as any).switchChain === "function") {
            await (embeddedWallet as any).switchChain(BASE_SEPOLIA_CHAIN_ID);
          } else {
            await ethereumProvider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
            });
          }
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        const finalProvider = new BrowserProvider(ethereumProvider);
        const finalNetwork = await finalProvider.getNetwork();
        if (Number(finalNetwork.chainId) !== BASE_SEPOLIA_CHAIN_ID) {
          setSigner(null);
          setProvider(null);
          setAddress(null);
          setIsLoading(false);
          return;
        }

        const ethersSigner = await finalProvider.getSigner();
        if (smartClient) {
          const smartSigner = new SmartAccountSigner(smartClient, finalProvider);
          setSigner(smartSigner);
          setAddress(smartClient.account.address);
        } else {
          setSigner(ethersSigner);
          setAddress(await ethersSigner.getAddress());
        }
        setProvider(finalProvider);
      } catch (error) {
        console.error("Error getting signer from Privy:", error);
        setSigner(null);
        setProvider(null);
        setAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    void getSigner();
  }, [ready, authenticated, wallets, user, smartClient]);

  return {
    signer,
    provider,
    address,
    isLoading,
    isConnected: authenticated && !!signer,
  };
}
