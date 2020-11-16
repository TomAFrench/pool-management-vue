<template>
  <span class="toggle" :key="$route.path">
    <router-link
      v-for="(item, key) in items"
      :key="key"
      :to="item.to"
      class="router-link"
      :class="item.to.name === $route.name && 'active'"
      v-text="item.name"
    >
    </router-link>
  </span>
</template>

<script>
export default {
  props: ['items']
};
</script>

<style scoped lang="scss">
@import '../vars';

.toggle {
  display: inline-block;
  background-color: $secondary-button-background;
  border-radius: 22px;

  .router-link {
    display: inline-block;
    height: 44px;
    line-height: 40px;
    border-radius: 22px;
    color: $secondary-button-text;
    padding: 0 24px 3px;
  }

  .active {
    background-color: $panel-border !important;
  }
}
</style>
