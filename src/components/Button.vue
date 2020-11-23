<template>
  <button
    @click="handleClick"
    :disabled="isDisabled"
    type="button"
    class="button"
  >
    <UiLoading v-if="step === 'loading'" />
    <slot v-else />
  </button>
</template>

<script>
import { mapActions } from 'vuex';

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
