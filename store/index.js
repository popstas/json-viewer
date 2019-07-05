import pjson from '~/package.json';
import jsonQuery from 'json-query';
import dateformat from 'dateformat';
import validateMap from '~/assets/js/validate.conf';
import moment from 'moment';

const fieldsBySites = (sites, tests) => {
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

  for (let siteInd in sites) {
    let site = sites[siteInd];

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
        const info = tests[fieldName];
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
};

export const state = () => ({
  // data
  sites: [],
  tests: [], // объявления тестов
  filteredSites: [],

  // constants
  sitesJsonUrl: 'https://dev.viasite.ru/viasite-projects/site-info/sites.json',
  calcYmlUrl: 'https://dev.viasite.ru/viasite-projects/calc.yml',
  currency: 'руб',
  // sitesJsonUrl: 'https://dev.viasite.ru/viasite-projects/sites.json',
  // sitesJsonUrl: 'https://test.home.popstas.ru/sites.json',
  name: pjson.name,
  version: pjson.version,
  description: pjson.description,
  homepage: pjson.homepage,

  // app state
  fields: [],
  availableFields: [],
  allFields: [],
  q: ''
});

export const getters = {
  // дополняет колонки sites.json
  sitesProcessing(state) {
    return sites => {
      if (!sites) return [];
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
          if (site[i] === true) site[i] = 1;
          if (site[i] === false) site[i] = 0;
          if (i == 'files_size') site[i] = Math.round(site[i] / 1024);
          if (i == 'git_size') site[i] = Math.round(site[i] / 1024);
          if (i == 'updated_time') site[i] = moment.unix(site[i]).format('YYYY-MM-DD HH:mm:ss');
        }
        delete site.site_info;

        // flatten meta
        if (site.meta) {
          for (let i in site.meta) {
            const ln = 'meta_' + i;
            site[ln] = site.meta[i];
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
              }
            } else {
              const ln = 'lighthouse_' + i.split('-').join('_');
              if (ln == 'lighthouse_total_byte_weight') {
                site.lighthouse[i] = Math.round(site.lighthouse[i] / 1024);
              }
              site[ln] = site.lighthouse[i];
            }
          }
          delete site.lighthouse;
        }

        site.prod = site.prod ? 1 : 0;
        site.https = site.https ? 1 : 0;
        site.errors = site.error ? 1 : 0;
        site.id = `${site.domain}/${site.host}`;
        site.time = parseInt(site.time);
        return site;
      });
      return sitesData;
    };
  },

  /* lastUpdated(state) {
    let date = Math.max.apply(Math, state.songs.map(song => new Date(song.created)));
    return dateformat(new Date(date), 'dd.mm.yyyy');
  } */
  fieldIndex(state) {
    return field => {
      return state.fields.findIndex(column => {
        return field && column.name == field.name;
      });
    };
  },
  fieldExists(state, getters) {
    return field => {
      // return getters.fieldIndex(field) != -1;
      // console.log('getters.fieldIndex(field): ', getters.fieldIndex(field));
      return getters.fieldIndex(field) != -1;
    };
  },

  getSiteByDomain(state) {
    return domain => {
      return state.filteredSites.find(site => site.domain == domain);
    };
  },

  /** выдает класс валидации по домену сайта и имени колонки
   * сначала проверяется на условия pass, если не проходит по условиям,
   * то смотрится warn, если не подходит, засчитывается fail
   * В условиях могут быть объекты: validate = { min: 1, max: 1 }
   * или значения: validate = 1
   * или условие warn: validate = { min: 80, warning: { max: 50 } }
   * Можно делать валидацию без fail, только pass и warn:
   * validate = { min: 1, warning: { max: 0} }
   */
  getColumnValidateClass(state) {
    return (props, domain, column) => {
      const site = state.filteredSites.find(site => site.domain == domain);
      let result;
      if (!site) return '';

      // пустые не валидируются
      if ([undefined, ''].indexOf(site[column]) !== -1) return '';

      // проверяет, попадает ли значение под лимиты
      const isFits = (value, rules) => {
        let valid = true;
        if (Number.isInteger(rules)) {
          return value == rules;
        }
        if ('max' in rules && value > rules.max) valid = false;
        if ('min' in rules && value < rules.min) valid = false;
        if (!('min' in rules) && !('max' in rules)) {
          valid = false;
        }
        return valid;
      };

      let r;
      if (column in validateMap) r = validateMap[column];
      else if (column in state.tests && state.tests[column].validate)
        r = state.tests[column].validate;
      else return;

      // validate map
      // проверка на соответствие из массива
      // if (Number.isInteger(r)) r = { pass: r };
      result = 'fail';
      if (isFits(site[column], r)) result = 'pass';
      else if (typeof r == 'object') {
        // if ('error' in r && isFits(site[column], r.error)) result = 'fail';
        if ('warning' in r && isFits(site[column], r.warning)) result = 'warn';
      }

      if (!result && site.tests) {
        const test = state.tests[column];
        if (!test || !test.valid) {
          return '';
        }
        result = test.valid;
      }

      if (!result) return;

      const validClassesMap = {
        pass: 'success',
        warn: 'warning',
        fail: 'danger'
      };
      return 'colored ' + validClassesMap[result] + ' ' + result || 'noclass-' + result;
    };
  }
};

