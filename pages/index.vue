<template>
  <section class="container">
    <div>
      <div>total: {{ filteredSites.length }}</div>

      <div class="available-fields">
        <div :title="field.name" @click="toggleField(field)"
          :class="{ 'available-fields__field': true, active: fieldIndex(field) != -1 }"
          v-for="field in availableFields" :key="field.name"
        >
          <input type="checkbox" :checked="fieldIndex(field) != -1">
          <label>{{ field.title }}
          </label>
        </div>
      </div>

      <input placeholder="query" v-model="q" title="Например:
      site_info.engine:bitrix prod:1"/>

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
      </v-client-table>
    </div>
  </section>
</template>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
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
        }
      }
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
      });
      return h;
    },

    availableFields() {
      let excludedFields = [
        // objects
        'site_info',
        'tests',
        'meta',
        // duplicates
        'engine',
        'meta.engine',
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
            fields.push({
              name: fieldPath,
              title: fieldName
            });
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
    }
  },

  async mounted() {
    if (this.$route.query['q']) this.q = this.$route.query['q'];

    const sites = await this.$axios.$get(this.$store.state.sitesJsonUrl);
    const sitesData = this.sitesProcessing(sites);
    this.$store.commit('sites', sitesData);
    this.$store.dispatch('filterSites');
    this.setPreset(this.columnPresets.default);
  }
};
</script>
