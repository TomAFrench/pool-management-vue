<template>
  <button
    @click="handleClick"
    :disabled="isDisabled"
    type="button"
    class="button"
    :class="disabled || !stepTip ? '' : 'tooltipped tooltipped-n'"
    :aria-label="stepTip"
  >
    <UiLoading v-if="step === 'loading'" />
    <slot v-else />
  </button>
</template>

<script>
export default {
  props: {
    disabled: !Boolean,
    loading: !Boolean
  },
  data() {
    return {
      isLoading: false
    };
  },
  computed: {
    step() {
      if (this.loading || this.isLoading) return 'loading';
      if (this.disabled) return false;
      return false;
    },
    stepTip() {
      if (this.step === 'login') {
        return this.$t('connectWalletToAddLiquidity');
      } else if (this.step === 'proxy') {
        return this.$t('createProxyTip');
      } else if (this.step === 'approval') {
        return this.$t('approveToken');
      }

      return undefined;
    },
    isDisabled() {
      return this.disabled || this.step === 'loading';
    }
  },
  methods: {
    async handleClick() {
      if (!this.step) return this.$emit('submit');
    }
  }
};
</script>
