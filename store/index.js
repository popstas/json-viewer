import pjson from '~/package.json';
import jsonQuery from 'json-query';
import dateformat from 'dateformat';
import validateMap from '~/assets/js/validate.conf';
import moment from 'moment';

const fieldsByItems = (items, tests) => {
  let excludedFields = [
    // objects
    'id',
    'tests',
    // duplicates
    'meta_engine',
    'meta_screenshots',
    'meta_prod',
    'item_root',
    // not working
    'total_pages_load_time',
    'result',
    'max_result',
    'result_percent'
  ];

  let fields = [];
  let fieldPaths = [];

  for (let itemInd in items) {
    let item = items[itemInd];

    // раньше из некоторых вложенных объектов доставались поля,
    // теперь они прессуются в одномерный объект
    let objs = {
      '': item
      // 'item_info.': item.item_info,
      // 'meta.': item.meta
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

        // info from /etc/item-info.yml
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
  items: [],
  tests: [], // объявления тестов
  filteredItems: [],

  // constants
  itemsJsonUrl: 'http://localhost:3001/data.json',
  name: pjson.name,
  version: pjson.version,
  description: pjson.description,
  homepage: pjson.homepage,

  // app state
  fields: [],
  availableFields: [],
  allFields: [],
  defaultField: '',
  q: '',
  columnPresets: {},
  filterPresets: [],
});

export const getters = {
  // дополняет колонки items.json
  itemsProcessing(state) {
    return items => {
      if (!items) return [];
      const itemsData = items.map(s => {
        let item = { ...s };
        // should be before item_info flatten

        if(!item.id) item.id = `${item[state.defaultField]}`;
        return item;
      });
      // console.log('itemsData: ', itemsData);
      return itemsData;
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

  getItemByDefaultField(state) {
    return val => {
      return state.filteredItems.find(item => item[state.defaultField] == val);
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

  getFilteredItems(state, getters) {
    return (q) => {
      // console.log('getFilteredItems: ', q);
      let filteredItems = [];

      // empty query
      if (q == '') filteredItems = state.items;

      // json-query
      // регулярка отсекает значения, которые могут быть именами полей
      // запросы с ':' фильтруются, т.к. json-query выдает фигню и для совместимости с custom format
      if (filteredItems.length == 0 && !q.match(/^[a-z0-9_]+$/) && q.indexOf(':') === -1) {
        try {
          const res = jsonQuery('data[*' + q + ']', {
            data: { data: state.items },
            allowRegexp: true
          });
          filteredItems = res.value;

          // normalize to array
          if (!filteredItems) filteredItems = [];
          /* if (typeof filteredItems === 'object' && !obj instanceof Array){ // for single result
            filteredItems = [filteredItems];
          } */
        } catch (e) {
          // console.log(`failed to filter json-query data${q}`, e);
        }
        // console.log('filteredItems after json-query: ', filteredItems);
      }

      // custom format:
      // item_info.engine:bitrix cron:0
      if (filteredItems.length == 0) {
        // console.log('custom search');
        let filters = q.split(' ');
        filteredItems = state.items;
        let errors = 0;
        for (let fid in filters) {
          const [name, value] = filters[fid].split(':');
          if (!value) {
            errors++;
            // console.log('error: ', filters[fid] + ' not valid filter');
            break;
          }

          const [parent, child] = name.split('.');

          filteredItems = filteredItems.filter(item => {
            if (child) return item[parent] && item[parent][child] == value;
            else return item[name] == value;
            // console.log('item: ', item.domain, item[name], item[name] == value);
          });
          // console.log('filteredItems after ' + filters[fid] + ': ', filteredItems);
        }

        if (errors > 0) filteredItems = [];
      }

      // console.log('filteredItems: ', filteredItems);
      return filteredItems;
    }
  }
};

export const mutations = {
  itemsJsonUrl(state, newValue) {
    state.itemsJsonUrl = newValue;
  },
  fields(state, newValue) {
    state.fields = newValue;
  },
  items(state, newValue) {
    state.items = newValue;
    state.filteredItems = newValue;
  },
  tests(state, newValue) {
    const tests = {};
    newValue.forEach(test => {
      tests[test.name] = test;
    });
    state.tests = tests;
  },
  filteredItems(state, newValue) {
    state.filteredItems = newValue;
  },
  availableFields(state, newValue) {
    state.availableFields = newValue;
  },
  allFields(state, newValue) {
    state.allFields = newValue;
  },
  defaultField(state, newValue) {
    state.defaultField = newValue;
  },
  q(state, newValue) {
    if (!newValue) newValue = '';
    state.q = newValue;
  },
  columnPresets(state, newValue) {
    state.columnPresets = newValue;
  },
  filterPresets(state, newValue) {
    state.filterPresets = newValue;
  },

  addField(state, field) {
    state.fields.push(field);
  },

  removeFieldByIndex(state, index) {
    state.fields.splice(index, 1);
  }
};

export const actions = {
  // дополняет items и сохраняет
  items({ commit, state, getters }, items) {
    const itemsData = getters.itemsProcessing(items);
    commit('items', itemsData);
    // console.log('items: ', itemsData);
    // console.log('state.tests: ', state.tests);
    commit('allFields', fieldsByItems(state.items, state.tests));
    // console.log('allFields: ', fieldsByItems(state.items, state.tests));

    // default field (or use first field)
    let defaultField = state.allFields.find(f => f.default);
    if (!defaultField) defaultField = state.allFields[0];
    // console.log('defaultField: ', defaultField);
    commit('defaultField', defaultField.name);
  },

  // фильтрует items на основе q
  filterItems({ commit, state, getters }) {
    const q = state.q.toLowerCase();
    const filteredItems = getters.getFilteredItems(q);

    commit('filteredItems', filteredItems);
    commit('availableFields', fieldsByItems(state.filteredItems, state.tests));
  },

  q({ commit, dispatch }, q) {
    if (typeof q == 'object') {
      commit('q', q.q);
    } else {
      commit('q', q);
      dispatch('filterItems');
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
