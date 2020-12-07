import abi from '@/helpers/abi';
import { Interface } from '@ethersproject/abi';
import { Transaction } from '@gnosis.pm/safe-apps-sdk';

export function makeGnosisTransaction(
  contractType: string,
  contractAddress: string,
  action: string,
  params: any[],
  value = '0'
): Transaction {
  const iface = new Interface(abi[contractType]);
  const data = iface.encodeFunctionData(action, params);
  return {
    to: contractAddress,
    data,
    value
  };
}
