<template>
  <section class="container" :class="['report-page', `mode-${displayMode}`]">
    <div v-if="!itemsJsonUrl">
      No reports<br><br>
      <NuxtLink class="el-button el-button--primary" to="/scan">Scan</NuxtLink>
    </div>

    <div v-else>
      <!--<v-tour v-if="store.flags.tour" name="introTour" :steps="introTourSteps" :options="{ highlight: true }"></v-tour>-->

      <el-button class="advanced-button" @click="enableNavigation" v-if="!store.flags.navigation">...</el-button>

      <header v-if="store.flags.navigation">
        <el-button
          v-if="store.flags.tour"
          class="help-tour-button"
          :plain="!isNewUser"
          :type="isNewUser ? 'primary' : ''" @click="startIntroTour"
          :size="isNewUser ? '' : 'small'"
        >Help tour
        </el-button>

        <el-switch class="display-mode-switch"
                   v-model="isEditMode"
                   active-text="edit"
                   inactive-text="view"
        >
        </el-switch>

        <ReportHistory :tableRef="tableRef"></ReportHistory>

        <div class="total">total: {{ filteredItems.length }}</div>
      </header>

      <div v-if="dd.jsonLoadError">
        <div class="msg danger">Failed to load {{ itemsJsonUrl }}</div>
      </div>
      <div v-if="dd.jsonLoading"><i class="el-icon-loading"></i> Loading...</div>

      <div v-if="!dd.jsonLoading && !dd.jsonLoadError">
        <el-collapse v-if="store.flags.navigation" v-model="openedPanels" class="panels">

          <!-- Тулбар -->
          <Panel title="columns explorer" :icon="ElIconFolderOpened" name="columns">
            <Toolbar @toggleField="toggleField" @setFields="setFields" @setPreset="setPreset"></Toolbar>
          </Panel>

          <!-- Выбранные колонки -->
          <!-- <Panel title="current columns" icon="el-icon-caret-right" name="current_columns" class="current-columns">
            <ColumnField
              :field="field"
              :checked="store.fieldExists(field)"
              @click="toggleField(field, false, true)"
              :class="{ 'available-fields__field': true, active: store.fieldExists(field) }"
              v-for="field of fields"
              :key="field.name"
            ></ColumnField>
          </Panel> -->

          <!-- Сводка по таблице -->
          <Panel title="filtered stats" :icon="ElIconHistogram" name="stats">
            <Stats></Stats>
          </Panel>

          <Panel title="presets" :icon="ElIconMenu" name="filter_presets">

            <!-- Наборы колонок -->
            <div class="column-presets">
              <ColumnPresetButton
                :preset="preset"
                @click="setPreset(preset);"
                v-for="preset in columnPresets"
                :key="preset.name"
              ></ColumnPresetButton>
            </div>

            <!-- Фильтры -->
            <div class="filter-presets">
              <FilterPresetButton
                :preset="preset"
                v-for="preset in filterPresets"
                :key="preset.name"
                toggle
              ></FilterPresetButton>
            </div>

            <QueryInput class="filter__query"></QueryInput>
          </Panel>

        </el-collapse>

        <div v-if="store.flags.navigation"><br>
          <div>total: {{ filteredItems.length }}</div>
          <div v-if="dd.date">updated: {{ new Date(dd.date).toLocaleString() }}</div>
        </div>

        <div class="table-actions" v-if="store.flags.navigation">
          <el-checkbox class="human-columns-switch" v-model="showHumanColumns">
            Human column names
          </el-checkbox>

          <button class="btn btn-excel" @click="getXlsx">
            <el-icon>
              <el-icon-document />
            </el-icon>
            xlsx
          </button>
        </div>

        <div v-if="filteredItems.length >= 500" class="lite-mode-warning">
          <span v-if="filteredItems.length >= liteModeFrom">Table has more than {{ liteModeFrom }} rows,</span>
          using {{ dd.liteMode ? "lite" : "full" }} mode.
          <el-button @click="switchToFullMode(dd.liteMode)">{{ dd.liteMode ? "Full" : "Lite" }} mode</el-button>
        </div>

        <TableLite v-if="dd.liteMode"
                   ref="tableRef"
                   :headings="headings"
                   :data="filteredItems"
                   :showTableFilters="store.flags.navigation && !dd.hideTableFilters"
        />


        <v-client-table
          v-if="filteredItems.length > 0 && fields.length > 0 && !dd.liteMode"
          :columns="columns"
          :data="filteredItems"
          :options="tableOptions"
          @loaded="onTableLoaded"
          @sorted="onSorted"
          @row-click="rowClick"
          ref="tableRef"
        >
          <template v-slot:child_row="props" v-if="!dd.hideTableFilters">
            <ItemDetails v-if="!dd.hideTableFilters" @hideTable="onHideTable"
                         :item="store.getItemByDefaultField(props.row[store.defaultField])"></ItemDetails>
          </template>

          <template v-slot:prependHead>
            <tr v-if="store.flags.navigation && !dd.hideTableFilters" class="table__column-controls">
              <td v-if="!dd.hideTableFilters" style="width:18px">&nbsp;&nbsp;&nbsp;&nbsp;</td>
              <td v-for="field in fields" :key="field.name">
                <ColumnField
                  :field="field"
                  :checked="store.fieldExists(field)"
                  @click="toggleField(field, false, true)"
                  :class="{ 'available-fields__field': true, active: store.fieldExists(field) }"
                ></ColumnField>
              </td>
            </tr>
          </template>

          <!-- для каждой колонки создается слот, который получает класс и значение через функции -->
          <template
            v-for="colName in columns"
            :key="colName"
            v-slot:[colName]="{ row }"
          >
            <div v-html="store.getColumnValue(row, colName)"></div>
          </template>
        </v-client-table>
      </div>
    </div>
  </section>
