<template>
  <el-card class="scan__history-container scan__list box-card" v-if="items.length > 0">
    <h3>Scan history:</h3>
    <ul class="scan__presets">
      <li v-for="preset in itemsReversed" :key="preset.date">
        <NuxtLink :to="presetUrl(preset)" :title="preset.args">
          {{ time2date(preset.date) }} {{ preset.url }}
        </NuxtLink>
        <button class="scan__presets-remove" @click="removePreset(preset.date)">✖</button>
      </li>
    </ul>
  </el-card>
</template>

<style lang="scss">
.scan__history-container ul {
  //max-height: 50vh;
  max-height: 280px;
  overflow-y: auto;
}
</style>

<script setup>
const props = defineProps({
  items: Array,
});

const store = useStore();

const itemsReversed = computed(() => [...props.items].reverse());

function removePreset(date) {
  let presets = [...props.items];
  presets = presets.filter(preset => preset.date !== date);
  store.$patch({ scanHistory: presets });
}

function presetUrl(preset) {
  return `/scan?url=${preset.url}&args=${preset.args}&preset=${preset.name}`;
}

function time2date(time) {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  const d = new Date(time - tzoffset);
  return d.toISOString().substring(0, 19).replace("T", " ");
}
</script>
