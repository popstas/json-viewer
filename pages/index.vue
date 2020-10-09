<template>
  <section class="container" :class="[ `mode-${displayMode}`]">
    <v-tour name="introTour" :steps="introTourSteps" :options="{ highlight: true }"></v-tour>

    <header>
      <el-button
        class="help-tour-button"
        :plain="!isNewUser"
        :type="isNewUser ? 'primary' : ''" @click="startIntroTour"
        :size="isNewUser ? '' : 'mini'"
      >Help tour</el-button>

      <el-radio-group class="display-mode-switch" v-model="displayMode" size="mini">
        <el-radio-button label="view">view</el-radio-button>
        <el-radio-button label="edit">edit</el-radio-button>
      </el-radio-group>

      <ReportHistory></ReportHistory>

      <div class="total">total: {{ filteredItems.length }}</div>
    </header>
    <br>

    <div v-if="jsonLoadError">
      <div class="msg danger">Failed to load {{ itemsJsonUrl}}</div>
    </div>
    <div v-if="jsonLoading">Loading...</div>
    <div v-if="!jsonLoading && !jsonLoadError">
      <el-collapse v-model="openedPanels" class="panels">

        <!-- Тулбар -->
        <el-collapse-item title="columns explorer" name="columns">
          <Toolbar @toggleField="toggleField" @setFields="setFields"></Toolbar>
        </el-collapse-item>

        <!-- Фильтры -->
        <el-collapse-item title="filters" name="filter_presets">
          <div class="filter-presets">
            <FilterPresetButton
              :preset="preset"
              v-for="preset in filterPresets"
              :key="preset.name"
              toggle
            ></FilterPresetButton>
          </div>

          <QueryInput class="filter__query"></QueryInput>
        </el-collapse-item>

        <!-- Наборы колонок -->
        <el-collapse-item title="column presets" name="column_presets">
          <div class="column-presets">
            <ColumnPresetButton
              :preset="preset"
              @click="setPreset(preset);"
              v-for="preset in columnPresets"
              :key="preset.name"
            ></ColumnPresetButton>
          </div>
        </el-collapse-item>

        <!-- Сводка по таблице -->
        <el-collapse-item title="filtered stats" name="stats">
          <Stats></Stats>
        </el-collapse-item>

        <!-- Выбранные колонки -->
        <el-collapse-item class="current-columns" title="current columns" name="current_columns">
          <ColumnField
            :field="field"
            :checked="$store.getters.fieldExists(field)"
            @click="toggleField(field)"
            :class="{ 'available-fields__field': true, active: $store.getters.fieldExists(field) }"
            v-for="field of fieldsWithoutComments"
            :key="field.name"
          ></ColumnField>
        </el-collapse-item>

      </el-collapse>

      <div><br>
        total: {{ filteredItems.length }}
      </div>

      <div class="table-actions">
        <el-checkbox class="human-columns-switch" v-model="showHumanColumns">
          Human column names
        </el-checkbox>

        <button class="btn btn-excel" @click="getXlsx">
          <icon name="file-excel"></icon> xlsx
        </button>
      </div>

      <v-client-table
        v-if="filteredItems.length > 0"
        :columns="columns"
        :data="filteredItems"
        :options="tableOptions"
        @row-click="rowClick"
        @sorted="updateUrlQuery"
        ref="table"
      >
        <template slot="child_row" slot-scope="props">
          <ItemDetails :item="$store.getters.getItemByDefaultField(props.row[$store.state.defaultField])"></ItemDetails>
        </template>

        <!-- для каждой колонки создается слот, который получает класс и значение через функции, медленно -->
        <div
          v-for="colName in columns /*['url', 'domain_idn', 'favicon', 'updated_time']*/"
          :key="colName"
          :slot="colName"
          slot-scope="props"
          v-html="getColumnValue(props.row, colName)"
        ></div>
      </v-client-table>
    </div>
  </section>
</template>

<style lang="scss" src="./index.scss"></style>

<script>
import Toolbar from "~/components/Toolbar";
import ColumnField from "~/components/ColumnField";
import QueryInput from "~/components/QueryInput";
import ColumnPresetButton from "~/components/ColumnPresetButton";
import FilterPresetButton from "~/components/FilterPresetButton";
import ItemDetails from "~/components/ItemDetails";
import Stats from "~/components/Stats";
import ReportHistory from "~/components/ReportHistory";
import "vue-awesome/icons/file-excel";
import _ from "lodash";
// import { XlsxWorkbook, XlsxSheet, XlsxDownload } from "../../dist/vue-xlsx.es.js"
import XLSX from "xlsx";

