<template>
  <section class="container" :class="['report-page', `mode-${displayMode}`]">
    <div v-if="!itemsJsonUrl">
      No reports<br><br>
      <NuxtLink class="el-button el-button--primary" to="/scan">Scan</NuxtLink>
    </div>

    <div v-else>
      <v-tour v-if="$store.state.flags.tour" name="introTour" :steps="introTourSteps" :options="{ highlight: true }"></v-tour>

      <el-button class="advanced-button" @click="$store.commit('flags', {navigation: true})" v-if="!$store.state.flags.navigation">...</el-button>

      <header v-if="$store.state.flags.navigation">
        <el-button
          v-if="$store.state.flags.tour"
          class="help-tour-button"
          :plain="!isNewUser"
          :type="isNewUser ? 'primary' : ''" @click="startIntroTour"
          :size="isNewUser ? '' : 'mini'"
        >Help tour</el-button>

        <el-switch class="display-mode-switch"
          v-model="isEditMode"
          active-text="edit"
          inactive-text="view"
        >
        </el-switch>

        <ReportHistory></ReportHistory>

        <div class="total">total: {{ filteredItems.length }}</div>
      </header>

      <div v-if="jsonLoadError">
        <div class="msg danger">Failed to load {{ itemsJsonUrl}}</div>
      </div>
      <div v-if="jsonLoading"><i class="el-icon-loading"></i> Loading...</div>

      <div v-if="!jsonLoading && !jsonLoadError">
        <el-collapse v-if="$store.state.flags.navigation" v-model="openedPanels" class="panels">

          <!-- Тулбар -->
          <Panel title="columns explorer" icon="el-icon-folder-opened" name="columns">
            <Toolbar @toggleField="toggleField" @setFields="setFields"></Toolbar>
          </Panel>

          <!-- Выбранные колонки -->
          <!-- <Panel title="current columns" icon="el-icon-caret-right" name="current_columns" class="current-columns">
            <ColumnField
              :field="field"
              :checked="$store.getters.fieldExists(field)"
              @click="toggleField(field, false, true)"
              :class="{ 'available-fields__field': true, active: $store.getters.fieldExists(field) }"
              v-for="field of fields"
              :key="field.name"
            ></ColumnField>
          </Panel> -->

          <!-- Сводка по таблице -->
          <Panel title="filtered stats" icon="el-icon-s-data" name="stats">
            <Stats></Stats>
          </Panel>

          <Panel title="presets" icon="el-icon-menu" name="filter_presets">

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

        <div v-if="$store.state.flags.navigation"><br>
          <div>total: {{ filteredItems.length }}</div>
          <div v-if="date">updated: {{ new Date(date).toLocaleString() }}</div>
        </div>

        <div class="table-actions" v-if="$store.state.flags.navigation">
          <el-checkbox class="human-columns-switch" v-model="showHumanColumns">
            Human column names
          </el-checkbox>

          <button class="btn btn-excel" @click="getXlsx">
            <icon name="file-excel"></icon> xlsx
          </button>
        </div>

        <v-client-table
          :class="{ 'table_without-header': hideTable }"
          v-if="filteredItems.length > 0 && fields.length > 0"
          :columns="columns"
          :data="filteredItems"
          :options="tableOptions"
          @sorted="updateUrlQuery"
          ref="table"
        >
        <!-- @row-click="rowClick" -->
          <template v-slot:child_row="props" v-if="!hideTableFilters">
            <ItemDetails v-if="!hideTableFilters" @hideTable="onHideTable" :item="$store.getters.getItemByDefaultField(props.row[$store.state.defaultField])"></ItemDetails>
          </template>

          <template slot="prependHead">
            <tr v-if="$store.state.flags.navigation && !hideTableFilters" class="table__column-controls">
              <td v-if="!hideTableFilters"></td>
              <td v-for="field in fields" :key="field.name">
                <ColumnField
                  :field="field"
                  :checked="$store.getters.fieldExists(field)"
                  @click="toggleField(field, false, true)"
                  :class="{ 'available-fields__field': true, active: $store.getters.fieldExists(field) }"
                ></ColumnField>
              </td>
            </tr>
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
import Panel from "~/components/Panel";
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
    Panel,
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
      hideTable: false,
      reportName: '',
      favicon: process.env.FAVICON || '/favicon.ico',
      date: false,
      hideTableFilters: false, // for buildXlsx
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

    itemsLength() {
      return this.$store.state.items.length;
    },

    filteredItems() {
      return this.$store.state.filteredItems;
    },

    filterPresets() {
      return this.$store.state.filterPresets;
    },

    defaultFilter() {
      return this.filterPresets.find(filter => filter.default) || {};
    },

    columnPresets() {
      return this.$store.state.columnPresets;
    },

    introTourSteps() {
      let i = 1;
      let total = this.$store.state.introTourSteps.length;

      return this.$store.state.introTourSteps.map(step => {
        step.header = { title: `${i} / ${total}` };
        i++;
        return step;
      });
    },

    displayMode: {
      get() {
        return this.$store.state.displayMode;
      },
      set(val) {
        this.$store.commit('displayMode', val);
      }
    },

    isEditMode: {
      get() {
        return this.$store.state.displayMode === 'edit';
      },
      set(val) {
        this.displayMode = val ? 'edit' : 'view';
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
        error: 'danger',
        success: 'success',
        accent: 'accent',
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
          if (['string', 'email', 'domain'].includes(field.type)) {
            rules.push({
              class: 'align-left',
              condition: () => true
            });
          }

          // align center for numbers
          if (['integer', 'number', 'boolean', 'time'].includes(field.type)) {
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
          for (let errType of ['success', 'warning', 'error', 'accent']) {
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
          for (let errType of ['warning', 'error', 'success', 'accent']) {
            if (!validateRules[errType]) continue;
            rules.push({
              class: classMap[errType],
              condition: row => {
                // const val = row[columnName];
                const res = validateRules[errType].match(/^([A-Za-z0-9_]*)\s*(===|==|!==|!=|>|>=|<|<=)\s*(.*)$/);
                const valueColumn = res ? res[1] : columnName;
                const validateVal = row[valueColumn];
                const func = this.getValidateFunc(validateRules[errType]);

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
              }
            });
          }

          // success
          //  && (!validateRules['value_from'] || validateRules.success)  // TODO: убрать отсюда value_from, это костыль для одного случая
          if ((validateRules.warning || validateRules.error) && !validateRules.success) {
            rules.push({
              class: 'success',
              condition: row => {
                // const val = row[columnName];
                const validateVal = field.validate_from ? row[field.validate_from] : row[columnName];
                const isSuccess =
                  !this.getValidateFunc(validateRules.warning)(validateVal) &&
                  !this.getValidateFunc(validateRules.error)(validateVal) &&
                  !['', NaN, null, undefined].includes(validateVal);

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

      const options = {
        headings: this.headings,
        headingsTooltips: this.headingsTooltips,
        filterable: this.hideTableFilters ? false : this.filterableColumns,
        cellClasses: cellClasses,
        columnsClasses: columnsClasses,
        perPage: Math.min(1000, this.filteredItems.length),
        perPageValues: [50, 100, 250, 500, 1000, 5000],
        texts: {
          defaultOption: '',
          filterBy: '',
        },
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

      // column filters
      if (this.fields.length > 0 && Object.entries(this.listColumns).length > 0) {
        options.filterByColumn = true;
        options.listColumns = this.listColumns;
      }

      // customers, array valued field
      // TODO: to field config
      /*options.filterAlgorithm = {
        customers(row, query) {
          return row.customers.includes(query);
        }
      }*/

      // console.log("options.filterable:", options.filterable);
      // console.log("options:", options);
      return options;
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

    filterableColumns() {
      const list = [this.$store.state.defaultField];
      // console.log("this.fields:", this.fields);
      for (const field of this.fields) {
        // console.log("field.name:", field.name);
        // console.log("field.filterType:", field.filterType);
        // console.log("field.filterType && !list.includes(field.name):", field.filterType && !list.includes(field.name));
        if (field.filterType && !list.includes(field.name)) list.push(field.name);
      }
      // console.log("list:", list);
      return list;
    },

    // фильтры к колонкам
    listColumns() {
      let cols = {};
      this.fields.forEach(field => {
        if (!field.filterType) return;

        if (field.type == 'boolean') {
          cols[field.name] = [
            {
              id: 0,
              text: 'No', // tolang
            },
            {
              id: 1,
              text: 'Yes',
            },
          ]
        }

        if (field.filterType == 'string') {
          // text filter by default
        }

        if (field.filterType == 'enum') {
          const vals = {};
          for (let item of this.filteredItems) {
            if (Array.isArray(item[field.name])) {
              for (let val of item[field.name]) {
                if (vals[val]) vals[val] += 1;
                else vals[val] = 1;
              }
            } else {
              const iVal = item[field.name];
              if ([null, undefined, ''].includes(iVal)) continue;

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

      // console.log('cols: ', cols);
      return cols;
    },

    pageTitle() {
      let title = [];

      if (this.reportName) title.push(this.reportName);

      const reportName = this.$store.getters.shortReportUrl(this.itemsJsonUrl);
      title.push(reportName);

      if (this.q) title.push("q: " + this.q);

      /* if (this.fields.length > 0 && !this.isDefaultFields(this.columns)) {
        title.push("Fields: " + this.columns);
      } */

      title.push('Results - ' + this.$store.state.name);
      return title.join(" - ");
    },

    isNewUser() {
      return this.$store.state.visitCount < this.$store.state.newUserVisits;
    },

    jsonInput() {
      try {
        return JSON.parse(this.$store.state.jsonRaw);
      } catch (e) {
        return false;
      }
    },
  },
  // end of computed

  watch: {
    q(q) {
      // console.log('watch q');
      this.updateUrlQuery(false);
      if (q) this.openFilterPanelIfNeed();

      // добавление колонок, которые есть в фильтре
      const parts = this.q.split("&");
      parts.forEach(part => {
        const match = part.match(/^[a-zA-Z0-9_]+/);
        if (match) this.addFieldByName(match[0]);
      });
    },

    async itemsJsonUrl() {
      const forceDefaultColumns = !this.$route.query["fields"];
      await this.changeJsonUrl(this.itemsJsonUrl, forceDefaultColumns);
    },

    async jsonInput(val) {
      // return false;
      // const forceDefaultColumns = !this.$route.query["fields"];
      const forceDefaultColumns = true;
      await this.changeJsonUrl('input', forceDefaultColumns);

      if (val) {
        // format json
        // this.$store.commit('jsonRaw', JSON.stringify(val, null, '  '))
      }
    },

    displayMode(val) {
      this.changeDisplayMode(val);
    }
  },

  methods: {

    onHideTable(val) {
      this.hideTable = val
    },

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
      return new Promise((resolve, reject) => {
        this.hideTableFilters = true;
        setTimeout(() => { // for header hide
          const table = this.$el.querySelector('.VueTables__table');
          const wb = XLSX.utils.table_to_book(table);
          this.hideTableFilters = false;
          const ws = wb.Sheets[wb.SheetNames[0]];

          const lastCell = ws['!ref'].split(':')[1];
          const range = XLSX.utils.decode_range('B1:'+lastCell);

          const cols = [];
          const widthLimit = 100;

          for(let r = 0; r <= range.e.r; r++){
            // delete first col
            // 19.04.2023, now, unnecessary rows and columns hides before export
            // const firstAddr = XLSX.utils.encode_cell({r:r, c:0});
            // delete(ws[firstAddr]);

            // count columns width
            for(let c = 0; c <= range.e.c; c++) {
              const addr = XLSX.utils.encode_cell({r:r, c:c});
              const length = Object.values(ws[addr].v).length + 2;
              if(!cols[c]) cols[c] = length;
              else cols[c] = Math.max(cols[c], length);
              if(cols[c] > widthLimit) cols[c] = widthLimit;
            }
          }
          const colsObj = cols.map(length => { return {width: length} });

          ws['!cols'] = colsObj;
          ws['!autofilter'] = { ref: 'B1:'+lastCell };

          // console.log('wb: ', wb);
          return resolve(wb);
        }, 100);
      });
    },

    async getXlsx() {
      const wb = await this.buildXlsx();
      const suffix = this.q ? "--" + this.q.replace(/&/g, ",") : "";
      const filename = `json-viewer${suffix}.xlsx`;
      XLSX.writeFile(wb, filename, {});
    },

    // переключает поле в таблице по клику
    toggleField(field, add, updateQuery = false) {
      this.$store.dispatch("toggleField", { field, add });
      if (updateQuery) this.updateUrlQuery(true);
    },

    // обновляет выбранные фильтры и колонки в урле
    updateUrlQuery(updateFields = false) {
      // console.log('updateFields: ', updateFields);
      // console.log('this.columns: ', this.columns);
      if (this.routerProcess) return;
      this.routerProcess = true;
      setTimeout(() => {
        this.routerProcess = false;
      }, 100);

      // disable on `scan` route
      if ($nuxt.$route.name !== 'index') return;

      // don't add default filter
      let query = {};
      if (this.q && this.q !== this.defaultFilter.q){
        query.q = this.q;
      }

      if (updateFields) {
        const isDefaultFields = this.isDefaultFields(this.columns);
        // console.log('isDefaultFields: ', isDefaultFields);
        if (isDefaultFields) delete(query.fields);
        else query.fields = this.columns.join(",");
      }
      else {
        query.fields = this.$route.query["fields"];
      }

      // don't add default json url
      if (this.itemsJsonUrl !== process.env.JSON_URL) {
        query.url = this.itemsJsonUrl;
      }

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

      // console.log('route index: updateUrlQuery:', query);
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
      // this.updateUrlQuery();
    },

    // поставить из пресета полей
    setPreset(preset) {
      // console.log('setPreset: ', preset);
      this.setFields(preset.columns);

      // const isDefaultPreset = preset.name === 'default';
      this.updateUrlQuery(true);
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

    ago(ms) {
      // seconds to ms
      if (new Date(ms).getFullYear() < 1971) {
        ms = ms * 1000;
      }

      // console.log('ms: ', ms);
      // console.log('new Date(ms): ', new Date(ms));
      const delta = (Date.now() - ms) / 1000;
      const mins = Math.floor(delta % 60);
      const hours = Math.floor(delta % 86400 / 3600);
      const days = Math.floor(delta / 86400);

      const parts = [];
      if (days) parts.push(`${days}d`);
      if (hours && days < 2) parts.push(`${hours}h`);
      if (mins && !days) parts.push(`${mins}m`);
      return parts.join(' ');
    },

    // обёртка над шаблоном колонки
    getColumnValue(row, colName) {
      // достает значение colName из row, со вложенностью
      // https://stackoverflow.com/a/6394168/1716010
      let valueText = colName.split(".").reduce((o, i) => (o ? o[i] : ""), row);
      if (['', undefined, null].includes(valueText)) return valueText; // только null видел

      const field = this.fields.find(f => f.name == colName); // TODO: without find

      // шаблоны полей задаются здесь

      if (field.href) {
        let href = row[field.href] || row.href;
        valueText = `<a href="${href}" target="_blank">${valueText}</a>`;
      }

      if (['integer', 'number'].includes(field.type) && valueText) {
        valueText = new Intl.NumberFormat().format(valueText);
      }

      if (field.type === 'timestamp' && valueText) {
        if (field.format == 'ago') {
          valueText = this.ago(valueText);
        }
        else {
          const offset = new Date().getTimezoneOffset() * 60000;
          valueText = new Date(valueText * 1000 - offset).toISOString();
          valueText = valueText.replace('T', ' ').replace(/\..*/, '')
        }
      }

      if (field.type === 'array' && valueText) {
        valueText = valueText.join(', ');
      }

      if (field.type === 'date') {
        const d = new Date(valueText);
        valueText = d.toISOString();
        valueText = valueText.replace('T', ' ').replace(/\..*/, '')
        if (d.getTime() == 0) valueText = '-';
      }

      if (field.type === 'email' && valueText) {
        valueText = `<a href="mailto:${valueText}" target="_blank">${valueText}</a>`;
      }

      if (field.type === 'phone' && valueText) {
        valueText = `<a href="tel:${valueText}">${valueText}</a>`;
      }

      if (field.name === 'domain' && valueText) {
        valueText = `<a href="https://${valueText}" target="_blank">${valueText}</a>`;
      }

      if (colName.match(/url/i) || field.type === 'url') {
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
        // relative urls
        if (valueText.startsWith('/') && row.url) {
          const url = new URL(row.url);
          valueText = `${url.origin}/${valueText}`;
        }

        // report images
        if (valueText.startsWith('./')) {
          console.log(":", );
          const url = new URL(this.itemsJsonUrl);
          valueText = valueText.replace('./', url.origin + '/');
        }

        valueText = `<img alt="error loading image" style="width: 150px; height: auto;" src="${valueText}" title="${valueText}"/>`;
      }

      if (field.type === 'boolean') {
        if (valueText == 'true' || valueText === true) valueText = 1;
        valueText = parseInt(valueText) ? "Yes" : "No"; // tolang
      }

      return valueText;
    },

    arraysEqual(a,b) { return !!a && !!b && !(a<b || b<a); },
    isDefaultFields(columns) {
      const presets = this.$store.state.columnPresets;
      const defaultColumns = presets.default ? presets.default.columns : false;
      // console.log('columns: ', columns);
      // console.log('defaultColumns: ', defaultColumns);
      if (!defaultColumns) return false;

      return this.arraysEqual(columns, defaultColumns)
    },

    setDefaultFields() {
      let fields = [];

      // find default preset
      let defaultPreset;
      for (let i in this.$store.state.columnPresets) {
        const preset = this.$store.state.columnPresets[i];
        if (preset.default || preset.name === 'default') {
          defaultPreset = preset;
          break;
        }
      }

      if (!defaultPreset) {
        // all fields
        defaultPreset = { columns: this.availableFields.map(f => f.name) };
      }

      fields = [...defaultPreset.columns];

      // remove og:image on mobile
      if (window.screen.width < 640) {
        const index = fields.indexOf('og_image');
        if (index !== -1) fields.splice(index, 1);
      }

      // default if no fields
      if (fields.length === 0) {
        fields = defaultPreset.columns;
      }

      this.setFields(fields);
    },

    sortStrToObj(str) {
      if (!str) return { column: false, ascending: true };

      const parts = str.split(",");
      if (parts.length == 1) parts.push('+');

      const obj = {
        column: parts[0] || false,
        ascending: parts[1] != '-'
      };
      return obj;
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
        this.sort = this.sortStrToObj(this.$route.query["sort"]);
        this.onTableLoaded();
      }
    },

    buildJsonInfo(items) {
      return {items};
    },

    async changeJsonUrl(itemsJsonUrl, forceDefaultColumns) {
      // data init
      this.jsonLoadError = false;
      this.jsonLoading = true;
      this.$store.commit('filteredItems', []);
      try {
        let itemsJson;
        if (itemsJsonUrl === 'input') {
          // load input json
          itemsJson = this.jsonInput;
        } else {
          // load url json
          itemsJson = await this.$axios.$get(itemsJsonUrl);
        }

        if (Array.isArray(itemsJson)) itemsJson = this.buildJsonInfo(itemsJson);
        // console.log('itemsJson.items: ', itemsJson.items);
        // console.log('itemsJson.fields: ', itemsJson.fields);
        this.$store.commit("columnPresets", itemsJson.columns || {});
        this.$store.commit("filterPresets", itemsJson.filters || []);
        this.$store.commit("tests", itemsJson.fields || []);
        this.$store.commit("scanOptions", itemsJson.scan || {});
        this.$store.dispatch("items", itemsJson.items || []);
        this.reportName = itemsJson.name || '';

        // favicon
        if (itemsJson.favicon) {
          this.favicon = itemsJson.favicon;
        }

        if (itemsJson.date) {
          this.date = itemsJson.date;
        }

        // defaultSort
        if (itemsJson.defaultSort && !this.$route.query["sort"]) {
          this.sort = itemsJson.defaultSort;
        }

        // open details when single row
        if (this.itemsLength === 1) {
          const row = this.filteredItems[0];
          // console.log('row: ', row);
          setTimeout(() => {
            this.rowClick({row});
          }, 1000);
        }

        // filter
        if (this.defaultFilter && !this.$route.query["q"]) {
          this.$route.query["q"] = this.defaultFilter.q;
        }

        // q
        this.$store.dispatch("q", this.$route.query["q"]);

        // columns
        if (forceDefaultColumns) {
          this.setDefaultFields();
          // console.log('forceDefaultColumns');
          this.updateUrlQuery(true);
        }

        this.jsonLoadError = false;
        this.jsonLoading = false;
      } catch(e) {
        this.jsonLoadError = true;
        this.jsonLoading = false;
        console.error(e);
      }
    },

    changeDisplayMode(val) {
      if (val == 'view') this.openedPanels = [];
      if (val == 'edit') this.openedPanels = ['columns', 'filter_presets', 'stats'];
    },

    openFilterPanelIfNeed() {
      if (!this.openedPanels.includes('filter_presets')) this.openedPanels.push('filter_presets');
    },

    rowClick(event) {
      this.$refs.table.toggleChildRow(event.row.id);
    },

    startIntroTour() {
      this.displayMode = 'edit';
      this.$tours['introTour'].start();
    }
  },

  created() {
    // приходит из FilterPresetButton
    this.$nuxt.$on("inputFocus", this.openFilterPanelIfNeed);

    this.$nuxt.$on("sort", (sort) => {
      this.sort = this.sortStrToObj(sort);
      this.onTableLoaded();
    });

/*
    Event.$on("vue-tables.filter", (filter) => {
      console.log("filter:", filter);
      // this.onTableLoaded();
    });
*/
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
      const isIndexRoute = $nuxt.$route.name === 'index';
      if (!this.routerProcess && isIndexRoute) {
        if (this.$route.query["q"]) {
          this.$store.dispatch("q", this.$route.query["q"]);
        } else this.$store.dispatch("q", "");

        this.fieldsInit();
      }
    });

    this.changeDisplayMode(this.displayMode);
    if (this.q) this.openFilterPanelIfNeed(); // after displayMode
    // console.log('query after mounted');

    this.updateUrlQuery(true);
  },

  head() {
    return {
      title: this.pageTitle,
      link: [{
        hid: 'icon',
        rel: 'icon',
        type: 'image/x-icon',
        href: this.favicon,
      }]
    };
  }
};
</script>
