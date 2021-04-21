<template>
  <el-card class="scan__history-container scan__list box-card" v-if="items.length > 0">
    <h3>Scan history:</h3>
    <ul class="scan__presets">
      <li v-for="preset in itemsReversed" :key="preset.date">
        <NuxtLink :to="presetUrl(preset)" :title="preset.args">
          {{ new Date(preset.date).toISOString().substring(0,19).replace('T', ' ') }} {{ preset.url }}
        </NuxtLink>
        <button class="scan__presets-remove" @click="removePreset(preset.date)">✖</button>
      </li>
    </ul>
  </el-card>
</template>

<style lang="scss">
.scan__history-container ul {
  max-height: 70vh;
  overflow-y: auto;
}
</style>

<script>


export default {
  props: ['items'],
  data() {
    return {
    };
  },

  computed: {
    itemsReversed() {
      return [...this.items].reverse();
    }
  },

  watch: {
  },

  methods: {
    removePreset(date) {
      console.log('remove history: ', date);
      let presets = [...this.items]
      presets = presets.filter(preset => preset.date !== date);
      this.$store.commit('scanHistory', presets);
    },

    presetUrl(preset) {
      // console.log('preset: ', preset);
      return `/scan?url=${preset.url}&args=${preset.args}&preset=${preset.name}`;
    },

  },

  async mounted() {
  },

};
</script>
