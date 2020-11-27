import Vue from 'vue';
import { Contract } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';
import store from '@/store';
import abi from '@/helpers/abi';
import config from '@/config';
import provider from '@/helpers/provider';
import { multicall } from '@/_balancer/utils';

if (provider) {
  provider.on('block', blockNumber => {
    store.commit('GET_BLOCK_SUCCESS', blockNumber);
  });
}

const state = {
  blockNumber: 0,
  account: null,
  name: null,
  active: false,
  balances: {},
  tokenMetadata: {}
};

const mutations = {
  LOAD_TOKEN_METADATA_REQUEST() {
    console.debug('LOAD_TOKEN_METADATA_REQUEST');
  },
  LOAD_TOKEN_METADATA_SUCCESS(_state, payload) {
    for (const address in payload) {
      Vue.set(_state.tokenMetadata, address, payload[address]);
    }
    console.debug('LOAD_TOKEN_METADATA_SUCCESS');
  },
  LOAD_TOKEN_METADATA_FAILURE(_state, payload) {
    console.debug('LOAD_TOKEN_METADATA_FAILURE', payload);
  },
  LOAD_WEB3_REQUEST() {
    console.debug('LOAD_WEB3_REQUEST');
  },
  LOAD_WEB3_SUCCESS() {
    console.debug('LOAD_WEB3_SUCCESS');
  },
  LOAD_WEB3_FAILURE(_state, payload) {
    console.debug('LOAD_WEB3_FAILURE', payload);
  },
  GET_LATEST_BLOCK_REQUEST() {
    console.debug('GET_LATEST_BLOCK_REQUEST');
  },
  GET_LATEST_BLOCK_SUCCESS(_state, payload) {
    console.debug('GET_LATEST_BLOCK_SUCCESS', payload);
    Vue.set(_state, 'blockNumber', payload);
  },
  GET_LATEST_BLOCK_FAILURE() {
    console.debug('GET_LATEST_BLOCK_FAILURE');
  },
  HANDLE_CHAIN_CHANGED() {
    console.debug('HANDLE_CHAIN_CHANGED');
  },
  HANDLE_ACCOUNTS_CHANGED(_state, payload) {
    Vue.set(_state, 'account', payload);
    console.debug('HANDLE_ACCOUNTS_CHANGED', payload);
  },
  HANDLE_NETWORK_CHANGED() {
    console.debug('HANDLE_NETWORK_CHANGED');
  },
  HANDLE_DISCONNECT() {
    console.debug('HANDLE_DISCONNECT');
  },
  GET_BALANCES_REQUEST() {
    console.debug('GET_BALANCES_REQUEST');
  },
  GET_BALANCES_SUCCESS(_state, payload) {
    for (const address in payload) {
      Vue.set(_state.balances, address, payload[address]);
    }
    console.debug('GET_BALANCES_SUCCESS');
  },
  GET_BALANCES_FAILURE(_state, payload) {
    console.debug('GET_BALANCES_FAILURE', payload);
  },
  GET_BLOCK_SUCCESS(_state, blockNumber) {
    Vue.set(_state, 'blockNumber', blockNumber);
    console.debug('GET_BLOCK_SUCCESS', blockNumber);
  }
};

