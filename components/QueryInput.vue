<template>
  <div class="query-input">
    <el-autocomplete
      class="filter__query"
      ref="inputRef"
      placeholder="query"
      v-model="q"
      title="Examples:

  engine=bitrix&prod=1

  site_template~/aspro-.*/

  meta_year!=2019"
      v-bind:style="{width: filterWidth + 'px'}"
      :fetch-suggestions="queryComplete"
      valueKey="name"
      :clearable="true"
      @select="querySelect"
      @clear="queryChangeAction"
      @keyup.enter.native="queryChangeAction(true)"
    >
      <template #default="{ item }">
        <span class="query-input__field-name">{{ item.name }}</span>
        <span class="query-input__field-label">{{ item.comment }}</span>
      </template>
    </el-autocomplete>

    <div class="filter__query-tags">
      <el-tag
        v-for="tag in queryParts"
        :key="tag"
        closable
        :disable-transitions="true"
        @close="handleTagClose(tag)"
      >{{ tagName(tag) }}
      </el-tag>
    </div>
  </div>
</template>

<style lang="scss">
.query-input {
  input {
    text-align: center;
    min-width: 150px;
    font-family: monospace;
  }

  // автодополнение
  &__field-name {
    font-weight: bold;
    font-size: 12px;
  }

  &__field-label {
    margin-left: 10px;
    color: #999;
  }
}

.el-autocomplete-suggestion {
  min-width: 360px;

  &__wrap {
    padding: 0;
    max-height: 60vh;
  }

  li {
    padding: 0 5px;
    font-size: 10px;
    line-height: 1.5rem;
  }
}

.el-tag {
  margin: 0 5px;
}
</style>

<script setup>
const inputRef = ref(null);
const store = useStore();

const q = ref(store.q);
const globalQ = computed(() => store.q);
const queryParts = computed(() => store.q.split("&").filter(Boolean));
const lastQ = ref(""); // lastQ is needed because q is model of autocomplete, when click suggestion, it overwrites q
const currentPart = ref("");
const completionProcess = ref(false);

const filterWidth = computed(() => {
  const padding = 45; // paddings and close button
  return (q.value.length + 1) * 8 + padding;
});

watch(q, (val) => {
  lastQ.value = val;
});
watch(globalQ, (val) => {
  q.value = val;
});

function queryChangeAction(force = false) {
  if (completionProcess.value && !force) {
    completionProcess.value = false;
    return;
  }

  inputRef.value.close();
  store.setQ(q.value);
}

/* function normalizeQuery(q) {
  const normalizedParts = queryParts.value.map(part => {
    return part.replace(/^([a-z_0-9]+)$/, "$1=1"); // prod => prod=1
  });
  return normalizedParts.join("&");
}, */

// autocomplete of query
// подсказывает из доступных полей и значений
// если кол-во полей или значений равно нулю, тогда подсказки берутся из всех полей и сайтов,
// это нужно, чтобы выбраться из сломанного запроса
function queryComplete(q, cb) {
  // TODO2: в q старое значение, надо брать this.q, вроде это поправлено
  if (!q || completionProcess.value) return cb([]);
  const parts = q.split("&");
  const lastPart = parts[parts.length - 1];

  completionProcess.value = true;
  setTimeout(() => {
    completionProcess.value = false;
  }, 500);

  if (lastPart.match(/[<=>]/)) {
    // field value completion
    currentPart.value = "value";
    const fieldMatch = lastPart.match(/(.*?)[<=>]/);
    const fieldName = fieldMatch[1];
    /*const matchFields = store.allFields.filter(
      filter => filter.name == fieldName
    );*/
    const valueMatch = lastPart.match(/=(.*)/);
    const fieldValue = valueMatch ? valueMatch[1] : "";
    // const qRegex = new RegExp(fieldValue, "i");

    const items = store.filteredItems.length > 0 ? store.filteredItems : store.items;
    const values = items.map(item => {
      if (
        !fieldValue ||
        (item[fieldName] && item[fieldName].toString().includes(fieldValue))
      ) {
        return item[fieldName];
      }
    });
    const uniqueValues = values.filter((v, i, a) => a.indexOf(v) === i);
    const sortedValues = uniqueValues.sort();
    cb(
      sortedValues.map(name => {
        return { name };
      }),
    );
  } else {
    // field name completion
    currentPart.value = "name";
    const fields = store.availableFields.length > 0 ? store.availableFields : store.allFields;
    const matchFields = fields.filter(filter =>
      filter.name.includes(lastPart),
    );
    const sortedFields = matchFields.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
    );
    cb(sortedFields);
  }
}

// выбор автодополнения
function querySelect(selected) {
  inputRef.value.focus();
  let parts = lastQ.value.split("&");

  if (currentPart.value === "name") {
    parts[parts.length - 1] = selected.name; // + "=";
    // inputRef.value.$el.querySelector('input').dispatchEvent(new Event('change'));
  }

  if (currentPart.value === "value") {
    parts[parts.length - 1] =
      parts[parts.length - 1].replace(/=.*/, "") + "=" + selected.name;
  }

  q.value = parts.join("&");

  // без этого сразу фильтрует при вводе имени
  setTimeout(() => {
    completionProcess.value = false;
  }, 500);

  if (currentPart.value === "value") queryChangeAction();
}

function handleTagClose(tag) {
  q.value = q.value
    .replace(tag + "&", "")
    .replace("&" + tag, "")
    .replace(tag, "");
  queryChangeAction();
}

// название тега в выбранных фильтрах
function tagName(tag) {
  let tagName = tag.replace(/=1$/, "").replace(/([<=>])/, " $1 ");
  const match = tag.match(/^([a-z0-9_]+)(.*)/);
  if (match) {
    let fieldName = match[1];
    let fieldValue = match[2].replace(/([<=>])/, " $1 ");
    const info = store.tests[fieldName];
    if (info) {
      if (info.comment) fieldName = info.comment;
      if (info.type === "boolean") {
        fieldValue = fieldValue
          .replace("0", "нет")
          .replace("1", "да")
          .replace(" = ", ": ");
      }
      tagName = fieldName + fieldValue;
    }
  }
  return tagName;
}
</script>
