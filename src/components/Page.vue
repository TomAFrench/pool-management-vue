<template>
  <div class="px-0 px-md-5 py-4">
    <UiLoading
      v-if="loading || (requireLogin && ui.authLoading)"
      class="big py-3"
    />
    <slot v-else />
  </div>
</template>

<script>
export default {
  props: {
    loading: Boolean,
    requireLogin: Boolean
  }
};
</script>