export const mutations = {
  fields(state, newValue) {
    state.fields = newValue;
  },
  sites(state, newValue) {
    state.sites = newValue;
    state.filteredSites = newValue;
  },
  tests(state, newValue) {
    const tests = {};
    newValue.forEach(test => {
      tests[test.name] = test;
    });
    state.tests = tests;
  },
  filteredSites(state, newValue) {
    state.filteredSites = newValue;
  },
  availableFields(state, newValue) {
    state.availableFields = newValue;
  },
  allFields(state, newValue) {
    state.allFields = newValue;
  },
  q(state, newValue) {
    if (!newValue) newValue = '';
    state.q = newValue;
  },

  addField(state, field) {
    state.fields.push(field);
  },

  removeFieldByIndex(state, index) {
    state.fields.splice(index, 1);
  }
};

export const actions = {
  // дополняет sites и сохраняет
  sites({ commit, state, getters }, sites) {
    const sitesData = getters.sitesProcessing(sites);
    commit('sites', sitesData);
    commit('allFields', fieldsBySites(state.sites, state.tests));
  },

  // фильтрует sites на основе q
  filterSites({ commit, state, getters }) {
    const q = state.q.toLowerCase();
    let filteredSites = [];

    // empty query
    if (q == '') filteredSites = state.sites;

    // json-query
    // регулярка отсекает значения, которые могут быть именами полей
    // запросы с ':' фильтруются, т.к. json-query выдает фигню и для совместимости с custom format
    if (filteredSites.length == 0 && !q.match(/^[a-z0-9_]+$/) && q.indexOf(':') === -1) {
      try {
        const res = jsonQuery('data[*' + q + ']', {
          data: { data: state.sites },
          allowRegexp: true
        });
        filteredSites = res.value;

        // normalize to array
        if (!filteredSites) filteredSites = [];
        /* if (typeof filteredSites === 'object' && !obj instanceof Array){ // for single result
          filteredSites = [filteredSites];
        } */
      } catch (e) {
        // console.log(`failed to filter json-query data${q}`, e);
      }
      // console.log('filteredSites after json-query: ', filteredSites);
    }

    // custom format:
    // site_info.engine:bitrix cron:0
    if (filteredSites.length == 0) {
      // console.log('custom search');
      let filters = q.split(' ');
      filteredSites = state.sites;
      let errors = 0;
      for (let fid in filters) {
        const [name, value] = filters[fid].split(':');
        if (!value) {
          errors++;
          // console.log('error: ', filters[fid] + ' not valid filter');
          break;
        }

        const [parent, child] = name.split('.');

        filteredSites = filteredSites.filter(site => {
          if (child) return site[parent] && site[parent][child] == value;
          else return site[name] == value;
          // console.log('site: ', site.domain, site[name], site[name] == value);
        });
        // console.log('filteredSites after ' + filters[fid] + ': ', filteredSites);
      }

      if (errors > 0) filteredSites = [];
    }

    commit('filteredSites', filteredSites);
    commit('availableFields', fieldsBySites(state.filteredSites, state.tests));
  },

  q({ commit, dispatch }, q) {
    if (typeof q == 'object') {
      commit('q', q.q);
    } else {
      commit('q', q);
      dispatch('filterSites');
    }
  },

  // переключает поле в таблице, через нее проходят все изменения полей
  toggleField({ commit, getters }, { field, add }) {
    if (!field) return;
    let index = getters.fieldIndex(field);
    if (index != -1 && !add) {
      commit('removeFieldByIndex', index);
    } else if (index == -1) {
      commit('addField', field);
    }
  }
};

export const strict = true;
