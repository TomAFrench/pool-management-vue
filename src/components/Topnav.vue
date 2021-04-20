<template>
  <nav id="topnav" class="border-bottom position-fixed width-full">
    <div class="d-flex flex-items-center px-5" style="height: 78px;">
      <div class="flex-auto d-flex flex-items-center">
        <div class="d-inline-block text-black d-flex" style="padding-top: 2px;">
          <router-link
            :to="{ name: 'home' }"
            class="d-inline-block d-flex"
            style="padding-top: 2px;"
          >
            <img
              src="~/@/assets/logo.svg"
              class="mr-2 v-align-middle"
              width="32"
              height="32"
            />
            <span
              class="d-inline-block "
              style="letter-spacing: 1px; font-size: 16px;"
              v-text="'Balancer'"
            />
          </router-link>
        </div>
      </div>
      <NavToggle class="v-align-middle" :items="links" />
    </div>
    <portal to="modal">
      <ModalActivity
        :open="modalOpen.activity"
        @close="modalOpen.activity = false"
      />
    </portal>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { getTotalPendingClaims } from '@/_balancer/claim';
import provider from '@/helpers/provider';

export default {
  data() {
    return {
      loading: false,
      totalPendingClaims: false,
      modalOpen: {
        activity: false
      }
    };
  },
  watch: {
    'web3.account': async function() {
      this.totalPendingClaims = false;
      if (!this.web3.account) return;
      try {
        this.totalPendingClaims = await getTotalPendingClaims(
          this.config.chainId,
          provider,
          this.web3.account
        );
      } catch (e) {
        console.log(e);
      }
    }
  },
  computed: {
    ...mapGetters(['myPendingTransactions']),
    wrongNetwork() {
      return !this.ui.authLoading && !this.loading;
    },
    links() {
      return [
        {
          name: this.$t('dashboard'),
          to: { name: 'home' }
        },
        {
          name: this.$t('explorePools'),
          to: { name: 'explore' }
        },
        {
          name: this.$t('createPool'),
          to: { name: 'create' }
        }
      ];
    }
  },
  methods: {
    ...mapActions(['toggleSidebar'])
  }
};
</script>

<style scoped lang="scss">
@import '../vars';

#topnav {
  z-index: 10;
  background-color: $panel-background;
}
</style>