</template>

<style lang="scss"></style>

<script setup>
import axios from "axios";
import _ from "lodash";
import { utils, writeFile } from "xlsx";
import { storeToRefs } from "pinia";
import TableLite from "../components/TableLite.vue";
// import { EventBus as TableEventBus } from "v-tables-3";

// TODO2: reduce table loads
/*TableEventBus.on('*', (e) => {
  console.log("e:", e);
});*/

const store = useStore();
const route = useRoute();
const router = useRouter();
const { $listen } = useNuxtApp();

const dd = reactive({
  tests: store.tests,
  jsonLoadError: false,
  jsonLoading: true,
  sort: {},
  hideTable: false,
  reportName: "",
  date: false,
  hideTableFilters: false, // for buildXlsx
  liteMode: false,
});

const {
  q,
  itemsJsonUrl,
  fields,
  availableFields,
  items,
  filteredItems,
  filterPresets,
  columnPresets,
} = storeToRefs(store);

const tableRef = ref(null);

const itemsLength = computed(() => items.value.length);
const defaultFilter = computed(() => filterPresets.value.find(filter => filter.default) || {});
const introTourSteps = computed(() => {
  let i = 1;
  let total = store.introTourSteps.length;

  return store.introTourSteps.map(step => {
    step.header = { title: `${i} / ${total}` };
    i++;
    return step;
  });
});

const liteModeFrom = ref(1000);

const displayMode = computed({
  get: () => store.displayMode,
  set: (val) => store.$patch({ displayMode: val }),
});
const openedPanels = computed({
  get: () => store.openedPanels,
  set: (val) => store.$patch({ openedPanels: val }),
});
const isEditMode = computed({
  get: () => store.displayMode === "edit",
  set: (val) => displayMode.value = val ? "edit" : "view",
});
const showHumanColumns = computed({
  get: () => store.showHumanColumns,
  set: (val) => store.$patch({ showHumanColumns: val }),
});

