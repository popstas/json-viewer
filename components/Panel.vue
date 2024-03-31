<template>
  <el-collapse-item class="panels__panel" :name="name">
    <template v-slot:title>
      <el-icon v-if="icon">
        <component :is="icon" /><!--<el-icon-setting />--></el-icon>
      <span class="panel__title" v-html="title"></span>
      <span v-if="subtitle" class="panel__subtitle" v-html="subtitle"></span>
    </template>
    <slot>default</slot>
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
    display: inline-block;
    max-height: 48px;
    overflow: hidden;
  }

  .el-collapse-item__arrow {
    margin-left: 10px;
  }
}
</style>

<script setup>
defineProps(["icon", "title", "subtitle", "name"]);
</script>
