import Vue from 'vue';
import { getAddress } from 'ethers/utils';
import { request } from '@/helpers/subgraph';
import { formatPool } from '@/helpers/utils';
import queries from '@/helpers/queries.json';

const state = {
  balancer: {},
  poolShares: {},
  myPools: [],
  tokenPrices: {}
};

const getters = {
  getPrice: state => (token, amount) => {
    const checksum = getAddress(token);
    const tokenPrice = state.tokenPrices[checksum];
    if (!tokenPrice) return 0;
    return tokenPrice.price * amount;
  }
};

const mutations = {
  GET_BALANCER_REQUEST() {
    console.debug('GET_BALANCER_REQUEST');
  },
  GET_BALANCER_SUCCESS(_state, payload) {
    Vue.set(_state, 'balancer', payload);
    console.debug('GET_BALANCER_SUCCESS');
  },
  GET_BALANCER_FAILURE(_state, payload) {
    console.debug('GET_BALANCER_FAILURE', payload);
  },
  GET_TOKEN_PRICES_REQUEST() {
    console.debug('GET_TOKEN_PRICES_REQUEST');
  },
  GET_TOKEN_PRICES_SUCCESS(_state, payload) {
    Vue.set(_state, 'tokenPrices', payload);
    console.debug('GET_TOKEN_PRICES_SUCCESS');
  },
  GET_TOKEN_PRICES_FAILURE(_state, payload) {
    console.debug('GET_TOKEN_PRICES_FAILURE', payload);
  },
  GET_POOL_REQUEST() {
    console.debug('GET_POOL_REQUEST');
  },
  GET_POOL_SUCCESS() {
    console.debug('GET_POOL_SUCCESS');
  },
  GET_POOL_FAILURE(_state, payload) {
    console.debug('GET_POOL_FAILURE', payload);
  },
  GET_POOLS_REQUEST() {
    console.debug('GET_POOLS_REQUEST');
  },
  GET_POOLS_SUCCESS() {
    console.debug('GET_POOLS_SUCCESS');
  },
  GET_POOLS_FAILURE(_state, payload) {
    console.debug('GET_POOLS_FAILURE', payload);
  },
  GET_MY_POOLS_REQUEST() {
    console.debug('GET_MY_POOLS_REQUEST');
  },
  GET_MY_POOLS_SUCCESS(_state, payload) {
    Vue.set(_state, 'myPools', payload);
    console.debug('GET_MY_POOLS_SUCCESS');
  },
  GET_MY_POOLS_FAILURE(_state, payload) {
    console.debug('GET_MY_POOLS_FAILURE', payload);
  },
  GET_POOLS_SHARES_REQUEST() {
    console.debug('GET_POOLS_SHARES_REQUEST');
  },
  GET_POOLS_SHARES_SUCCESS(_state, payload) {
    Vue.set(_state, 'poolShares', payload);
    console.debug('GET_POOLS_SHARES_SUCCESS');
  },
  GET_POOLS_SHARES_FAILURE(_state, payload) {
    console.debug('GET_POOLS_SHARES_FAILURE', payload);
  },
  GET_POOLS_SWAPS_REQUEST() {
    console.debug('GET_POOLS_SWAPS_REQUEST');
  },
  GET_POOLS_SWAPS_SUCCESS() {
    console.debug('GET_POOLS_SWAPS_SUCCESS');
  },
  GET_POOLS_SWAPS_FAILURE(_state, payload) {
    console.debug('GET_POOLS_SWAPS_FAILURE', payload);
  }
};

