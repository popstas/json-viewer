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
    },
    toggle: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    isActive(q) {
      return this.$store.state.q.includes(q);
    },

    parseQuery(q) {
      let qParts = q.split("&");
      qParts = qParts
        .map(part => {
          const match = part.match(/(.*?)\s*([<=>~]+)\s*(.*)/);
          if (match) {
            return {
              name: match[1],
              op: match[2],
              value: match[3]
            };
          }
        })
        .filter(part => part !== undefined);
      return qParts;
    },

    togglePreset(q) {
      let qParts = this.parseQuery(q);
      let sParts = this.parseQuery(this.$store.state.q);
      let result = sParts;
      qParts.forEach(qPart => {
        let found = result.findIndex(sPart => sPart.name == qPart.name);
        if (found == -1) {
          result.push(qPart);
        } else {
          result.splice(found, 1);
        }
      });
      return result.map(part => part.name + part.op + part.value).join("&");
    },

    setPreset(q) {
      if (!this.append) {
        if (this.toggle) {
          q = this.togglePreset(q);
        }
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
