<template>
  <div class="item-details" ref="detailsRef">
    <button v-if="store.flags.compare" class="item-compare" @click="toggleCompare">
      {{ isInCompare ? "Add to compare" : "Remove from compare" }}
    </button>
    <a
      v-if="item.url && lastGroup"
      class="item-details__title"
      :href="item.url"
      target="_blank"
    >{{ item.url }}</a
    >

    <!-- navigation -->
    <div class="item-details__groups" v-if="lastGroup">
      <a
        :class="{
          'item-details__groups-link_active': group.name === lastGroup,
          'item-details__groups-link': true
        }"
        :href="route.fullPath.replace(/#.*/, '') + '#' + item[store.defaultField] + '-' + group.name"
        v-for="group in groups"
        :key="group.name"
      >{{ group.name }}</a
      >
    </div>

    <!-- groups panels -->
    <div
      :class="{
        'item-details__group': true,
        'item-details__group_lighthouse': group.name.match(/Lighthouse/),
      }"
      v-for="group in groups"
      :data-group="group.name"
      :key="group.name"
      :id="item[store.defaultField] + '-' + group.name"
    >
      <div class="item-details__group-name">{{ group.name }}</div>
      <ul class="item-details__group-fields">
        <li
          v-for="field in group.fields"
          :key="field.name"
          :title="field.name"
          :class="field.validateClass"
        >
          <span class="item-details__label">{{
              field.comment || field.name
            }}</span>
          <el-scrollbar max-height="400px" v-if="field.name === 'readability_text'">
            <span
              class="item-details__value"
              v-html="field.valueText || field.value"
            ></span>
          </el-scrollbar>
          <span v-else
                class="item-details__value"
                v-html="field.valueText || field.value"
          ></span>

          <FilterPresetButton
            v-if="store.items.length > 1"
            class="field-preset"
            :preset="{ q: field.name + '=' + field.value }"
            :append="true"
          >
            <el-icon :size="10">
              <el-icon-filter />
            </el-icon>
          </FilterPresetButton>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.VueTables__child-row {
  background: none !important;
}
</style>

<script setup>
const props = defineProps({
  item: Object,
});
const emit = defineEmits(["hideTable"]);
const store = useStore();
const route = useRoute();

const groupsDefaultOrder = [
  // site-discovery
  "site_main",
  "meta",

  // site-audit-seo
  "metatags",
  "readability",
  "yake",
  "perf",
  "content",
];

const observer = ref(null);
const lastGroup = ref("");
const isInCompare = ref(false);

const detailsRef = ref(null);

watch(lastGroup, (val) => {
  emit("hideTable", val !== "");
});

const id = computed(() => {
  return store.itemsJsonUrl + "_" + props.item.url;
});

const groups = computed(() => {
  let groups = { unnamed: { name: "", fields: [] } };
  for (let colName in props.item) {
    let val = props.item[colName];
    if (typeof val === "object") continue;
    if (val === "") continue;

    const field = store.tests[colName];
    if (!field || !field.groups) {
      continue;
    }
    field.value = val;

    const groupsList = Array.isArray(field.groups)
      ? field.groups
      : [field.groups];

    field.validateClass = store.getColumnValidateClass(val, field.validate);

    let valueText;

    if (colName.match(/url/i)) {
      valueText = `<a href="${val}" target="_blank">${val}</a>`;
    }

    if (field.type === "boolean") {
      valueText = parseInt(val) ? "yes" : "no"; // tolang
    }

    if (
      typeof val === "string" &&
      (field.type === "image" ||
        val.match(/^http.*\.(jpg|jpeg|png|gif)$/)) &&
      val
    ) {
      valueText = `<img alt="error loading image" style="width: 150px; height: auto;" src="${val}" title="${val}"/>`;
    }

    field.valueText = valueText;

    for (let g in groupsList) {
      let groupName = groupsList[g];
      if (!(groupName in groups)) {
        groups[groupName] = { name: groupName, fields: [] };
      }

      // causes recursive updates when 2 ItemDetails opened
      // const f = { ...field };
      // if (g !== 0) field.validateClass += " secondary group-" + groupName;
      // groups[groupName].fields.push(f);

      groups[groupName].fields.push(field);
    }
  }

  const groupsSorted = {};

  // first from hardcoded order
  for (let groupName of groupsDefaultOrder) {
    if (groups[groupName]) groupsSorted[groupName] = groups[groupName];
  }

  // then other groups
  for (let groupName in groups) {
    if (!groupsSorted[groupName]) groupsSorted[groupName] = groups[groupName];
  }

  return groupsSorted;
});

onMounted(() => {
  // item details table of contents observe
  observer.value = new IntersectionObserver(
    onElementObserved,
    /*{
      root: detailsRef.value,
      threshold: 1.0,
    }*/
  );
  const groups = detailsRef.value.querySelectorAll(".item-details__group");
  observer.value.observe(detailsRef.value);
  for (let group of groups) {
    observer.value.observe(group);
  }

  if (store.flags.compare) {
    isInCompare.value = !!store.compareList.findIndex(i => i && i.id === id.value);
  }
});

onBeforeUnmount(() => {
  observer.value.disconnect();
  emit("hideTable", false);
});

function onElementObserved(entries) {
  let lastTarget;
  entries.forEach(({ target, isIntersecting }) => {
    // hide all groups
    if (target === detailsRef.value && !isIntersecting) {
      lastGroup.value = "";
      return;
    }

    if (!isIntersecting) return;
    lastTarget = target;
    // observer.unobserve(target);
  });

  if (lastTarget) {
    lastGroup.value = lastTarget.dataset.group;
  }
}

function toggleCompare() {
  const isRemove = !isInCompare.value;
  isInCompare.value = !isInCompare.value;
  const item = {
    id: id.value,
    reportUrl: store.itemsJsonUrl,
    item: props.item,
  };
  store.addToCompare({ item, isRemove });
}
</script>
