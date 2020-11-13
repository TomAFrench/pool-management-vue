<template>
  <span class="toggle">
    <a
      v-for="(name, key) in options"
      :key="key"
      @click="$emit('select', key)"
      :class="value === key && 'active'"
      v-text="name"
    >
    </a>
  </span>
</template>

<script>
export default {
  props: ['value', 'options']
};
</script>

<style scoped lang="scss">
@import '../vars';

.toggle {
  display: inline-block;
  background-color: $panel-border;
  border-radius: 22px;

  a {
    display: inline-block;
    height: 44px;
    line-height: 40px;
    border-radius: 22px;
    color: $secondary-button-background;
    padding: 0 24px 3px;
  }

  a:hover {
    background-color: $secondary-button-background-hover !important;
  }

  .active {
    background-color: $primary-button-background !important;
    color: $primary-button-text;
  }

  .active:hover {
    background-color: $primary-button-background-hover !important;
    color: $primary-button-text;
  }
}
</style>
