<template>
  <section class="container">
    <div>
      <a :href="$store.state.itemsJsonUrl" v-html="$store.state.itemsJsonUrl" target="_blank"></a>,
      total: {{ filteredItems.length }}</div>
    <br>

    <Toolbar @toggleField="toggleField" @setFields="setFields"></Toolbar>

    <div><br>
      total: {{ filteredItems.length }}
    </div>

    <div class="table-actions">
      <button class="btn btn-excel" @click="getXlsx">
        <icon name="file-excel"></icon> xlsx
      </button>
    </div>

    <v-client-table
      v-if="filteredItems.length > 0"
      :columns="columns"
      :data="filteredItems"
      :options="tableOptions"
    >
      <template slot="child_row" slot-scope="props">
        <ItemDetails :item="$store.getters.getItemByDefaultField(props.row[$store.state.defaultField])"></ItemDetails>
      </template>

      <!-- для каждой колонки создается слот, который получает класс и значение через функции, медленно -->
      <div
        v-for="colName in ['url', 'domain_idn', 'favicon']"
        :key="colName"
        :slot="colName"
        slot-scope="props"
        :class="[ getColumnValidateClass(props, props.row[$store.state.defaultField], colName) ]"
        v-html="getColumnValue(props.row, colName)"
      ></div>
    </v-client-table>
  </section>
</template>

<style lang="scss" src="./index.scss"></style>

<script>
import Toolbar from "~/components/Toolbar";
import ItemDetails from "~/components/ItemDetails";
import "vue-awesome/icons/file-excel";
import _ from "lodash";
// import { XlsxWorkbook, XlsxSheet, XlsxDownload } from "../../dist/vue-xlsx.es.js"
import XLSX from "xlsx";

export default {
  components: { Toolbar, ItemDetails },
  data() {
    return {
      routerProcess: false,
      tests: this.$store.state.tests
    };
  },

  computed: {
    q() {
      return this.$store.state.q;
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

        // align left for text
        if (field.type == 'string') {
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

        // align
        if (field.align) {
          rules.push({
            class: 'align-' + field.align,
            condition: () => true
          });
        }

        // validate
        if (field.validate) {
          // warning
          for (let errType of ['warning', 'error']) {
            if (!field.validate[errType]) continue;
            rules.push({
              class: classMap[errType] + ' err2' || 'err1',
              condition: row => {
                return this.getValidateFunc(field.validate[errType])(row[columnName])
              }
            });
          }

          // success
          if (field.validate.warning || field.validate.error) {
            rules.push({
              class: 'success',
              condition: row => {
                const isSuccess =
                  !this.getValidateFunc(field.validate.warning)(row[columnName]) &&
                  !this.getValidateFunc(field.validate.error)(row[columnName]) &&
                  !['', NaN, null].includes(row[columnName]);
                // console.log(row[columnName]);
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
        perPage: this.filteredItems.length,
        perPageValues: [100, 250, 500],
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
      // console.log('this.fields: ', this.fields);
      return this.fields.map(field => field.name);
    },

    // заголовки колонок таблиц
    headings() {
      let h = {};
      this.fields.forEach(field => {
        h[field.name] = field.title.split("_").join(" ") || field.name;
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
    }
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
      this.$router.push({ query });
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
    getColumnValidateClass(props, defaultField, column) {
      return this.$store.getters.getColumnValidateClass(props, defaultField, column);
    },

    // выдает класс валидации по домену сайта и имени колонки
    getValidateFunc(str) {
      return this.$store.getters.getValidateFunc(str);
    },

    getColumnValue(row, colName) {
      // достает значение colName из row, со вложенностью
      // https://stackoverflow.com/a/6394168/1716010
      let val = colName.split(".").reduce((o, i) => (o ? o[i] : ""), row);

      // шаблоны полей задаются здесь

      if (colName == "url") val = `<a href="${val}" target="_blank">${val}</a>`;

      if (colName == "favicon" && val) {
        val = val.replace(/^\//, row.url);
        // console.log('val: ', val);
        val = `<img style="width:16px;height:16px" src="${val}"/>`;
      }

      if (colName == "domain_idn") {
        let icon = row.favicon ? row.favicon.replace(/^\//, row.url) : "";
        icon = icon ? `<img style="width:16px;height:16px" src="${icon}"/>` : '';
        val = `<a href="${row.url}" target="_blank">${icon} ${val}</a>`;
        if (row.ssh_command){
          const href = 'ssh://' + row.ssh_command.replace('ssh ', '');
          val += `<a href="${href}" class="ssh-link float-right" title="Open SSH">ssh</a>`;
        }
      }

      return val;
    },

    fieldsInit() {
      // fields init
      if (this.$route.query["fields"]) {
        this.setFields(this.$route.query["fields"].split(","));
      } else {
        this.setFields(this.$store.state.columnPresets.default.columns);
      }
    }
  },

  async mounted() {
    // set webhook
    if (this.$route.query.url) {
      this.$store.commit('itemsJsonUrl', this.$route.query.url);
    }

    // data init
    const itemsJson = await this.$axios.$get(this.$store.state.itemsJsonUrl);
    // console.log('itemsJson.items: ', itemsJson.items);
    // console.log('itemsJson.fields: ', itemsJson.fields);
    this.$store.commit("columnPresets", itemsJson.columns);
    this.$store.commit("filterPresets", itemsJson.filters);
    this.$store.commit("tests", itemsJson.fields);
    this.$store.dispatch("items", itemsJson.items);
    this.$store.dispatch("q", this.$route.query["q"]);

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
