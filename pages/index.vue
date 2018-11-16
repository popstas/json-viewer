<template>
  <section class="container">
    <div>
      <div>total: {{ filteredSites.length }}</div>

      <div class="available-fields">
        <div class="field-group" v-for="group in fieldGroups" :key="group.name">
          <div class="field-group__name">{{ group.name }}</div>

          <div :title="field.name + (field.comment ? ` \n${field.comment}` : '') + (field.command ? ` \n${field.command}` : '')" @click="toggleField(field)"
            :class="{ 'available-fields__field': true, active: fieldIndex(field) != -1 }"
            v-for="field in group.fields" :key="field.name"
          >
            <input type="checkbox" :checked="fieldIndex(field) != -1">
            <label>{{ field.title }}
            </label>
          </div>
        </div>
      </div>

      <input class="filter__query" placeholder="query" v-model="q" autofocus title="Например:
      engine:bitrix prod:1"/>

      <div class="filter-presets">
        filters:
        <button
          v-for="preset in filterPresets" :key="preset.name"
          @click="q = preset.q" v-html="preset.name"></button>
      </div>

      <div class="column-presets">
        columns:
        <button
          v-for="preset in columnPresets" :key="preset.name"
          @click="setPreset(preset);" v-html="preset.name"></button>
      </div>

      <v-client-table v-if="filteredSites.length > 0"
        :columns="columns"
        :data="filteredSites"
        :options="tableOptions"
      >
        <template slot="child_row" slot-scope="props">
          <ul class="site-details">
            <li v-if="typeof value != 'object'" v-for="(value, key, index) in props.row" :key="index">
              <b>{{ key }}:</b> {{ value }}
            </li>
          </ul>
        </template>

        <!-- для каждой колонки создается слот, который получает класс и значение через функции, медленно -->
        <div v-for="colName in columns" :key="colName"
          :slot="colName" slot-scope="props"
          :class="[ 'cell', getColumnValidateClass(props, props.row.domain, colName) ]"
          v-html="getColumnValue(props.row, colName)"
        ></div>
      </v-client-table>

      <div>{{ $store.state.name }} {{ $store.state.version }}</div>
    </div>
  </section>
</template>

<style lang="scss" src="./index.scss"></style>

<script>
import _ from 'lodash';
import moment from 'moment';
import validateMap from '~/assets/js/validate.conf';
import columnPresets from '~/assets/js/presets/columns.conf';
import filterPresets from '~/assets/js/presets/filters.conf';

