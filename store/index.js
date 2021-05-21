import pjson from '~/package.json';
import jsonQuery from 'json-query';
import firebase from "firebase";

export const state = () => ({
  // data
  items: [],
  tests: [], // объявления тестов
  filteredItems: [],

  // constants
  itemsJsonUrl: process.env.JSON_URL || '',
  jsonUrlHistory: {},
  compareList: [],
  scanHistory: [],
  scanUrlHistory: {},
  name: pjson.name,
  version: pjson.version,
  description: pjson.description,
  homepage: pjson.homepage,
  newUserVisits: 5, // highlisht tour for new users

  scanDefaultForm: {
    preset: 'seo',
    depth: 10,
    maxRequests: process.env.SCAN_DEFAULT_MAX_REQUESTS || 0,
    ignoreRobotsTxt: false,
    followXmlSitemap: false,
    lighthouse: false,
    urlList: false,
    outName: '',
    reportFields: '',
    reportQ: '',
    presetName: '',
  },

  flags: {
    compare: false,
  },

  // app state
  visitCount: 0,
  fields: [],
  availableFields: [],
  allFields: [],
  defaultField: '',
  openGroups: true,
  showHumanColumns: true,
  currentJsonSort: 'added',
  displayMode: 'view',
  q: '',
  columnPresets: {},
  filterPresets: [],
  scanOptions: {},
  user: false,
  connectionId: 0, // current tab id
  lastConnectionId: 0, // current user id
  uid: '', // only for anonymous
  url: 'https://blog.popstas.ru',
  urls: '',
  args: '--lang en',
  serverUrl: process.env.SERVER_URL || false,
  log: [],
  scanPresets: [],

  introTourSteps: [ // tolang
    /* {
      target: '.report-history',
      header: {
        title: 'Get Started',
      },
      content: `Current loaded report's JSON file, history of last reports. Sort by name, added date or used date`,
      params: {
        placement: 'top' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      },
      offset: -150,
    }, */
    {
      target: '.display-mode-switch',
      content: `Open all panels below.`,
      offset: -300,
    },
    {
      target: '.column-presets__button_expand-all',
      content: `Show all fields list.`,
      offset: -200,
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
      target: '.filter-presets',
      content: `Use filters to quick get needed data.`,
      offset: -200,
    },
    {
      target: '.filter__query',
      content: `Query filter, with autocomplete, regexp, and/or conditionals.`,
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
  ],
});

export const getters = {
  // дополняет колонки items.json
  itemsProcessing(state) {
    return items => {
      if (!items) return [];
      const itemsData = items.map(s => {
        let item = { ...s };
        // should be before item_info flatten
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

  shortReportUrl(state) {
    return url => {
      const userDir = (state.user?.uid || '').slice(0, 5);
      return url.
        replace('https://site-audit.viasite.ru/reports/', '').
        replace(state.serverUrl + '/reports/', '').
        replace(userDir + '/', '').
        replace(/__/g, ' ').
        replace(/\.json$/, '');
    }
  },

  getItemByDefaultField(state) {
    return val => {
      return state.filteredItems.find(item => item[state.defaultField] == val);
    };
  },

  // validate in ItemDetails
  getColumnValidateClass(state, getters) {
    return (value, validateRules) => {
      const tests = {};
      if (!validateRules) return '';

      const classMap = {
        error: 'danger',
        warning: 'warning',
        success: 'success',
      };

      for (let errType of ['warning', 'error', 'success']) {;
        if (!validateRules[errType]) continue;
        const func = getters.getValidateFunc(validateRules[errType]);
        tests[errType] = func(value);
      }

      let c = '';
      if (tests['error']) c = 'error';
      else if (tests['warning']) c = 'warning';
      else if (tests['success']) c = 'success';
      else if (validateRules['warning'] || validateRules['error']) c = 'success';

      return classMap[c];
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

        // always not match for empty values (except 0)
        const funcReturn = (val, condition) => {
          if ([null, undefined, ''].includes(val)) return false;
          return condition;
        }

        // console.log('operator: ', operator);
        // console.log('expected: ', expected);
        const funcs = {
          '==': (v) => funcReturn(v, v == expected),
          '===': (v) => funcReturn(v, v === expected),
          '!=': (v) => funcReturn(v, v != expected),
          '!==': (v) => funcReturn(v, v !== expected),
          '>': (v) => funcReturn(v, v > expected),
          '>=': (v) => funcReturn(v, v >= expected),
          '<': (v) => funcReturn(v, v < expected),
          '<=': (v) => funcReturn(v, v <= expected),
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
      if (filteredItems.length == 0 && !q.match(/^[a-z0-9_]+$/)/*  && q.indexOf(':') === -1 */) {
        try {
          const query = 'data[*' + q + ']'
          const res = jsonQuery(query, {
            data: { data: state.items },
            allowRegexp: true
          });
          // console.log('query: ', query);
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

/* export const computed = {
  scanForm: state => state.scanForm
}; */

export const mutations = {
  itemsJsonUrl(state, newValue) {
    state.itemsJsonUrl = newValue;

    const historyItem = {
      added: Date.now(),
      used: Date.now(),
    };

    if(!state.jsonUrlHistory[state.itemsJsonUrl]) {
      state.jsonUrlHistory[state.itemsJsonUrl] = {
        added: Date.now(),
        used: Date.now(),
      }
    } else {
      state.jsonUrlHistory[state.itemsJsonUrl].used = Date.now();
    }
  },

  jsonUrlHistory(state, newValue) {
    state.jsonUrlHistory = newValue;
  },
  compareList(state, newValue) {
    state.compareList = newValue;
  },
  scanHistory(state, newValue) {
    state.scanHistory = newValue;
  },
  scanUrlHistory(state, newValue) {
    state.scanUrlHistory = newValue;
  },
  addUrlHistory(state, url) {
    if (!state.scanUrlHistory[url]) {
      state.scanUrlHistory[url] = {
        added: Date.now(),
        used: Date.now(),
      };
    } else {
      state.scanUrlHistory[url].used = Date.now();
    }
  },
  fields(state, newValue) {
    state.fields = newValue;
  },
  visitCount(state, newValue) {
    state.visitCount = newValue;
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
  openGroups(state, newValue) {
    state.openGroups = newValue;
  },
  showHumanColumns(state, newValue) {
    state.showHumanColumns = newValue;
  },
  currentJsonSort(state, newValue) {
    state.currentJsonSort = newValue;
  },
  displayMode(state, newValue) {
    state.displayMode = newValue;
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
  scanOptions(state, newValue) {
    state.scanOptions = newValue || {};
  },

  addField(state, field) {
    state.fields.push(field);
  },

  removeFieldByIndex(state, index) {
    state.fields.splice(index, 1);
  },

  setUser(state, newValue) {
    state.user = newValue;
  },
  setUid(state, newValue) {
    state.uid = newValue;
  },

  url(state, newValue) {
    state.url = newValue;
 },
  urls(state, newValue) {
    state.urls = newValue;
  },
  args(state, newValue) {
    state.args = newValue;
  },
  serverUrl(state, newValue) {
    state.serverUrl = newValue;
  },
  connectionId(state, newValue) {
    state.connectionId = newValue;
  },
  lastConnectionId(state, newValue) {
    state.lastConnectionId = newValue;
  },
  log(state, newValue) {
    state.log = newValue;
  },
  scanPresets(state, newValue) {
    // console.log('scanPresets: ', newValue);
    state.scanPresets = newValue;
  },
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

    // add id after defaultField
    for (let i in itemsData) {
      if (!itemsData[i].id) itemsData[i].id = itemsData[i][defaultField.name];
    }

    commit('items', itemsData);
  },

  // фильтрует items на основе q
  filterItems({ commit, state, getters }) {
    const q = state.q.toLowerCase();
    const filteredItems = getters.getFilteredItems(q);

    commit('filteredItems', filteredItems);
    commit('availableFields', fieldsByItems(state.filteredItems, state.tests)); // TODO: return all fields
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
  },

  setUser({ commit, state }, user) {
    if(user) {
      commit("setUser", {
        uid: user.uid,
        photoURL: user.photoURL,
        displayName: user.displayName,
        email: user.email,
      });

      if (!user.email) return;

      firebase
        .database()
        .ref("users/" + state.user.uid)
        .once("value")
        .then(snapshot => {
          const settings = (snapshot.val() && snapshot.val().settings) || false;
          if (settings) {
            console.log('Update settings from firebase:', settings);
            /* if (settings.webhookShow && state.webhookShow !== settings.webhookShow) {
              console.log('Update webhookShow from firebase:', settings);
              commit('webhookShow', settings.webhookShow);
            } */
          }
        });
    } else {
      commit("setUser", false);
    }
  },

  addToCompare({ commit, state }, {item, isRemove = false}) {
    console.log('addToCompare');
    console.log('item: ', item);
    console.log('isRemove: ', isRemove);
    let list = [...state.compareList];
    const foundIndex = list.findIndex(i => i && i.id == item.id);
    console.log('foundIndex: ', foundIndex);
    // remove and found
    if (isRemove && foundIndex !== -1) {
      console.log('delete(list[foundIndex])');
      delete(list[foundIndex]);
    }
    // add and not found
    if (!isRemove && foundIndex === -1) {
      list.push(item);
    }

    list = list.filter(Boolean);
    console.log('list: ', list);
    commit('compareList', list);
  }
};

export const strict = true;
// export const strict = false;

function fieldsByItems(items, tests){
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
          for (let fName of ['comment', 'description', 'command', 'validate', 'default', 'align', 'type', 'stat']) {
            if(info[fName]) field[fName] = info[fName];
          }
        }

        if (!field.type) field.type = 'string';

        fields.push(field);
        fieldPaths.push(fieldPath);
      }
    }
  }

  return fields;
};
