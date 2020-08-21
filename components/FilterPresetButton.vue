<template>
  <button
    @click="setPreset(preset.q)"
    class="filter-presets__button"
    :title="'Отфильтровать:\n' + preset.q"
    :class="{
      'filter-presets__button': true,
      'filter-presets__button_active': isActive(preset.q),
      'filter-presets__button_inactive': isInactive(preset.q)
    }"
  >
    <slot name="default">{{ preset.name }}</slot>
    {{ filterCounter }}
  </button>
</template>

<style lang="scss">
.filter-presets__button {
  outline: none;
  background: none;
  border: 1px solid transparent;
  padding: 5px;
  margin-right: 1em;
  color: rgba(255, 0, 0, 0.87);
  @media (max-width: 1000px) {
    padding: 5px;
  }

  &_active {
    border: 1px solid;
  }

  &_inactive {
    opacity: 0.5;
  }
}
</style>

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
  computed: {
    filterCounter() {
      if (this.preset.q.match(/=$/)) return '';
      return '(' + this.getFilterCount() + ')';
    }
  },
  methods: {
    isActive(q) {
      return this.$store.state.q.includes(q);
    },

    isInactive(q) {
      let qParts = this.parseQuery(q);
      for (let p of qParts) {
        const isAvailable = !!this.$store.state.availableFields.find(f => f.name == p.name);
        if (!isAvailable) return true;
      }
      return false;
    },

    parseQuery(q) {
      let qParts = q.split("&");
      qParts = qParts
        .map(part => {
          const match = part.match(/(.*?)\s*([!<=>~]+)\s*(.*)/);
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

    mergePreset(q) {
      if (!q) q = '';
      if (!this.append) {
        if (this.toggle) {
          q = this.togglePreset(q);
        }
        return q;
      }

      let parts = this.$store.state.q ? this.$store.state.q.split("&") : [];
      parts.push(q);
      const result = parts.join("&");
      return result;
    },

    setPreset(q) {
      q = this.mergePreset(q);
      this.$store.dispatch("q", q);
      this.$nuxt.$emit("inputFocus");
    },

    getFilterCount() {
      let q = this.mergePreset(this.preset.q);
      const filtered = this.$store.getters.getFilteredItems(q);
      return filtered.length;
    }
  }
};
</script>