const tableClasses = computed(() => {
  const columnsClasses = {};
  for (let columnName of columns.value) {
    columnsClasses[columnName] = "col-" + columnName;
  }

  const cellClasses = {};
  const classMap = {
    warning: "warning",
    error: "danger",
    success: "success",
    accent: "accent",
  };
  for (let columnName of columns.value) {
    const field = fields.value.find(f => f.name === columnName);
    if (!field) continue;
    const rules = [];

    // default class
    rules.push({
      class: "cell",
      condition: () => true,
    });

    // default column (sticky)
    if (field.default) {
      rules.push({
        class: "col-default",
        condition: () => true,
      });
    }

    // align
    if (field.align) {
      rules.push({
        class: "align-" + field.align,
        condition: () => true,
      });
    } else {
      // align left for text
      if (["string", "email", "domain"].includes(field.type)) {
        rules.push({
          class: "align-left",
          condition: () => true,
        });
      }

      // align center for numbers
      if (["integer", "number", "boolean", "time"].includes(field.type)) {
        rules.push({
          class: "align-center",
          condition: () => true,
        });
      }
    }

    // validate
    if (field.validate) {
      let validateRules = field.validate;

      // fix validateRules: ignore legacy object rules
      for (let errType of ["success", "warning", "error", "accent"]) {
        if (validateRules[errType] && typeof validateRules[errType] !== "string") {
          console.error(`${columnName}: only strings should be in field.validate.${errType}, given: `, validateRules[errType]);
          delete (validateRules[errType]);
        }
      }

      // for debug
      /*if (columnName == 'status'){
        validateRules = {
          error: '!= 200'
        };
      }*/

      // warning
      for (let errType of ["warning", "error", "success", "accent"]) {
        if (!validateRules[errType]) continue;
        rules.push({
          class: classMap[errType],
          condition: row => {
            // const val = row[columnName];
            const res = validateRules[errType].match(/^([A-Za-z0-9_]*)\s*(===|==|!==|!=|>|>=|<|<=)\s*(.*)$/);
            const valueColumn = res ? res[1] : columnName;
            const validateVal = row[valueColumn];
            const func = getValidateFunc(validateRules[errType]);

            // for debug
            /*if(columnName == 'name') {
              console.log('errType: ', errType);
              console.log('rules: ', validateRules[errType]);
              // console.log('validateRules[value_from]:' , validateRules['value_from']);
              console.log('val: ', validateVal);
              console.log('valid: ', func(validateVal));
              console.log('');
            }*/

            return func(validateVal);
          },
        });
      }

      // success
      //  && (!validateRules['value_from'] || validateRules.success)  // TODO2: убрать отсюда value_from, это костыль для одного случая
      if ((validateRules.warning || validateRules.error) && !validateRules.success) {
        rules.push({
          class: "success",
          condition: row => {
            // const val = row[columnName];
            const validateVal = field.validate_from ? row[field.validate_from] : row[columnName];
            const isSuccess =
              !getValidateFunc(validateRules.warning)(validateVal) &&
              !getValidateFunc(validateRules.error)(validateVal) &&
              !["", NaN, null, undefined].includes(validateVal);

            // console.log('errType: ', 'success');
            // console.log('val: ', val);
            // console.log('valid: ', isSuccess);
            // console.log('');
            return isSuccess;
          },
        });
      }
    }

    cellClasses[columnName] = rules;
  }
  return { cellClasses, columnsClasses };
});