export default {
  components: {
    Toolbar,
    ItemDetails,
    QueryInput,
    Stats,
    ReportHistory,
    ColumnField,
    ColumnPresetButton,
    FilterPresetButton,
  },
  data() {
    return {
      routerProcess: false,
      tests: this.$store.state.tests,
      jsonLoadError: false,
      jsonLoading: true,
      openedPanels: [],
      sort: {},
      introTourSteps: [ // tolang
        {
          target: '.report-history',
          header: {
            title: 'Get Started',
          },
          content: `Current loaded report's JSON file, history of last reports. Sort by name, added date or used date`,
          params: {
            placement: 'top' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
          },
          offset: -150,
        },
        {
          target: '.column-presets__button_expand-all',
          content: `Show all fields list.`,
          offset: -100,
        },
        {
          target: '.column-presets__button_show-all',
          content: `Add all fields to table (or remove).`,
          offset: -200,
        },
        {
          target: '.field-add-input',
          content: `Search field by name and add to table.`,
          offset: -200,
        },
        {
          target: '.filter__query',
          content: `Query filter, with autocomplete, regexp, and/or conditionals.`,
          offset: -200,
        },
        {
          target: '.filter-presets',
          content: `Use filters to quick get needed data.`,
          offset: -200,
        },
        {
          target: '.column-presets',
          content: `Use column presets for get scoped columns.`,
          offset: -200,
        },
        {
          target: '.table-stats',
          content: `Stats by filtered rows: average, non-unique, enum values.`,
          offset: -200,
        },
        {
          target: '.current-columns',
          content: `Quick remove current table columns.`,
          offset: -200,
        },
        {
          target: '.VueTables__search-field',
          content: `Search by main column`,
          offset: -200,
        },
        {
          target: '.VueTables__row ',
          content: `Click to row for open item details `,
          offset: -200,
        },
      ]
    };
  },

  computed: {
    q() {
      return this.$store.state.q;
    },

    itemsJsonUrl() {
      return this.$store.state.itemsJsonUrl;
    },

    fields() {
      return this.$store.state.fields;
    },

    availableFields() {
      return this.$store.state.availableFields;
    },

    filteredItems() {
      return this.$store.state.filteredItems;
    },

    filterPresets() {
      return this.$store.state.filterPresets;
    },

    columnPresets() {
      return this.$store.state.columnPresets;
    },

    displayMode: {
      get() {
        return this.$store.state.displayMode;
      },
      set(val) {
        this.$store.commit('displayMode', val);
      }
    },

    showHumanColumns: {
      get() {
        return this.$store.state.showHumanColumns;
      },
      set(val) {
        this.$store.commit('showHumanColumns', val);
      }
    },

    fieldsWithoutComments() {
      return this.$store.state.fields.map(f => {
        f = {...f};
        delete (f.comment);
        return f;
      });
    },

    tableOptions() {
      // console.log("this.filteredItems: ", this.filteredItems);

      const columnsClasses = {};
      for (let columnName of this.columns) {
        columnsClasses[columnName] = 'col-' + columnName;
      }
      // console.log('columnsClasses: ', columnsClasses);

      const cellClasses = {};
      const classMap = {
        warning: 'warning',
        error: 'danger'
      };
      for (let columnName of this.columns) {
        const field = this.fields.find(f => f.name == columnName);
        if (!field) continue;
        const rules = [];

        // default class
        rules.push({
          class: 'cell',
          condition: () => true
        });

        // default column (sticky)
        if (field.default) {
          rules.push({
            class: 'col-default',
            condition: () => true
          });
        }

        // align
        if (field.align) {
          rules.push({
            class: 'align-' + field.align,
            condition: () => true
          });
        }
        else {
          // align left for text
          if (field.type === 'string') {
            rules.push({
              class: 'align-left',
              condition: () => true
            });
          }

          // align center for numbers
          if (['integer', 'boolean', 'time'].includes(field.type)) {
            rules.push({
              class: 'align-center',
              condition: () => true
            });
          }
        }

        // validate
        if (field.validate) {
          let validateRules = field.validate;

          // fix validateRules: ignore legacy object rules
          for (let errType of ['success', 'warning', 'error']) {
            if (validateRules[errType] && typeof validateRules[errType] !== 'string') {
              console.log(`${columnName}: only strings should be in field.validate.${errType}, given: `, validateRules[errType]);
              delete(validateRules[errType]);
            }
          }

          // for debug
          /*if (columnName == 'status'){
            validateRules = {
              error: '!= 200'
            };
            console.log()
          }*/

          // warning
          for (let errType of ['warning', 'error']) {
            if (!validateRules[errType]) continue;
            rules.push({
              class: classMap[errType],
              condition: row => {
                const val = row[columnName];
                const func = this.getValidateFunc(validateRules[errType]);

                // for debug
                /*if(columnName == 'status') {
                  console.log('errType: ', errType);
                  console.log('rules: ', validateRules[errType]);
                  console.log('val: ', val);
                  console.log('valid: ', func(val));
                  console.log('');
                }*/

                return func(val);
              }
            });
          }

          // success
          if (validateRules.warning || validateRules.error) {
            rules.push({
              class: 'success',
              condition: row => {
                const val = row[columnName];
                const isSuccess =
                  !this.getValidateFunc(validateRules.warning)(val) &&
                  !this.getValidateFunc(validateRules.error)(val) &&
                  !['', NaN, null, undefined].includes(val);

                  // console.log('errType: ', 'success');
                  // console.log('val: ', val);
                  // console.log('valid: ', isSuccess);
                  // console.log('');
                return isSuccess;
              }
            });
          }
        }

        cellClasses[columnName] = rules;
      }
      // console.log('cellClasses: ', cellClasses);

      return {
        headings: this.headings,
        headingsTooltips: this.headingsTooltips,
        filterable: [this.$store.state.defaultField],
        cellClasses: cellClasses,
        columnsClasses: columnsClasses,
        perPage: Math.min(1000, this.filteredItems.length),
        perPageValues: [50, 100, 250, 500, 1000, 5000],
        // columnsDropdown: true,
        rowClassCallback(row) {
          if (row.error) return "danger";
          // return 'success';
        },
        templates: {
          /* 'files_size'(h, row, index) { // работал, но перестал вызываться после убирания item.item_info
            console.log('row: ', row);
            if (!row.files_size) return '';
            return Math.round(row.files_size / 1024) || '';
          } */
        }
      };
    },

    columns() {
      return this.fields.map(field => field.name);
    },

    // заголовки колонок таблиц
    headings() {
      let h = {};
      this.fields.forEach(field => {
        if (this.showHumanColumns) {
          h[field.name] = field.comment || field.title.split("_").join(" ") || field.name;
        } else {
          h[field.name] = field.title.split("_").join(" ") || field.name;
        }
      });
      return h;
    },

    // подсказки к колонкам
    headingsTooltips() {
      let h = {};
      this.fields.forEach(field => {
        h[field.name] = field.name
          + (field.comment ? `\n\n${field.comment}` : '')
          + (field.description ? `\n\n${field.description}` : '');
      });
      return h;
    },

    pageTitle() {
      let title = ["site-audit-seo"];
      if (this.q) title.push("q: " + this.q);
      if (this.fields.length > 0) title.push("fields: " + this.columns);
      return title.join(", ");
    },

    isNewUser() {
      return this.$store.state.visitCount < this.$store.state.newUserVisits;
    },
  },

  watch: {
    q() {
      this.updateUrlQuery();

      // добавление колонок, которые есть в фильтре
      const parts = this.q.split("&");
      parts.forEach(part => {
        const match = part.match(/^[a-zA-Z0-9_]+/);
        if (match) this.addFieldByName(match[0]);
      });
    },

    async itemsJsonUrl() {
      await this.changeJsonUrl(this.itemsJsonUrl, true);
    },

    displayMode(val) {
      if (val == 'view') this.openedPanels = [];
      if (val == 'edit') this.openedPanels = ['columns', 'filter_presets', 'column_presets', 'stats'];
    }
  },

  methods: {
    formatExcelCols(json) {
      let widthArr = Object.keys(json[0]).map(key => {
        return { width: key.length + 2 }; // plus 2 to account for short object keys
      });
      for (let i = 0; i < json.length; i++) {
        let value = Object.values(json[i]);
        for (let j = 0; j < value.length; j++) {
          if (value[j] !== null && widthArr[j] !== undefined && value[j].length > widthArr[j].width) {
            widthArr[j].width = value[j].length;
          }
        }
      }
      return widthArr;
    },

    buildXlsx() {
      const table = this.$el.querySelector(".VueTables__table");
      const wb = XLSX.utils.table_to_book(table);
      const ws = wb.Sheets[wb.SheetNames[0]];

      const lastCell = ws['!ref'].split(':')[1];
      const range = XLSX.utils.decode_range('B1:'+lastCell);

      const cols = [1];

      for(let r = 0; r <= range.e.r; r++){
        // delete first col
        const firstAddr = XLSX.utils.encode_cell({r:r, c:0});
        delete(ws[firstAddr]);

        // count columns width
        for(let c = 1; c <= range.e.c; c++) {
          const addr = XLSX.utils.encode_cell({r:r, c:c});
          const length = Object.values(ws[addr].v).length + 2;
          if(!cols[c]) cols[c] = length;
          else cols[c] = Math.max(cols[c], length);
        }
      }
      const colsObj = cols.map(length => { return {width: length} });

      ws['!cols'] = colsObj;
      ws['!autofilter'] = { ref: 'B1:'+lastCell };

      // console.log('wb: ', wb);
      return wb;
    },

    getXlsx() {
      const wb = this.buildXlsx();
      const suffix = this.q ? "--" + this.q.replace(/&/g, ",") : "";
      const filename = `site-audit-seo${suffix}.xlsx`;
      XLSX.writeFile(wb, filename, {});
    },

    // переключает поле в таблице по клику
    toggleField(field, add) {
      this.$store.dispatch("toggleField", { field, add });
      this.updateUrlQuery();
    },

    // обновляет выбранные фильтры и колонки в урле
    updateUrlQuery() {
      if (this.routerProcess) return;
      this.routerProcess = true;
      setTimeout(() => {
        this.routerProcess = false;
      }, 100);

      let query = {};
      if (this.q) query.q = this.q;
      query.fields = this.columns.join(",");

      query.url = this.itemsJsonUrl;

      let order = { column: false, ascending: true };
      if (this.$refs.table && this.$refs.table.orderBy.column) {
        order = this.$refs.table.orderBy;
        this.sort = this.$refs.table.orderBy;
      }
      if (!order.column && this.sort.column) {
        order = this.sort;
      }

      if (order && order.column) {
        query.sort = order.column + (order.ascending ? '' : ',-');
      }

      this.$router.push({ query });
    },

    onTableLoaded() {
      if (this.$refs.table && this.sort.column) {
        this.$refs.table.setOrder(this.sort.column, this.sort.ascending);
        setTimeout(this.updateUrlQuery, 100);
      }
    },

    // переключить поле по имени
    toggleFieldByName(name) {
      const field = this.availableFields.find(field => field.name == name);
      this.toggleField(field);
    },

    // включить поле по имени
    addFieldByName(name) {
      const field = this.availableFields.find(field => field.name == name);
      if (!field) return;
      this.toggleField(field, true);
    },

    // устанавливает поля по массиву имен, сбрасывает предыдущие выбранные поля
    setFields(columnNames) {
      const fields = [];
      // console.log('fields: ', fields);
      columnNames = _.uniq(columnNames);
      for(let name of columnNames) {
        const field = this.availableFields.find(field => field.name == name);
        if (field) fields.push(field);
      }
      // console.log('fields: ', fields);
      this.$store.commit("fields", fields);
      this.updateUrlQuery();
    },

    // поставить из пресета полей
    setPreset(preset) {
      this.setFields(preset.columns);
    },

    // индекс поля в массиве по объекту
    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return field && column.name == field.name;
      });
    },

    // выдает класс валидации по домену сайта и имени колонки
    getValidateFunc(str) {
      return this.$store.getters.getValidateFunc(str);
    },

    // обёртка над шаблоном колонки
    getColumnValue(row, colName) {
      // достает значение colName из row, со вложенностью
      // https://stackoverflow.com/a/6394168/1716010
      let valueText = colName.split(".").reduce((o, i) => (o ? o[i] : ""), row);
      if (['', undefined, null].includes(valueText)) return valueText; // только null видел

      const field = this.fields.find(f => f.name == colName); // TODO: without find

      // шаблоны полей задаются здесь

      if (field.type === 'integer' && valueText) {
        valueText = new Intl.NumberFormat().format(valueText);
      }

      if (field.type === 'timestamp' && valueText) {
        const offset = new Date().getTimezoneOffset() * 60000;
        valueText = new Date(valueText * 1000 - offset).toISOString();
        valueText = valueText.replace('T', ' ').replace(/\..*/, '')
      }

      if (colName.match(/url/i)) {
        valueText = `<a href="${valueText}" target="_blank">${valueText}</a>`;
      }

      if (colName === "favicon") {
        valueText = valueText.replace(/^\//, row.url);
        // console.log('valueText: ', valueText);
        valueText = `<img style="width:16px;height:16px" src="${valueText}"/>`;
      }

      if (colName === "domain_idn") {
        let icon = row.favicon ? row.favicon.replace(/^\//, row.url) : "";
        icon = icon ? `<img style="width:16px;height:16px" src="${icon}"/>` : '';
        valueText = `<a href="${row.url}" target="_blank">${icon} ${valueText}</a>`;
        if (row.ssh_command){
          const href = 'ssh://' + row.ssh_command.replace('ssh ', '');
          valueText += `<a href="${href}" class="ssh-link float-right" title="Open SSH">ssh</a>`;
        }
      }

      // show images as images
      if (typeof valueText === 'string' && (field.type === 'image' || valueText.match(/^http.*\.(jpg|jpeg|png|gif)$/)) && valueText) {
        valueText = `<img alt="error loading image" style="width: 150px; height: auto;" src="${valueText}" title="${valueText}"/>`;
      }

      if (field.type === 'boolean') {
        valueText = parseInt(valueText) ? "yes" : "no"; // tolang
      }

      return valueText;
    },

    setDefaultFields() {
      let fields = [];
      for (let i in this.$store.state.columnPresets) {
        const preset = this.$store.state.columnPresets[i];
        if (preset.default) {
          fields = preset.columns;
          break;
        }
      }
      if (fields.length === 0 && this.$store.state.columnPresets.default) {
        fields = this.$store.state.columnPresets.default.columns;
      }

      this.setFields(fields);
    },

    fieldsInit() {
      // fields init
      if (this.$route.query["fields"]) {
        this.setFields(this.$route.query["fields"].split(","));
      } else {
        this.setDefaultFields();
      }

      // &sort=meta_client_value,-
      if (this.$route.query["sort"]) {
        const parts = this.$route.query["sort"].split(",");
        if (parts.length == 1) parts.push('+');
        this.sort = {
          column: parts[0],
          ascending: parts[1] != '-'
        }
        this.onTableLoaded();
      }
    },

    async changeJsonUrl(itemsJsonUrl, forceDefaultColumns) {
      // data init
      this.jsonLoadError = false;
      this.jsonLoading = true;
      this.$store.commit('filteredItems', []);
      try {
        const itemsJson = await this.$axios.$get(itemsJsonUrl);
        // console.log('itemsJson.items: ', itemsJson.items);
        // console.log('itemsJson.fields: ', itemsJson.fields);
        this.$store.commit("columnPresets", itemsJson.columns);
        this.$store.commit("filterPresets", itemsJson.filters);
        this.$store.commit("tests", itemsJson.fields);
        this.$store.dispatch("items", itemsJson.items);
        this.$store.dispatch("q", this.$route.query["q"]);

        if (forceDefaultColumns) {
          this.setDefaultFields();
        }

        this.jsonLoadError = false;
        this.jsonLoading = false;
      } catch(e) {
        this.jsonLoadError = true;
        this.jsonLoading = false;
        // console.log('e: ', e);
      }
    },

    rowClick(event) {
      this.$refs.table.toggleChildRow(event.row.id);
    },

    startIntroTour() {
      this.displayMode = 'edit';
      this.$tours['introTour'].start();
    }
  },

  async mounted() {
    // add visit
    this.$store.commit('visitCount', this.$store.state.visitCount + 1);

    // set webhook
    if (this.$route.query.url) {
      this.$store.commit('itemsJsonUrl', this.$route.query.url);
    }

    await this.changeJsonUrl(this.itemsJsonUrl, false);
    this.fieldsInit();

    // router change event
    this.$router.afterEach((to, from) => {
      if (!this.routerProcess) {
        if (this.$route.query["q"]) {
          this.$store.dispatch("q", this.$route.query["q"]);
        } else this.$store.dispatch("q", "");

        this.fieldsInit();
      }
    });
  },

  head() {
    return {
      title: this.pageTitle
    };
  }
};
</script>
