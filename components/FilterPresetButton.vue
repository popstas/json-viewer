<template>
  <button
    @click="$store.dispatch('q', preset.q)"
    class="filter-presets__button"
    v-html="preset.name"
    :title="'Отфильтровать:\n' + preset.q"
    :class="{
      'filter-presets__button': true,
      'filter-presets__button_active': isActive(preset.q)
    }"
  ></button>
</template>

<script>
export default {
  props: ["preset"],
  methods: {
    isActive(q) {
      return this.$store.state.q.includes(q);
    }
  }
};
</script>
