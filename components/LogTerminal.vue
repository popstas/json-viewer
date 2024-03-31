<script setup>
const store = useStore();
const blockRef = ref(null);
const logHeight = 600;
const gap = 50;

watch(() => store.log, () => {
  if (!blockRef.value) return;
  setTimeout(() => {
    if (!blockRef.value) return;
    if (blockRef.value.scrollHeight - blockRef.value.scrollTop - logHeight < gap) {
      blockRef.value.scrollTop = blockRef.value.scrollHeight;
    }
  }, 10);
});
</script>

<template>
  <div class="scan__log-container" v-if="store.log.length > 0">
    <ul class="scan__log" ref="blockRef">
      <li v-for="(line, index) in store.log" :key="index" v-html="line"></li>
    </ul>
  </div>
</template>
