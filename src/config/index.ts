import merge from 'lodash/merge';
import registry from '@balancer-labs/assets/generated/pm/registry.homestead.json';
import registryKovan from '@balancer-labs/assets/generated/pm/registry.kovan.json';
import registryRinkeby from '@/config/registry.rinkeby.json';
import homestead from '@/config/homestead.json';
import kovan from '@/config/kovan.json';
import rinkeby from '@/config/rinkeby.json';

const configs = { homestead, kovan, rinkeby };
configs.homestead = merge(registry, configs.homestead);
configs.kovan = merge(registryKovan, configs.kovan);
configs.rinkeby = merge(registryRinkeby, configs.rinkeby);
const network = process.env.VUE_APP_NETWORK || 'homestead';
const config = configs[network];
config.env = process.env.VUE_APP_ENV || 'staging';

export default config;