const tableOptions = computed(() => {
  const { cellClasses, columnsClasses } = tableClasses.value;

  const options = {
    headings: headings.value,
    headingsTooltips: headingsTooltips.value,
    filterable: dd.hideTableFilters ? false : filterableColumns.value,
    // skin: "VueTables__table table table-striped table-bordered table-hover"
    skin: "table table-striped table-bordered table-hover" + (dd.hideTable ? " table_without-header" : ""),
    cellClasses: cellClasses,
    columnsClasses: columnsClasses,
    perPage: Math.min(1000, filteredItems.value.length),
    perPageValues: [50, 100, 250, 500, 1000, 5000, 10000, 20000],
    texts: {
      defaultOption: "",
      filterBy: "",
    },
    // columnsDropdown: true,
    rowClassCallback(row) {
      if (row.error) return "danger";
      // return 'success';
    },
    templates: {
      /* 'files_size'(h, row, index) { // работал, но перестал вызываться после убирания item.item_info
        if (!row.files_size) return '';
        return Math.round(row.files_size / 1024) || '';
      } */
    },
  };

  // column filters
  if (fields.value.length > 0 && filterableColumns.value.length > 0) {
    options.filterByColumn = true;
    options.listColumns = listColumns.value;
  }

  // customers, array valued field
  // TODO2: to field config
  /*options.filterAlgorithm = {
    customers(row, query) {
      return row.customers.includes(query);
    }
  }*/

  return options;
});

const columns = computed(() => fields.value.map(field => field.name));

const headings = computed(() => {
  let h = {};
  fields.value.forEach(field => {
    if (showHumanColumns.value) {
      h[field.name] = field.comment || field.title.split("_").join(" ") || field.name;
    } else {
      // h[field.name] = field.title.split("_").join(" ") || field.name;
      h[field.name] = field.title || field.name;
    }
  });
  return h;
});

const headingsTooltips = computed(() => {
  let h = {};
  fields.value.forEach(field => {
    h[field.name] = field.name
      + (field.comment ? `\n\n${field.comment}` : "")
      + (field.description ? `\n\n${field.description}` : "");
  });
  return h;
});

const filterableColumns = computed(() => {
  const list = [store.defaultField];
  for (const field of fields.value) {
    if (field.filterType && !list.includes(field.name)) list.push(field.name);
  }
  return list;
});

// фильтры к колонкам
const listColumns = computed(() => {
  let cols = {};
  fields.value.forEach(field => {
    if (!field.filterType) return;

    if (field.type === "boolean") {
      cols[field.name] = [
        {
          id: 0,
          text: "No", // tolang
        },
        {
          id: 1,
          text: "Yes",
        },
      ];
    }

    if (field.filterType === "string") {
      // text filter by default
    }

    if (field.filterType === "enum") {
      const vals = {};
      for (let item of filteredItems.value) {
        if (Array.isArray(item[field.name])) {
          for (let val of item[field.name]) {
            if (vals[val]) vals[val] += 1;
            else vals[val] = 1;
          }
        } else {
          const iVal = item[field.name];
          if ([null, undefined, ""].includes(iVal)) continue;

          if (vals[iVal]) vals[iVal] += 1;
          else vals[iVal] = 1;
        }
        /*const iVal = item[field.name];

        if ([null, undefined, ''].includes(iVal)) continue;

        if (vals[iVal]) vals[iVal] += 1;
        else vals[iVal] = 1;*/
      }

      const sorted = Object.keys(vals).sort();
      const list = [];
      let i = 0;
      for (let valName of sorted) {
        const count = vals[valName];
        list.push({
          id: valName,
          text: `${valName} (${count})`,
        });
        i++;
      }
      cols[field.name] = list;
    }
  });

  return cols;
});

const pageTitle = computed(() => {
  let title = [];

  if (dd.reportName) title.push(dd.reportName); // TODO2: unused?

  const reportName = store.shortReportUrl(store.itemsJsonUrl);
  title.push(reportName);

  if (q.value) title.push("q: " + q.value);

  /* if (fields.value.length > 0 && !isDefaultFields(columns.value)) {
    title.push("Fields: " + columns.value);
  } */

  if (title.length > 0) title.push("Results");

  title.push(store.name);

  return title.join(" - ");
});

const isNewUser = computed(() => store.visitCount < store.newUserVisits);

