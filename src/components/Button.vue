<template>
  <button
    @click="handleClick"
    :disabled="isDisabled"
    type="button"
    class="button"
  >
    <UiLoading v-if="step === 'loading'" />
    <span v-else-if="step === 'login'" v-text="'Connect wallet'" />
    <span v-else-if="step === 'proxy'" v-text="'Setup proxy'" />
    <span
      v-else-if="step === 'approval'"
      v-text="`Unlock ${nextRequiredApproval.symbol}`"
    />
    <slot v-else />
  </button>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: {
    disabled: !Boolean,
    loading: !Boolean,
    requireLogin: !Boolean,
    requireProxy: !Boolean,
    requireApprovals: !Object
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
    isDisabled() {
      return this.disabled || this.step === 'loading';
    }
  },
  methods: {
    ...mapActions(['createProxy', 'approve']),
    async handleClick() {
      if (!this.step) return this.$emit('submit');
    }
  }
};
</script>
