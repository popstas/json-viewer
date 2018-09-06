<template>
  <section class="container">
    <div>
      <div>total: {{ filteredSites.length }}</div>

      <div class="available-fields">
        <div :title="field.name + (field.comment ? ` \n${field.comment}` : '') + (field.command ? ` \n${field.command}` : '')" @click="toggleField(field)"
          :class="{ 'available-fields__field': true, active: fieldIndex(field) != -1 }"
          v-for="field in availableFields" :key="field.name"
        >
          <input type="checkbox" :checked="fieldIndex(field) != -1">
          <label>{{ field.title }}
          </label>
        </div>
      </div>

      <input class="filter__query" placeholder="query" v-model="q" title="Например:
      site_info.engine:bitrix prod:1"/>

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
            <li v-for="(value, key, index) in props.row.site_info" :key="index">
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

<style lang="scss">
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.filter {
  &__query {
    padding: 5px;
    width: 600px;
  }
}
.VuePagination {
  text-align: center;
}

.vue-title {
  text-align: center;
  margin-bottom: 10px;
}

.vue-pagination-ad {
  text-align: center;
}

.glyphicon.glyphicon-eye-open {
  width: 16px;
  display: block;
  margin: 0 auto;
}

.available-fields {
  margin: 0 auto;
  text-align: left;
  columns: 4;
  max-width: 1140px;
}
.available-fields__field {
  opacity: 0.7;
}
.available-fields__field.active {
  opacity: 1;
}
.available-fields__field label {
  font-weight: normal;
  margin-left: 5px;
}

th:nth-child(3) {
  text-align: center;
}
th.VueTables__sortable {
  cursor: pointer;
  user-select: none;
}
.VueTables__sort-icon {
}

.VueTables__child-row {
  text-align: left;
}

.VueTables__child-row-toggler {
  width: 16px;
  height: 16px;
  line-height: 16px;
  display: block;
  margin: auto;
  text-align: center;
  cursor: pointer;
}

.VueTables__child-row-toggler--closed::before {
  content: '+';
}

.VueTables__child-row-toggler--open::before {
  content: '-';
}

.VueTables__table td {
  padding: 0 !important;

  .cell {
    padding: 8px;

    &.success {
      background: #aaffaa;
    }
    &.warning {
      background: #ffffaa;
    }
    &.danger {
      background: #ffaaaa;
    }
  }
}
</style>

<script>
import _ from 'lodash';

export default {
  components: {},
  data() {
    return {
      q: '',
      fields: [],
      columnPresets: {
        default: {
          name: 'default',
          columns: [
            'domain_idn',
            'host',
            'prod',
            'site_info.engine',
            'meta.year',
            'meta.visitors',
            'site_info.yandex_tcy',
            'site_info.files_size',
            'error'
          ]
        },
        cron: {
          name: 'cron',
          columns: ['domain_idn', 'host', 'prod', 'site_info.cron']
        },
        bitrix: {
          name: 'bitrix',
          columns: [
            'domain_idn',
            'host',
            'prod',
            'site_info.email',
            'site_info.engine_version',
            'site_info.bitrix_image_quality',
            'site_info.bitrix_total_mark_value',
            'site_info.files_count',
            'site_info.files_size',
            'site_info.git_clean',
            'site_info.yandex_tcy',
            'site_info.h1_count'
          ]
        }
      },
      filterPresets: [
        {
          name: 'bitrix',
          q: 'site_info.engine:bitrix prod:1'
        },
        {
          name: 'without cron',
          q: 'site_info.engine:drupal prod:1 site_info.cron:0'
        },
        {
          name: 'without git',
          q: 'prod:1 site_info.git:0'
        }
      ]
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
          if (!row.site_info) return 'warning';
          if (row.site_info && row.site_info.error) return 'danger';
          // return 'success';
        },
        templates: {
          'site_info.files_size'(h, row, index) {
            if (!row.site_info || !row.site_info.files_size) return '';
            return Math.round(row.site_info.files_size / 1024) || '';
          }
        }
      };
    },

    columns() {
      return this.fields.map(field => field.name);
    },

    headings() {
      let h = {};
      this.fields.forEach(field => {
        h[field.name] = field.title || field.name;
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
        'site_info',
        'tests',
        'meta',
        // duplicates
        'engine',
        'meta.engine',
        'meta.screenshots',
        'site_root',
        'server',
        'site_info.user',
        'site_info.domain',
        // not working
        'site_info.total_pages_load_time'
      ];

      let fields = [];
      let fieldPaths = [];

      for (let siteInd in this.filteredSites) {
        let site = this.filteredSites[siteInd];

        let objs = {
          '': site,
          'site_info.': site.site_info,
          'meta.': site.meta
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
            const info = this.$store.state.tests.find(test => test.name == fieldName);
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
    }
  },

  watch: {
    q(val) {
      this.changeFilter('q', val);
      this.$store.dispatch('filterSites');
    }
  },

  methods: {
    // переключает поле в таблице
    toggleField(field) {
      let index = this.fieldIndex(field);
      if (index != -1) this.fields.splice(index, 1);
      else this.fields.push(field);
    },

    // переключить поле по имени
    toggleFieldByName(name) {
      const field = this.availableFields.find(field => field.name == name);
      this.toggleField(field);
    },

    // устанавливает поля по массиву имен
    setFields(columnNames) {
      this.fields = [];
      columnNames.forEach(name => {
        this.toggleFieldByName(name);
      });
    },

    // поставить из пресета полей
    setPreset(preset) {
      this.setFields(preset.columns);
    },

    changeFilter(name, value) {
      this.$store.commit('changeFilter', { name, value });
      // this.$emit('changeFilter', { name, value });
    },

    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return column.name == field.name;
      });
    },

    // дополняет колонки sites.json
    sitesProcessing(sites) {
      if (!sites) return [];
      const sitesData = sites.map(site => {
        site.prod = site.prod ? 1 : 0;
        site.error = site.site_info && site.site_info.error ? 1 : 0;
        site.id = site.domain;
        if (
          site.engine != 'default' &&
          (!site.site_info || (site.site_info && !site.site_info.engine))
        ) {
          if (!site.site_info) site.site_info = {};
          site.site_info.engine = site.engine;
        }
        return site;
      });
      return sitesData;
    },

    // выдает класс валидации по домену сайта и имени колонки
    getColumnValidateClass(props, domain, column) {
      if (!column.match(/site_info\./)) return '';
      column = column.replace('site_info.', '');
      const site = this.filteredSites.find(site => site.domain == domain);
      if (!site || !site.tests) return '';

      const test = site.tests.find(test => test.name == column);
      if (!test) return '';

      // console.log('props: ', props);
      // console.log('domain: ', domain);
      // console.log('column: ', column);

      const validClassesMap = {
        pass: 'success',
        warn: 'warning',
        fail: 'danger'
      };
      return validClassesMap[test.valid] || 'noclass-' + test.valid;
      return 'success';
    },

    // достает значение colName из row, со вложенностью
    // https://stackoverflow.com/a/6394168/1716010
    getColumnValue(row, colName) {
      return colName.split('.').reduce((o, i) => (o ? o[i] : ''), row);
    }
  },

  async mounted() {
    if (this.$route.query['q']) this.q = this.$route.query['q'];

    const sitesJson = await this.$axios.$get(this.$store.state.sitesJsonUrl);
    const sitesData = this.sitesProcessing(sitesJson.sites);
    this.$store.commit('tests', sitesJson.tests);
    this.$store.commit('sites', sitesData);
    this.$store.dispatch('filterSites');
    this.setPreset(this.columnPresets.default);
  }
};
</script>
