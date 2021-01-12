import Vue from 'vue';
import SafeAppsSDK, {
  SafeInfo,
  SendTransactionsResponse,
  Transaction
} from '@gnosis.pm/safe-apps-sdk';

const state: { safeInfo: SafeInfo } = {
  safeInfo: {} as SafeInfo
};

const appsSdk = new SafeAppsSDK();

const mutations = {
  ON_SAFE_INFO_SUCCESS(_state, payload) {
    Vue.set(_state, 'safeInfo', payload);
    console.debug('ON_SAFE_INFO_SUCCESS');
  }
};

const actions = {
  getSafeInfo: async ({ commit, dispatch }) => {
    const safe = await appsSdk.getSafeInfo();
    commit('HANDLE_ACCOUNTS_CHANGED', safe.safeAddress);
    await dispatch('loadWeb3');
    commit('ON_SAFE_INFO_SUCCESS', safe);
  },
  sendGnosisTransactions: async (
    _,
    { transactions }: { transactions: Transaction[] }
  ): Promise<SendTransactionsResponse> => {
    return appsSdk.txs.send({ txs: transactions });
  }
};

export default {
  state,
  mutations,
  actions
};
