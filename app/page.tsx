'use client'

import React, { useEffect, useState } from 'react';

import {
  ConnectButton,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

import { useChainId, useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Address, parseUnits, formatUnits } from 'viem'

export default function Home() {
  // initial state:
  const [currentUSDTbalance, setcurrentUSDTbalance] = useState(0);
  const [selectedAmount, setselectedAmount] = useState("0.5");
  const [paymentTrxnId, setpaymentTrxnId] = useState("");
  const [paymentReceipt, setpaymentReceipt] = useState<{ status: string, transaction_id: Address }>({ status: '', transaction_id: '' as Address });
  const chainId = useChainId();
  const { isConnected, address } = useAccount();
  const useBalanceResult = useBalance({
    address: address as Address,
    token: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as Address,  /// USDT contract address
  })

  const { writeContractAsync, status, isSuccess, isError, error: transfer_error } = useWriteContract();

  const TransactionReceipt = useWaitForTransactionReceipt({
    hash: paymentTrxnId as Address,
  })

  useEffect(() => {
    if (useBalanceResult) {
      console.log(useBalanceResult.data);
      if (useBalanceResult.data?.value)
        setcurrentUSDTbalance(Number(formatUnits(useBalanceResult.data?.value!, 6)));
    }
  }, [useBalanceResult]);


  // This useEffect triggers only when TransactionReceipt changes value
  useEffect(() => {
    console.log('TransactionReceipt is');

    if (TransactionReceipt) {
      if (TransactionReceipt.data && (TransactionReceipt.status === 'success')) {
        if (TransactionReceipt.data.transactionHash === (paymentTrxnId as Address)) {
          console.log('Transaction ' + paymentTrxnId + ' was successfull');

          let _receipt = {
            status: 'success',
            transaction_id: TransactionReceipt.data.transactionHash
          }
          setpaymentReceipt(_receipt);
          // clear triggering transaction_id. 
          setpaymentTrxnId('');
        }
      }
    }
  }, [TransactionReceipt])

  // clear previous results on each onConnect event
  useEffect(() => {
    setpaymentTrxnId('');
    setpaymentReceipt({ status: '', transaction_id: '' as Address });
  }, [isConnected])


  // async format
  const FunctionSend = async () => {

    console.log('FunctionSend invoked');

    // clear previous results
    setpaymentTrxnId('');
    setpaymentReceipt({ status: '', transaction_id: '' as Address });

    const abi = [
      {
        type: 'function',
        name: 'approve',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ type: 'bool' }],
      },
      {
        type: 'function',
        name: 'transferFrom',
        stateMutability: 'nonpayable',
        inputs: [
          { name: '_from', type: 'address' },
          { name: '_to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ type: 'bool' }],
      },

    ]

    try {
      let trxId = await writeContractAsync({
        abi,
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',  /// USDT contract address 
        functionName: 'approve',
        args: [
          address,
          parseUnits(selectedAmount, 6),],
        chainId: chainId,
      });

      console.log(trxId as string);

      trxId = await writeContractAsync({
        abi,
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',  /// USDT contract address 
        functionName: 'transferFrom',
        args: [
          address as Address, // => address FROM,
          process.env.RECEPIENT_ADDRESS, // => address TO,
          parseUnits(selectedAmount, 6),],
        chainId: chainId,
      });

      console.log(trxId as string);

      // need to get confirmation that transaction was successful
      // so we set transaction id for which useWaitForTransactionReceipt will be triggered.
      setpaymentTrxnId(trxId as string);
    } catch (e) {
      console.log(e)
    }

  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <RainbowKitProvider>
        <h1 className='text-center text-3xl font-extrabold'>NextJS Web3 application</h1><br />
        <div className='flex flex-row justify-center items-center'>
          <ConnectButton />
        </div>
      </RainbowKitProvider>
      <section className='mt-6'>
        <div className='flex flex-row justify-evenly text-center mb-4'>
          Your current balance of USDT = {currentUSDTbalance} USDT
        </div>
        <h2 className='text-center text-2xl font-bold mb-4'>Your crypto transfer:</h2>
        <div className='flex flex-row justify-evenly mb-4'>
          <select name="selectedAmount"
            value={selectedAmount} // ...force the select's value to match the state variable...
            onChange={e => setselectedAmount(e.target.value)} // ... and update the state variable on any change!
          >
            <option value="0.1">0.1</option>
            <option value="0.5">0.5</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </select>
          <span>
            <b>USDT</b>
          </span>
        </div>
        <div>
          Recipient wallet address = {process.env.RECEPIENT_ADDRESS}
        </div>
        <div>
          Your wallet address = {address as string}
        </div>

        {isConnected && (
          <>
            <button className='hover:bg-green-600 bg-green-400 rounded-md p-2 w-full font-semibold'
              onClick={FunctionSend}>Go!</button>
            <div>
              Current transaction status is {status}
            </div>
            <div>
              {isSuccess && "Waiting for reciept..."}
            </div>
            <div>
              {isError && ("We got error:" + transfer_error.message)}
            </div>
            <div>
              {(paymentReceipt.status === 'success') && (
                <>
                  Reciept: transaction hash is {paymentReceipt.transaction_id}
                </>)}
            </div>
          </>)}

      </section>
    </main>
  );
}