export default {
  components: {},
  data() {
    return {
      q: '',
      fields: [],
      columnPresets: columnPresets,
      filterPresets: filterPresets,
      routerProcess: false,
      tests: this.$store.state.tests
    };
  },

  computed: {
    filteredSites() {
      return this.$store.state.filteredSites;
    },

    filter() {
      return this.$store.state.filter;
    },

    tableOptions() {
      return {
        headings: this.headings,
        headingsTooltips: this.headingsTooltips,
        filterable: ['domain_idn'],
        perPage: this.filteredSites.length,
        rowClassCallback(row) {
          if (row.error) return 'danger';
          // return 'success';
        },
        templates: {
          /* 'files_size'(h, row, index) { // работал, но перестал вызываться после убирания site.site_info
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

    headings() {
      let h = {};
      this.fields.forEach(field => {
        h[field.name] = field.title.split('_').join(' ') || field.name;
      });
      return h;
    },

    headingsTooltips() {
      let h = {};
      this.fields.forEach(field => {
        h[field.name] = field.name;
        if (field.comment) h[field.name] = `${field.name} (${field.comment})`;
      });
      return h;
    },

    availableFields() {
      let excludedFields = [
        // objects
        'id',
        'tests',
        // duplicates
        'meta_engine',
        'meta_screenshots',
        'meta_prod',
        'site_root',
        // not working
        'total_pages_load_time',
        'result',
        'max_result',
        'result_percent'
      ];

      let fields = [];
      let fieldPaths = [];

      for (let siteInd in this.filteredSites) {
        let site = this.filteredSites[siteInd];

        // раньше из некоторых вложенных объектов доставались поля,
        // теперь они прессуются в одномерный объект
        let objs = {
          '': site
          // 'site_info.': site.site_info,
          // 'meta.': site.meta
        };

        for (let prefix in objs) {
          const obj = objs[prefix];
          for (let fieldName in obj) {
            let fieldPath = prefix + fieldName;
            if (excludedFields.includes(fieldPath)) continue;
            if (fieldPaths.includes(fieldPath)) continue;

            let field = {
              name: fieldPath,
              title: fieldName
            };

            // info from /etc/site-info.yml
            const info = this.tests.find(test => test.name == fieldName);
            if (info) {
              if (info.comment) field.comment = info.comment;
              field.command = info.command;
            }

            fields.push(field);
            fieldPaths.push(fieldPath);
          }
        }
      }

      return fields;
    },

    // раскладывает поля по группам, с дублированием
    fieldGroups() {
      let groups = { unnamed: { name: '', fields: [] } };
      for (let i in this.availableFields) {
        const field = this.availableFields[i];
        const info = this.tests.find(test => test.name == field.name);
        if (!info || !info.groups) {
          groups.unnamed.fields.push(field);
          continue;
        }

        const groupsList = Array.isArray(info.groups) ? info.groups : [info.groups];
        for (let g in groupsList) {
          let groupName = groupsList[g];
          if (!(groupName in groups)) {
            groups[groupName] = { name: groupName, fields: [] };
          }
          groups[groupName].fields.push(field);
        }
      }
      return groups;
    },

    pageTitle() {
      let title = ['viasite-projects'];
      if (this.q) title.push('q: ' + this.q);
      if (this.fields.length > 0) title.push('fields: ' + this.columns);
      return title.join(', ');
    }
  },

  watch: {
    q(val) {
      this.debouncedQueryChangeAction(); // задержка после ввода фильтра
    }
  },

  methods: {
    queryChangeAction() {
      this.updateUrlQuery();
      this.changeFilter('q', this.q);
    },

    // переключает поле в таблице, через нее проходят все изменения полей
    _toggleField(field) {
      if (!field) return;
      let index = this.fieldIndex(field);
      if (index != -1) this.fields.splice(index, 1);
      else this.fields.push(field);
    },

    // переключает поле в таблице по клику
    toggleField(field) {
      this._toggleField(field);
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
      query.fields = this.columns.join(',');
      this.$router.push({ query });
    },

    // переключить поле по имени
    toggleFieldByName(name) {
      const field = this.availableFields.find(field => field.name == name);
      this._toggleField(field);
    },

    // устанавливает поля по массиву имен, сбрасывает предыдущие выбранные поля
    setFields(columnNames) {
      this.fields = [];
      columnNames.forEach(name => {
        this.toggleFieldByName(name);
      });
      this.updateUrlQuery();
    },

    // поставить из пресета полей
    setPreset(preset) {
      this.setFields(preset.columns);
    },

    // фильтр всегда меняется через эту функцию
    changeFilter(name, value) {
      this.$store.commit('changeFilter', { name, value });
      this.$store.dispatch('filterSites');
      // this.$emit('changeFilter', { name, value });
    },

    // индекс поля в массиве по объекту
    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return field && column.name == field.name;
      });
    },

    // дополняет колонки sites.json
    sitesProcessing(sites) {
      if (!sites) return [];
      let tests = {};

      const sitesData = sites.map(s => {
        let site = { ...s };
        // should be before site_info flatten
        if (
          site.engine != 'default' &&
          (!site.site_info || (site.site_info && !site.site_info.engine))
        ) {
          if (!site.site_info) site.site_info = {};
          site.site_info.engine = site.engine;
        }

        // flatten site_info
        for (let i in site.site_info) {
          site[i] = site.site_info[i];
          if (i == 'files_size') site[i] = Math.round(site[i] / 1024);
          if (i == 'git_size') site[i] = Math.round(site[i] / 1024);
          if (i == 'updated_time') site[i] = moment.unix(site[i]).format('YYYY-MM-DD HH:mm:ss');
        }
        delete site.site_info;

        // flatten meta
        if(site.meta){
          for (let i in site.meta) {
            const ln = 'meta_' + i;
            site[ln] = site.meta[i];
            if (!(ln in tests)) {
              tests[ln] = {
                name: ln,
                groups: ['meta']
              };
            }
          }
          delete site.meta;
        }

        // flatten lighthouse
        if (site.lighthouse) {
          // console.log(site.lighthouse);
          for (let i in site.lighthouse) {
            // вложенный объект
            if (i == 'scores') {
              for (let s in site.lighthouse.scores) {
                const ln = 'lighthouse_' + s.split('-').join('_');
                site[ln] = site.lighthouse.scores[s];
                if (!(ln in tests)) {
                  tests[ln] = {
                    name: ln,
                    comment: 'Lighthouse ' + s,
                    groups: ['lighthouse']
                  };
                }
              }
            } else {
              const ln = 'lighthouse_' + i.split('-').join('_');
              site[ln] = site.lighthouse[i];
              if (!(ln in tests)) {
                tests[ln] = {
                  name: ln,
                  comment: 'Lighthouse ' + i,
                  groups: ['lighthouse']
                };
              }
            }
          }
          delete site.lighthouse;
        }

        site.prod = site.prod ? 1 : 0;
        site.https = site.https ? 1 : 0;
        site.errors = site.error ? 1 : 0;
        site.id = site.domain;
        site.time = parseInt(site.time);
        return site;
      });
      this.tests = [...Object.values(tests), ...this.$store.state.tests];
      return sitesData;
    },

    // выдает класс валидации по домену сайта и имени колонки
    getColumnValidateClass(props, domain, column) {
      const site = this.filteredSites.find(site => site.domain == domain);
      let result;
      if (!site) return '';

      // пустые не валидируются
      if ([undefined, ''].indexOf(site[column]) !== -1) return '';

      // проверяет, попадает ли значение под лимиты
      const isFits = (value, rules) => {
        let valid = true;
        if ('max' in rules && value > rules.max) return false;
        if ('min' in rules && value < rules.min) return false;
        return true;
      };

      // validate map
      // проверка на соответствие из массива
      if (column in validateMap) {
        const r = validateMap[column];
        if ('error' in r && isFits(site[column], r.error)) result = 'fail';
        else if ('warn' in r && isFits(site[column], r.warn)) result = 'warn';
        else result = 'pass';
      }

      if (!result && site.tests) {
        const test = site.tests.find(test => test.name == column);
        if (!test || !test.valid) return '';
        result = test.valid;
      }

      if (!result) return;

      // console.log('props: ', props);
      // console.log('domain: ', domain);
      // console.log('column: ', column);

      const validClassesMap = {
        pass: 'success',
        warn: 'warning',
        fail: 'danger'
      };
      return 'colored ' + validClassesMap[result] + ' ' + result || 'noclass-' + result;
      return 'success';
    },

    // достает значение colName из row, со вложенностью
    // https://stackoverflow.com/a/6394168/1716010
    getColumnValue(row, colName) {
      return colName.split('.').reduce((o, i) => (o ? o[i] : ''), row);
    }
  },

  created() {
    this.debouncedQueryChangeAction = _.debounce(this.queryChangeAction, 500);
  },

  async mounted() {
    // filter init
    if (this.$route.query['q']) this.q = this.$route.query['q'];

    // data init
    const sitesJson = await this.$axios.$get(this.$store.state.sitesJsonUrl);
    this.$store.commit('tests', sitesJson.tests);
    const sitesData = this.sitesProcessing(sitesJson.sites);
    this.$store.commit('sites', sitesData);
    this.$store.dispatch('filterSites');

    // fields init
    if (this.$route.query['fields']) {
      this.setFields(this.$route.query['fields'].split(','));
    } else {
      this.setPreset(this.columnPresets.default);
    }

    // router change event
    this.$router.afterEach((to, from) => {
      if (!this.routerProcess) {
        if (this.$route.query['q']) this.q = this.$route.query['q'];
        else this.q = '';

        if (this.$route.query['fields']) {
          this.setFields(this.$route.query['fields'].split(','));
        } else {
          this.setPreset(this.columnPresets.default);
        }
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
