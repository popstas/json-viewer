<template>
  <button
    @click="setPreset"
    v-if="store.flags.navigation"
    class="filter-presets__button"
    :title="'Filter:\n' + preset.q"
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
  padding-left: 5px;
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

<script setup>
// TODO2: when filter is set on page load, got error: set-filters-dom.js:30 vue-tables-3: Error in setting filter value. Column 'url' does not exist.
const props = defineProps({
  preset: Object,
  append: {
    type: Boolean,
    default: false,
  },
  toggle: {
    type: Boolean,
    default: false,
  },
  noCount: {
    type: Boolean,
    default: false,
  },
});
const store = useStore();

const { $event } = useNuxtApp();
const filterCount = ref(0);

const filterCounter = computed(() => {
  if (props.noCount) return "";
  if (props.preset.q.match(/=$/)) return "";
  const count = getFilterCount();
  if (count === 1) return "unique"; // tolang
  return "(" + count + ")";
});

function isActive(q) {
  return store.q.includes(q);
}

function isInactive(q) {
  let qParts = parseQuery(q);
  for (let p of qParts) {
    const isAvailable = !!store.availableFields.find(f => f.name === p.name);
    if (!isAvailable) return true;
  }
  return filterCount.value === 0;
}

function parseQuery(q) {
  let qParts = q.split("&");
  qParts = qParts
    .map(part => {
      const match = part.match(/(.*?)\s*([!<=>~]+)\s*(.*)/);
      if (match) {
        return {
          name: match[1],
          op: match[2],
          value: match[3],
        };
      }
    })
    .filter(part => part !== undefined);
  return qParts;
}

function togglePreset(q) {
  let qParts = parseQuery(q);
  let result = parseQuery(store.q);
  qParts.forEach(qPart => {
    let found = result.findIndex(sPart => sPart.name === qPart.name);
    if (found === -1) {
      result.push(qPart);
    } else {
      result.splice(found, 1);
    }
  });
  return result.map(part => part.name + part.op + part.value).join("&");
}

function mergePreset(q) {
  if (!q) q = "";
  if (!props.append) {
    if (props.toggle) {
      q = togglePreset(q);
    }
    return q;
  }

  let parts = store.q ? store.q.split("&") : [];
  parts.push(q);
  return parts.join("&");
}

function setPreset() {
  const q = mergePreset(props.preset.q);
  // timeout for instant redraw
  setTimeout(() => {
    store.setQ(q);
    if (props.preset.sort) $event("sort", props.preset.sort); // TODO2: remove global event
  }, 10);
}

function getFilterCount() {
  let q = mergePreset(props.preset.q);
  const filtered = store.getFilteredItems(q);
  filterCount.value = filtered.length;
  return filterCount.value;
}
</script>
