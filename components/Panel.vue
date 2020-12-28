<template>
  <el-collapse-item class="panels__panel" :name="name">
    <template slot="title">
      <i v-if="icon" :class="icon"></i>
      <span class="panel__title" v-html="title"></span>
      <span v-if="subtitle" class="panel__subtitle" v-html="subtitle"></span>
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
  .panel__subtitle {
    margin-left: 10px;
    font-weight: normal;
    color: #999;
  }
}
</style>

<script>
export default {
  components: {},
  props: ["icon", "title", "subtitle", "name"],
  computed: {},
  methods: {},
};
</script>
