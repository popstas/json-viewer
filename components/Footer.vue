<script setup>
const store = useStore();
</script>

<template>
  <el-footer v-if="store.flags.footer" height="36px">
    <a
      target="_blank"
      href="https://github.com/viasite/json-viewer/releases"
    >{{ store.name }} {{ store.version }}</a>
  </el-footer>
</template>