const actions = {
  getBalancer: async ({ commit }) => {
    const query = queries['getBalancer'];
    commit('GET_BALANCER_REQUEST');
    try {
      const { balancer } = await request(query);
      balancer.privatePoolCount =
        balancer.poolCount - balancer.finalizedPoolCount;
      commit('GET_BALANCER_SUCCESS', balancer);
    } catch (e) {
      commit('GET_BALANCER_FAILURE', e);
    }
  },
  getTokenPrices: async ({ commit }) => {
    const query = queries['getTokenPrices'];
    commit('GET_TOKEN_PRICES_REQUEST');
    try {
      let { tokenPrices } = await request(query);
      tokenPrices = Object.fromEntries(
        tokenPrices
          .sort((a, b) => b.poolLiquidity - a.poolLiquidity)
          .map(tokenPrice => [tokenPrice.id, tokenPrice])
      );
      commit('GET_TOKEN_PRICES_SUCCESS', tokenPrices);
    } catch (e) {
      commit('GET_TOKEN_PRICES_FAILURE', e);
    }
  },
  getPool: async ({ commit }, payload) => {
    const ts = Math.round(new Date().getTime() / 1000);
    const tsYesterday = ts - 24 * 3600;
    const query = queries['getPool'];
    // @ts-ignore
    query.pool.__args = { id: payload };
    // @ts-ignore
    query.pool.swaps.__args = {
      first: 1,
      orderBy: 'timestamp',
      orderDirection: 'desc',
      where: {
        timestamp_lt: tsYesterday
      }
    };
    commit('GET_POOL_REQUEST');
    try {
      let { pool } = await request(query);
      pool = formatPool(pool);
      commit('GET_POOL_SUCCESS');
      return pool;
    } catch (e) {
      commit('GET_POOL_FAILURE', e);
    }
  },
  getPools: async ({ commit }, payload) => {
    const {
      first = 10,
      page = 1,
      orderBy = 'liquidity',
      orderDirection = 'desc',
      where = {}
    } = payload;
    const skip = (page - 1) * first;
    const ts = Math.round(new Date().getTime() / 1000);
    const tsYesterday = ts - 24 * 3600;
    const query = queries['getPools'];
    where.tokensList_not = [];
    // @ts-ignore
    query.pools.__args = {
      where,
      first,
      skip,
      orderBy,
      orderDirection
    };
    // @ts-ignore
    query.pools.swaps.__args = {
      first: 1,
      orderBy: 'timestamp',
      orderDirection: 'desc',
      where: {
        timestamp_lt: tsYesterday
      }
    };
    commit('GET_POOLS_REQUEST');
    try {
      let { pools } = await request(query);
      pools = pools.map(pool => formatPool(pool));
      commit('GET_POOLS_SUCCESS');
      return pools;
    } catch (e) {
      commit('GET_POOLS_FAILURE', e);
    }
  },
  getMyPools: async ({ commit }) => {
    commit('GET_MY_POOLS_REQUEST');
    try {
      const myPools = [
        '0x145bc933a22de9afd6f7a44d52e2cc9924b8741d',
        '0x1492b5b01350b7c867185a643f2e59f7be279fd3',
        '0x226bc733f8ce4cc76f2b13db1456d3724163a68f',
        '0xbe6daaf4ab70a1690759331aec740881620856f0',
        '0xe3bdae21c5afc2dd0d58bdc2324e5ac3c8801f40',
        '0x456a6019e548700f3ebd7d2afa5e2cca44e7c3c8'
      ];
      commit('GET_MY_POOLS_SUCCESS', myPools);
      return myPools;
    } catch (e) {
      commit('GET_MY_POOLS_FAILURE', e);
    }
  },
  getPoolShares: async ({ commit, rootState }) => {
    const address = rootState.web3.account;
    commit('GET_POOLS_SHARES_REQUEST');
    try {
      const query = queries['getPoolShares'];
      // @ts-ignore
      query.poolShares.__args = {
        where: {
          userAddress: address.toLowerCase()
        }
      };
      const { poolShares } = await request(query);
      const balances: any = {};
      poolShares.forEach(share => (balances[share.poolId.id] = share.balance));
      commit('GET_POOLS_SHARES_SUCCESS', balances);
      return poolShares;
    } catch (e) {
      commit('GET_POOLS_SHARES_FAILURE', e);
    }
  },
  getPoolSwaps: async ({ commit }, payload) => {
    commit('GET_POOLS_SWAPS_REQUEST');
    try {
      const {
        first = 10,
        page = 1,
        orderBy = 'timestamp',
        orderDirection = 'desc',
        where = {}
      } = payload;
      const skip = (page - 1) * first;
      const query = queries['getPoolSwaps'];
      // @ts-ignore
      query.swaps.__args = {
        // @ts-ignore
        where,
        first,
        skip,
        orderBy,
        orderDirection
      };
      const { swaps } = await request(query);
      commit('GET_POOLS_SWAPS_SUCCESS');
      return swaps;
    } catch (e) {
      commit('GET_POOLS_SWAPS_FAILURE', e);
    }
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};