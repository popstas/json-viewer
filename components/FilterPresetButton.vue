<template>
  <button
    @click="setPreset(preset.q)"
    class="filter-presets__button"
    :title="'Отфильтровать:\n' + preset.q"
    :class="{
      'filter-presets__button': true,
      'filter-presets__button_active': isActive(preset.q)
    }"
  >
    <slot name="default">{{ preset.name }}</slot>
  </button>
</template>

<script>
export default {
  props: {
    preset: Object,
    append: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    isActive(q) {
      return this.$store.state.q.includes(q);
    },

    setPreset(q) {
      if (!this.append) {
        this.$store.dispatch("q", q);
        return;
      }

      let parts = this.$store.state.q ? this.$store.state.q.split("&") : [];
      parts.push(q);
      const result = parts.join("&");
      this.$store.dispatch("q", { q: result });
    }
  }
};
</script>
