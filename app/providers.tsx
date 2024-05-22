'use client';

import * as React from 'react';
import {
    WalletList,
    getDefaultConfig,
    Chain,
} from '@rainbow-me/rainbowkit';

import { metaMaskWallet, trustWallet, uniswapWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider } from 'wagmi';
import {
    polygon,
} from 'wagmi/chains';

import { QueryClientProvider, QueryClient, } from "@tanstack/react-query";

const bbtestnet = {
    id: 17524,
    name: "yucky-daredevil-f5a89180",
    nativeCurrency: {
        decimals: 18,
        name: "Native Token",
        symbol: "Native Token",
    },
    rpcUrls: {
        public: { http: ["https://rpc.buildbear.io/yucky-daredevil-f5a89180"] },
        default: { http: ["https://rpc.buildbear.io/yucky-daredevil-f5a89180"] },
    },
    blockExplorers: {
        etherscan: {
            name: "BBExplorer",
            url: "https://explorer.buildbear.io/yucky-daredevil-f5a89180",
        },
        default: {
            name: "BBExplorer",
            url: "https://explorer.buildbear.io/yucky-daredevil-f5a89180",
        },
    },
} as const satisfies Chain;

const queryClient = new QueryClient();

const _walletList: WalletList = [
    {
        groupName: 'Recommended',
        wallets: [metaMaskWallet, trustWallet, uniswapWallet, walletConnectWallet],
    },
];

const _chains: readonly [Chain, ...Chain[]] = [polygon, bbtestnet];

const config = getDefaultConfig({
    appName: 'nextjsweb3paymentapp',
    projectId: 'YOUR_PROJECT_ID',
    wallets: _walletList,
    chains: _chains,
    ssr: false,
});


export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}