const jsonInput = computed(() => {
  try {
    return JSON.parse(store.jsonRaw);
  } catch (e) {
    return false;
  }
});

watch(q, (val) => {
  updateUrlQuery(false);
  if (val) openFilterPanelIfNeed();

  // добавление колонок, которые есть в фильтре
  const parts = q.value.split("&");
  parts.forEach(part => {
    const match = part.match(/^[a-zA-Z0-9_]+/);
    if (match) addFieldByName(match[0]);
  });
});

watch(itemsJsonUrl, async (val) => {
  const forceDefaultColumns = !route.query["fields"];
  await changeJsonUrl(val, forceDefaultColumns);
});

watch(jsonInput, async (val) => {
  // return false;
  // const forceDefaultColumns = !route.query["fields"];
  const forceDefaultColumns = true;
  await changeJsonUrl("input", forceDefaultColumns);

  if (val) {
    // format json
    // store.$patch({jsonRaw: JSON.stringify(val, null, '  ')})
  }
});

watch(displayMode, (val) => {
  changeDisplayMode(val);
});

watch(filteredItems, (val, old) => {
  // can't use <v-client-table @limit due warning:
  // Extraneous non-emits event listeners (limit) were passed
  if (val.length > old.length) onLimitChange(old.length);
});

// TODO2: replace to pinia pub/sub
$listen("sort", (sort) => {
  dd.sort = sortStrToObj(sort);
  onTableLoaded();
});

function onSorted(sort) {
  dd.sort = sort;
  updateUrlQuery();
}

function onLimitChange(limit) {
  // when page loaded with filter, then remove filter, there is pagination by previous item count
  if (limit > 0 && limit < 1000 && tableRef.value) tableRef.value.setLimit(1000);
}

function onHideTable(val) {
  dd.hideTable = val;
}

function switchToFullMode(current = false) {
  dd.liteMode = !current;
  dd.jsonLoading = true;
  setTimeout(() => { dd.jsonLoading = false }, 500);
}

function buildXlsx() {
  return new Promise((resolve) => {
    dd.hideTableFilters = true;
    setTimeout(() => { // for header hide
      const table = tableRef.value.tablewrapper.querySelector(".VueTables__table");
      const wb = utils.table_to_book(table);
      dd.hideTableFilters = false;
      const ws = wb.Sheets[wb.SheetNames[0]];

      const lastCell = ws["!ref"].split(":")[1];
      const range = utils.decode_range("B1:" + lastCell);

      const cols = [];
      const widthLimit = 100;

      for (let r = 0; r <= range.e.r; r++) {
        // delete first col
        // 19.04.2023, now, unnecessary rows and columns hides before export
        // const firstAddr = utils.encode_cell({r:r, c:0});
        // delete(ws[firstAddr]);

        // count columns width
        for (let c = 0; c <= range.e.c; c++) {
          const addr = utils.encode_cell({ r: r, c: c });
          const length = Object.values(ws[addr].v).length + 2;
          if (!cols[c]) cols[c] = length;
          else cols[c] = Math.max(cols[c], length);
          if (cols[c] > widthLimit) cols[c] = widthLimit;
        }
      }

      ws["!cols"] = cols.map(length => {
        return { width: length };
      });
      ws["!autofilter"] = { ref: "B1:" + lastCell };

      return resolve(wb);
    }, 100);
  });
}

async function getXlsx() {
  const wb = await buildXlsx();
  const suffix = q.value ? "--" + q.value.replace(/&/g, ",") : "";
  const filename = `json-viewer${suffix}.xlsx`;
  writeFile(wb, filename, {});
}

// переключает поле в таблице по клику
function toggleField(field, add, updateQuery = false) {
  store.toggleField({ field, add });
  if (updateQuery) setTimeout(() => {
    updateUrlQuery(true);
  }, 50);
}

