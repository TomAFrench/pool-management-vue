import Vue from 'vue';
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk';
import store from '@/store';

const state = {
  safeInfo: {},
  appsSdk: initSdk()
};

if (state.appsSdk) {
  state.appsSdk.addListeners({
    onSafeInfo: (safeInfo: SafeInfo) => store.dispatch('ON_SAFE_INFO', safeInfo)
  });
}

const mutations = {
  ON_SAFE_INFO_SUCCESS(_state, payload) {
    Vue.set(_state, 'safeInfo', payload);
    console.debug('ON_SAFE_INFO_SUCCESS');
  }
};

const actions = {
  ON_SAFE_INFO: async ({ commit, dispatch }, payload) => {
    commit('HANDLE_ACCOUNTS_CHANGED', payload.safeAddress);
    await dispatch('loadAccount');
    await dispatch('loadWeb3');
    commit('ON_SAFE_INFO_SUCCESS', payload);
  }
};

export default {
  state,
  mutations,
  actions
};