const actions = {
  initTokenMetadata: async ({ commit }) => {
    const invalids = ['0xD46bA6D942050d489DBd938a2C909A5d5039A161'];
    const metadata = Object.fromEntries(
      Object.entries(config.tokens).map(tokenEntry => {
        const { decimals, symbol, name } = tokenEntry[1] as any;
        return [
          tokenEntry[0],
          {
            decimals,
            symbol,
            name,
            whitelisted: !invalids.includes(tokenEntry[0])
          }
        ];
      })
    );
    commit('LOAD_TOKEN_METADATA_SUCCESS', metadata);
  },
  loadTokenMetadata: async ({ commit }, tokens) => {
    commit('LOAD_TOKEN_METADATA_REQUEST');
    try {
      const keys = ['decimals', 'symbol', 'name'];
      const calls = tokens
        .map(token => keys.map(key => [token, key, []]))
        .reduce((a, b) => [...a, ...b]);
      const res = await multicall(provider, abi['TestToken'], calls);
      const tokenMetadata = Object.fromEntries(
        tokens.map((token, i) => [
          token,
          Object.fromEntries(
            keys.map((key, keyIndex) => [
              key,
              ...res[keyIndex + i * keys.length]
            ])
          )
        ])
      );
      commit('LOAD_TOKEN_METADATA_SUCCESS', tokenMetadata);
      return tokenMetadata;
    } catch (e) {
      commit('LOAD_TOKEN_METADATA_FAILURE', e);
      return Promise.reject();
    }
  },
  loadWeb3: async ({ commit, dispatch }) => {
    commit('LOAD_WEB3_REQUEST');
    try {
      await dispatch('loadAccount');
      await dispatch('checkPendingTransactions');
      commit('LOAD_WEB3_SUCCESS');
    } catch (e) {
      commit('LOAD_WEB3_FAILURE', e);
      return Promise.reject();
    }
  },
  loadAccount: async ({ dispatch }) => {
    if (!state.account) return;
    // @ts-ignore
    const tokens = Object.entries(config.tokens).map(token => token[1].address);
    await Promise.all([
      dispatch('getBalances', tokens),
      dispatch('getUserPoolShares')
    ]);
  },
  getPoolBalances: async (_state, { poolAddress, tokens }) => {
    const promises: any = [];
    const multi = new Contract(
      config.addresses.multicall,
      abi['Multicall'],
      provider
    );
    const calls = [];
    const testToken = new Interface(abi.TestToken);
    const tokensToFetch = tokens
      ? tokens
      : Object.keys(state.balances).filter(token => token !== 'ether');
    tokensToFetch.forEach(token => {
      calls.push([
        // @ts-ignore
        token,
        // @ts-ignore
        testToken.encodeFunctionData('balanceOf', [poolAddress])
      ]);
    });
    promises.push(multi.aggregate(calls));
    const balances: any = {};
    try {
      // @ts-ignore
      const [[, response]] = await Promise.all(promises);
      let i = 0;
      response.forEach(value => {
        if (tokensToFetch && tokensToFetch[i]) {
          const balanceNumber = testToken.decodeFunctionResult(
            'balanceOf',
            value
          );
          balances[tokensToFetch[i]] = balanceNumber.toString();
        }
        i++;
      });
      return balances;
    } catch (e) {
      return Promise.reject();
    }
  },
  getBalances: async ({ commit }, tokens) => {
    commit('GET_BALANCES_REQUEST');
    const address = state.account;
    const promises: any = [];
    const multi = new Contract(
      config.addresses.multicall,
      abi['Multicall'],
      provider
    );
    const calls = [];
    const testToken = new Interface(abi.TestToken);
    const tokensToFetch = tokens
      ? tokens
      : Object.keys(state.balances).filter(token => token !== 'ether');
    tokensToFetch.forEach(token => {
      // @ts-ignore
      calls.push([token, testToken.encodeFunctionData('balanceOf', [address])]);
    });
    promises.push(multi.aggregate(calls));
    promises.push(multi.getEthBalance(address));
    const balances: any = {};
    try {
      // @ts-ignore
      const [[, response], ethBalance] = await Promise.all(promises);
      // @ts-ignore
      balances.ether = ethBalance.toString();
      let i = 0;
      response.forEach(value => {
        if (tokensToFetch && tokensToFetch[i]) {
          const balanceNumber = testToken.decodeFunctionResult(
            'balanceOf',
            value
          );
          balances[tokensToFetch[i]] = balanceNumber.toString();
        }
        i++;
      });
      commit('GET_BALANCES_SUCCESS', balances);
      return balances;
    } catch (e) {
      commit('GET_BALANCES_FAILURE', e);
      return Promise.reject();
    }
  }
};

export default {
  state,
  mutations,
  actions
};