function isDefaultFields(columns) {
  const presets = columnPresets.value;
  const defaultColumns = presets.default ? presets.default.columns : false;
  if (!defaultColumns) return false;

  return arraysEqual(columns, defaultColumns);
}

// обновляет выбранные фильтры и колонки в урле
function updateUrlQuery(updateFields = false) {
  // disable on `scan` route
  if (route.name !== "index") return;

  // don't add default filter
  let query = {};
  if (q.value && q.value !== defaultFilter.value.q) {
    query.q = q.value;
  }

  if (updateFields) {
    if (columns.value.length === 0 || isDefaultFields(columns.value)) delete (query.fields);
    else query.fields = columns.value.join(",");
  } else {
    query.fields = route.query["fields"];
  }

  // don't add default json url
  if (itemsJsonUrl.value !== useRuntimeConfig().public.jsonUrl) {
    query.url = itemsJsonUrl.value;
  }

  if (dd.sort && dd.sort.column) {
    query.sort = dd.sort.column + (dd.sort.ascending ? "" : ",-");
  }

  // avoid unnecessary updates
  if (JSON.stringify(route.query) !== JSON.stringify(query)) {
    router.push({ query });
  }
}

function onTableLoaded() {
  if (!tableRef.value) return;
  if (dd.sort.column) {
    tableRef.value.setOrder(dd.sort.column, dd.sort.ascending);
    setTimeout(updateUrlQuery, 100);
  }
}

// включить поле по имени
function addFieldByName(name) {
  const field = availableFields.value.find(field => field.name === name);
  if (!field) return;
  toggleField(field, true);
}

// устанавливает поля по массиву имен, сбрасывает предыдущие выбранные поля
function setFields(columnNames) {
  const fields = [];
  columnNames = _.uniq(columnNames);
  for (let name of columnNames) {
    const field = availableFields.value.find(field => field.name === name);
    if (field) fields.push(field);
  }
  store.$patch({ fields: fields });

  // hack for correct table display just after open report and click "remove all columns"
  if (fields.length === 1) {
    store.$patch({ fields: [] });
    setTimeout(() => {
      store.$patch({ fields: fields });
      setTimeout(() => updateUrlQuery(true), 100);
    }, 50);
  }

  // updateUrlQuery();
}

// поставить из пресета полей
function setPreset(preset) {
  setFields(preset.columns);
  updateUrlQuery(true);
}

// выдает класс валидации по домену сайта и имени колонки
function getValidateFunc(str) {
  return store.getValidateFunc(str);
}

function ago(ms) {
  // seconds to ms
  if (new Date(ms).getFullYear() < 1971) {
    ms = ms * 1000;
  }
  const delta = (Date.now() - ms) / 1000;
  const mins = Math.floor(delta % 60);
  const hours = Math.floor(delta % 86400 / 3600);
  const days = Math.floor(delta / 86400);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours && days < 2) parts.push(`${hours}h`);
  if (mins && !days) parts.push(`${mins}m`);
  return parts.join(" ");
}

function arraysEqual(a, b) {
  return !!a && !!b && !(a < b || b < a);
}


function setDefaultFields() {
  // find default preset
  let defaultPreset;
  for (let i in columnPresets.value) {
    const preset = columnPresets.value[i];
    if (preset.default || preset.name === "default") {
      defaultPreset = preset;
      break;
    }
  }

  if (!defaultPreset) {
    // all fields
    defaultPreset = { columns: availableFields.value.map(f => f.name) };
  }

  let fields = [...defaultPreset.columns];

  // remove og:image on mobile
  if (window.screen.width < 640) {
    const index = fields.indexOf("og_image");
    if (index !== -1) fields.splice(index, 1);
  }

  // default if no fields
  if (fields.length === 0) {
    fields = defaultPreset.columns;
  }

  setFields(fields);
}

