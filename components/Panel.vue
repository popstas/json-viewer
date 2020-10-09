<template>
  <el-collapse-item class="panels__panel" :name="name">
    <template slot="title">
      <i v-if="icon" :class="icon"></i>
      <span class="panel__title" v-html="title"></span>
    </template>
    <slot></slot>
  </el-collapse-item>
</template>

<style lang="scss">
.panels__panel {
  /* i {
    font-size: 20px;
  } */
  .panel__title {
    margin-left: 10px;
  }
}
</style>

<script>
export default {
  components: {},
  props: ["icon", "title", "name"],
  computed: {
    tests() {
      return this.$store.state.tests;
    },
  },
  methods: {},
};
</script>
