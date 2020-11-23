<template>
  <UiButton
    @click="handleSubmit"
    type="button"
    class="button-sm"
    v-if="locked"
    :loading="loading"
  >
    {{ $t('unlock') }}
  </UiButton>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: ['tokenAddress', 'amount', 'decimals'],
  data() {
    return {
      loading: false,
      input: false
    };
  },
  computed: {
    locked() {
      this.$emit('input', false);
      return false;
    }
  },
  methods: {
    ...mapActions(['approve']),
    async handleSubmit() {
      this.loading = true;
      try {
        // await this.approve(this.tokenAddress);
        this.$emit('approved', true);
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    }
  }
};
</script>