// exampleS: h1, h1,-
function sortStrToObj(str) {
  if (!str) return { column: false, ascending: true };

  const parts = str.split(",");
  if (parts.length === 1) parts.push("+");

  return {
    column: parts[0] || false,
    ascending: parts[1] !== "-",
  };
}

function fieldsInit() {
  // fields init
  if (route.query["fields"]) {
    setFields(route.query["fields"].split(","));
  } else {
    setDefaultFields();
  }

  // &sort=meta_client_value,-
  // TODO2: to better place
  if (route.query["sort"]) {
    dd.sort = sortStrToObj(route.query["sort"]);
  }
}

function buildJsonInfo(items) {
  return { items };
}

async function changeJsonUrl(itemsJsonUrl, forceDefaultColumns) {
  // data init
  dd.jsonLoadError = false;
  dd.jsonLoading = true;
  store.$patch({ filteredItems: [] });
  try {
    let itemsJson;
    if (itemsJsonUrl === "input") {
      // load input json
      itemsJson = jsonInput.value;
    } else {
      // load url json
      const res = await axios.get(itemsJsonUrl);
      itemsJson = res.data;
    }

    if (Array.isArray(itemsJson)) itemsJson = buildJsonInfo(itemsJson);
    store.$patch({ columnPresets: itemsJson.columns || {} });
    store.$patch({ filterPresets: itemsJson.filters || [] });
    store.setTests(itemsJson.fields || []);
    store.$patch({ scanOptions: itemsJson.scan || {} });
    store.setItems(itemsJson.items || []);
    dd.reportName = itemsJson.name || "";
    dd.liteMode = filteredItems.value.length >= liteModeFrom.value;

    // favicon
    if (itemsJson.favicon) {
      store.$patch({favicon: itemsJson.favicon});
    }

    if (itemsJson.date) {
      dd.date = itemsJson.date;
    }

    // defaultSort
    if (itemsJson.defaultSort && !route.query["sort"]) {
      dd.sort = itemsJson.defaultSort;
    }

    // open details when single row
    if (itemsLength.value === 1) {
      const row = filteredItems.value[0];
      setTimeout(() => {
        rowClick({ row });
      }, 1000);
    }

    // filter
    if (defaultFilter.value?.q && !route.query["q"]) {
      route.query["q"] = defaultFilter.value.q;
    }

    // q
    store.setQ(route.query["q"]);

    // columns
    if (forceDefaultColumns) {
      setDefaultFields();
      updateUrlQuery(true);
    }

    dd.jsonLoadError = false;
    dd.jsonLoading = false;
  } catch (e) {
    dd.jsonLoadError = true;
    dd.jsonLoading = false;
    console.error(e);
  }
}

function changeDisplayMode(val) {
  if (val === "view") openedPanels.value = [];
  if (val === "edit") openedPanels.value = ["columns", "filter_presets", "stats"];
}

function enableNavigation() {
  store.$patch({ flags: { ...store.flags, ...{ navigation: true } } });
}

function openFilterPanelIfNeed() {
  if (!openedPanels.value.includes("filter_presets")) openedPanels.value.push("filter_presets");
}

function rowClick(event) {
  tableRef.value.toggleChildRow(event.row.id);
}

function startIntroTour() {
  displayMode.value = "edit";
  // $tours['introTour'].start();
  console.error("todo tours");
}

onMounted(async () => {
  // add visit
  store.$patch({ visitCount: store.visitCount + 1 });

  // set webhook
  if (route.query.url) {
    store.setItemsJsonUrl({ url: route.query.url });
  }

  await changeJsonUrl(itemsJsonUrl.value, false);
  fieldsInit();

  // changeDisplayMode(displayMode.value);
  if (q.value) openFilterPanelIfNeed(); // after displayMode
  updateUrlQuery(true);
});

useHead({
  title: pageTitle,
  titleTemplate: "%s - json-viewer",
  link: [{
    hid: "icon",
    rel: "icon",
    type: "image/x-icon",
    href: store.favicon,
  }],
});
</script>
