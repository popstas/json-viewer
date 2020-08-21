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
          for (let fName of ['comment', 'description', 'command', 'validate', 'default', 'align']) {
            if(info[fName]) field[fName] = info[fName];
          }
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
  sitesJsonUrl: 'http://localhost:3001/data.json',
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

        site.id = `${site.url}`;
        return site;
      });
      // console.log('sitesData: ', sitesData);
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
    return url => {
      return state.filteredSites.find(site => site.url == url);
    };
  },

  // @deprecated
  // validate now with index.vue: cellClasses
  getColumnValidateClass(state, getters) {
    return (props, url, column) => {
      return '';
    }
  },

  getValidateFunc() {
    return (str) => {
      if(!str) return () => false;
      // const func = str.match(/^(len)\(\)\s*/);
      // if (func) v = v.length;

      const res = str.match(/^(===|==|!==|!=|>|>=|<|<=)\s*(.*)$/);
      if(res) {
        const operator = res[1];
        let expected = res[2];
        if(!['==', '==='].includes(operator)) expected = parseFloat(expected);

        // console.log('operator: ', operator);
        // console.log('expected: ', expected);
        const funcs = {
          '==': (v) => v == expected,
          '===': (v) => v === expected,
          '!=': (v) => v != expected,
          '!==': (v) => v !== expected,
          '>': (v) => v > expected,
          '>=': (v) => v >= expected,
          '<': (v) => v < expected,
          '<=': (v) => v <= expected,
        };
        if (funcs[operator]) return funcs[operator];
      }
      return () => false;
    }
  },

  getFilteredSites(state, getters) {
    return (q) => {
      // console.log('getFilteredSites: ', q);
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

      // console.log('filteredSites: ', filteredSites);
      return filteredSites;
    }
  }
};

export const mutations = {
  sitesJsonUrl(state, newValue) {
    state.sitesJsonUrl = newValue;
  },
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
    // console.log('sites: ', sitesData);
    // console.log('state.tests: ', state.tests);
    commit('allFields', fieldsBySites(state.sites, state.tests));
    // console.log('allFields: ', fieldsBySites(state.sites, state.tests));
  },

  // фильтрует sites на основе q
  filterSites({ commit, state, getters }) {
    const q = state.q.toLowerCase();
    const filteredSites = getters.getFilteredSites(q);

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
