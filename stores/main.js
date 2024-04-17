import packageJson from "~/package.json";
import jsonQuery from "json-query";
import { defineStore } from "pinia";

export const useStore = defineStore("main", {
  state: () => ({
    // data
    items: [],
    tests: [], // объявления тестов
    filteredItems: [],

    // constants
    itemsJsonUrl: useRuntimeConfig().public.jsonUrl,
    favicon: useRuntimeConfig().public.favicon,
    itemsJsonCount: 0,
    jsonRaw: "",
    flags: {
      footer: !useRuntimeConfig().public.noFooter,
      login: !useRuntimeConfig().public.noLogin,
      filters: !useRuntimeConfig().public.noFilters,
      tour: !useRuntimeConfig().public.noTour,
      navigation: !useRuntimeConfig().public.noNavigation,
      compare: false,
    },
    jsonUrlHistory: [],
    compareList: [],
    scanHistory: [],
    scanUrlHistory: {}, // TODO2: to array
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    homepage: packageJson.homepage,
    newUserVisits: 5, // highlisht tour for new users

    scanDefaultForm: {
      preset: "seo",
      depth: 10,
      maxRequests: useRuntimeConfig().public.scanDefaultMaxRequests || 0,
      ignoreRobotsTxt: false,
      followXmlSitemap: false,
      lighthouse: false,
      urlList: false,
      outName: "",
      reportFields: "",
      reportQ: "",
      presetName: "",
    },

    // app state
    firebaseApp: null,
    // firebaseAuth: null, // causes cannot modify outside vuex
    visitCount: 0,
    fields: [],
    availableFields: [],
    allFields: [],
    defaultField: "",
    openGroups: true,
    openedPanels: [],
    showHumanColumns: true,
    currentJsonSort: "added",
    displayMode: "view",
    q: "",
    columnPresets: {}, // TODO2: to array
    filterPresets: [],
    scanOptions: {},
    user: false,
    connectionId: "", // current tab id
    lastConnectionId: "", // current user id
    uid: "", // only for anonymous
    url: useRuntimeConfig().public.scanDefaultUrl || "https://blog.popstas.ru/",
    urls: "",
    args: "",
    serverUrl: useRuntimeConfig().public.serverUrl || "",
    log: [],
    showLog: false,
    scanPresets: [],
    onlyDomains: "",

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
        target: ".display-mode-switch",
        content: `Open all panels below.`,
        offset: -300,
      },
      {
        target: ".column-presets__button_expand-all",
        content: `Show all fields list.`,
        offset: -200,
      },
      {
        target: ".column-presets__button_show-all",
        content: `Add all fields to table (or remove).`,
        offset: -200,
      },
      {
        target: ".field-add-input",
        content: `Search field by name and add to table.`,
        offset: -200,
      },
      {
        target: ".filter-presets",
        content: `Use filters to quick get needed data.`,
        offset: -200,
      },
      {
        target: ".filter__query",
        content: `Query filter, with autocomplete, regexp, and/or conditionals.`,
        offset: -200,
      },
      {
        target: ".column-presets",
        content: `Use column presets for get scoped columns.`,
        offset: -200,
      },
      {
        target: ".table-stats",
        content: `Stats by filtered rows: average, non-unique, enum values.`,
        offset: -200,
      },
      {
        target: ".current-columns",
        content: `Quick remove current table columns.`,
        offset: -200,
      },
      {
        target: ".VueTables__search-field",
        content: `Search by main column`,
        offset: -200,
      },
      {
        target: ".VueTables__row ",
        content: `Click to row for open item details `,
        offset: -200,
      },
    ],
  }),
  persist: {
    storage: localStorage,
    paths: [
      "itemsJsonUrl",
      "jsonRaw",
      "jsonUrlHistory",
      "compareList",
      "scanHistory",
      "scanUrlHistory",
      "visitCount",
      "openGroups",
      "openedPanels",
      "showHumanColumns",
      "currentJsonSort",
      "displayMode",
      "uid",
      "lastConnectionId",
      "url",
      // 'urls',
      "args",
      "serverUrl",
      "log",
      "showLog",
      "scanPresets",
    ],
  },
  getters: {},

  actions: {
    shortReportUrl(itemsJsonUrl) {
      const userDir = (this.user?.uid || "").slice(0, 5);
      return itemsJsonUrl.replace("https://site-audit.viasite.ru/reports/", "").replace(this.serverUrl + "/reports/", "").replace(userDir + "/", "").replace(/__/g, " ").replace(/\.json$/, "");
    },

    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return field && column.name === field.name;
      });
    },
    fieldExists(field) {
      return this.fieldIndex(field) !== -1;
    },
    getItemByDefaultField(val) {
      return this.filteredItems.find(item => item[this.defaultField] === val);
    },

    getValidateFunc(str) {
      if (!str) return () => false;
      // const func = str.match(/^(len)\(\)\s*/);
      // if (func) v = v.length;

      const res = str.match(/^([A-Za-z0-9_]*)\s*(===|==|!==|!=|>|>=|<|<=)\s*(.*)$/);
      if (res) {
        // const field = res[1];
        const operator = res[2];
        let expected = res[3];

        const dateNow = expected.match(/^\{now\}([\+\-])(\d+)$/);
        if (dateNow) {
          const k = dateNow === "+" ? 1 : -1;
          expected = Date.now() + parseInt(dateNow[2] * k);
        } else if (!["==", "==="].includes(operator)) {
          // string expected value
          if (expected && !parseFloat(expected)) {
            expected = res[3];
          } else {
            expected = parseFloat(expected);
          }
        }

        // always not match for empty values (except 0)
        const funcReturn = (val, condition) => {
          if ([null, undefined, ""].includes(val)) return false;
          return condition;
        };

        const funcs = {
          "==": (v) => funcReturn(v, v === expected),
          "===": (v) => funcReturn(v, v === expected),
          "!=": (v) => funcReturn(v, v !== expected),
          "!==": (v) => funcReturn(v, v !== expected),
          ">": (v) => funcReturn(v, v > expected),
          ">=": (v) => funcReturn(v, v >= expected),
          "<": (v) => funcReturn(v, v < expected),
          "<=": (v) => funcReturn(v, v <= expected),
        };
        if (funcs[operator]) return funcs[operator];
      }
      return () => false;
    },

    // returns column rendered value
    getColumnValue(row, colName) {
      // достает значение colName из row, со вложенностью
      // https://stackoverflow.com/a/6394168/1716010
      let valueText = colName.split(".").reduce((o, i) => (o ? o[i] : ""), row);
      if (["", undefined, null].includes(valueText)) return valueText; // только null видел

      const field = this.fields.find(f => f.name === colName); // TODO2: without find

      // шаблоны полей задаются здесь

      if (field.href) {
        let href = row[field.href] || row.href;
        valueText = `<a href="${href}" target="_blank">${valueText}</a>`;
      }

      if (["integer", "number"].includes(field.type) && valueText) {
        valueText = new Intl.NumberFormat().format(valueText);
      }

      if (field.type === "timestamp" && valueText) {
        if (field.format === "ago") {
          valueText = ago(valueText);
        } else {
          const offset = new Date().getTimezoneOffset() * 60000;
          valueText = new Date(valueText * 1000 - offset).toISOString();
          valueText = valueText.replace("T", " ").replace(/\..*/, "");
        }
      }

      if (field.type === "array" && valueText) {
        valueText = valueText.join(", ");
      }

      if (field.type === "date") {
        const d = new Date(valueText);
        valueText = d.toISOString();
        valueText = valueText.replace("T", " ").replace(/\..*/, "");
        if (d.getTime() === 0) valueText = "-";
      }

      if (field.type === "email" && valueText) {
        valueText = `<a href="mailto:${valueText}" target="_blank">${valueText}</a>`;
      }

      if (field.type === "phone" && valueText) {
        valueText = `<a href="tel:${valueText}">${valueText}</a>`;
      }

      if (field.name === "domain" && valueText) {
        valueText = `<a href="https://${valueText}" target="_blank">${valueText}</a>`;
      }

      if (colName.match(/url/i) || field.type === "url") {
        valueText = `<a href="${valueText}" target="_blank">${valueText}</a>`;
      }

      if (colName === "favicon") {
        valueText = valueText.replace(/^\//, row.url);
        valueText = `<img alt="" style="width:16px;height:16px" src="${valueText}"/>`;
      }

      if (colName === "domain_idn") {
        let icon = row.favicon ? row.favicon.replace(/^\//, row.url) : "";
        icon = icon ? `<img alt="" style="width:16px;height:16px" src="${icon}"/>` : "";
        valueText = `<a href="${row.url}" target="_blank">${icon} ${valueText}</a>`;
        if (row.ssh_command) {
          const href = "ssh://" + row.ssh_command.replace("ssh ", "");
          valueText += `<a href="${href}" class="ssh-link float-right" title="Open SSH">ssh</a>`;
        }
      }

      // show images as images
      if (typeof valueText === "string" && (field.type === "image" || field.name.match(/_img$/) || valueText.match(/^http.*\.(jpg|jpeg|png|gif|svg|webp)$/)) && valueText) {
        // relative urls
        if (valueText.startsWith("/") && row.url) {
          const url = new URL(row.url);
          valueText = `${url.origin}/${valueText}`;
        }

        // report images
        if (valueText.startsWith("./")) {
          const url = new URL(this.itemsJsonUrl);
          valueText = valueText.replace("./", url.origin + "/");
        }

        valueText = `<a href="${valueText}" class="image-link" target="_blank">
              <img alt="error loading image" style="width: 150px; height: auto;" src="${valueText}" title="${valueText}"/>
            </a>`;
      }

      if (field.type === "boolean") {
        if (["true", true].includes(valueText)) valueText = 1;
        valueText = parseInt(valueText) ? "Yes" : "No"; // tolang
      }

      return valueText;
    },

    // validate in ItemDetails
    getColumnValidateClass(value, validateRules) {
      const tests = {};
      if (!validateRules) return "";

      const classMap = {
        error: "danger",
        warning: "warning",
        success: "success",
      };

      for (let errType of ["warning", "error", "success"]) {
        if (!validateRules[errType]) continue;
        const func = this.getValidateFunc(validateRules[errType]);
        tests[errType] = func(value);
      }

      let c = "";
      if (tests["error"]) c = "error";
      else if (tests["warning"]) c = "warning";
      else if (tests["success"]) c = "success";
      else if (validateRules["warning"] || validateRules["error"]) c = "success";

      return classMap[c];
    },


    removeFieldByIndex(index) {
      this.fields.splice(index, 1);
      // const fields = [...this.fields];
      // this.fields = [...fields.slice(0, index), ...fields.slice(index + 1)];
    },

    addField(field) {
      this.fields.push(field);
    },

    getFilteredItems(q) {
      let filteredItems = [];

      // empty query
      if (q === "") filteredItems = this.items;

      // json-query
      // регулярка отсекает значения, которые могут быть именами полей
      // запросы с ':' фильтруются, т.к. json-query выдает фигню и для совместимости с custom format
      if (filteredItems.length === 0 && !q.match(/^[a-z0-9_]+$/)/*  && q.indexOf(':') === -1 */) {
        try {
          const query = "data[*" + q + "]";
          const res = jsonQuery(query, {
            data: { data: this.items },
            allowRegexp: true,
          });
          filteredItems = res.value;

          // normalize to array
          if (!filteredItems) filteredItems = [];
          /* if (typeof filteredItems === 'object' && !obj instanceof Array){ // for single result
            filteredItems = [filteredItems];
          } */
        } catch (e) {
          console.error(`failed to filter json-query data${q}`, e);
        }
      }

      // custom format:
      // item_info.engine:bitrix cron:0
      // TODO2: remove custom format
      if (filteredItems.length === 0) {
        let filters = q.split(" ");
        filteredItems = this.items;
        let errors = 0;
        for (let fid in filters) {
          const [name, value] = filters[fid].split(":");
          if (!value) {
            errors++;
            // console.error('error: ', filters[fid] + ' not valid filter');
            break;
          }

          const [parent, child] = name.split(".");

          filteredItems = filteredItems.filter(item => {
            if (child) return item[parent] && item[parent][child] === value;
            else return item[name] === value;
          });
        }

        if (errors > 0) filteredItems = [];
      }

      return filteredItems;
    },

    // дополняет items и сохраняет
    // TODO2: store.removeEmptyColumns
    setItems(items) {
      this.items = items;
      this.filteredItems = this.items;

      this.allFields = fieldsByItems(this.items, this.tests);

      // default field (or use first field)
      let defaultField = this.allFields.find(f => f.default);
      if (!defaultField) defaultField = this.allFields[0];
      if (!defaultField) return;
      this.defaultField = defaultField.name;

      // add id after defaultField
      let changed = false;
      for (let i in items) {
        if (!items[i].id) {
          items[i].id = items[i][defaultField.name];
          changed = true;
        }
      }

      if (changed) {
        this.items = items;
        this.filteredItems = this.items;
      }
    },

    setTests(newValue) {
      const tests = {};
      newValue.forEach(test => {
        tests[test.name] = test;
      });
      this.tests = tests;
    },

    // фильтрует items на основе q
    filterItems() {
      this.filteredItems = this.getFilteredItems(this.q);
      // TODO2: return all fields
      this.availableFields = fieldsByItems(this.filteredItems, this.tests);
    },

    // переключает поле в таблице, через нее проходят все изменения полей
    toggleField({ field, add }) {
      if (!field) return;
      let index = this.fieldIndex(field);
      if (index !== -1 && !add) {
        this.removeFieldByIndex(index);
      } else if (index === -1) {
        this.addField(field);
      }
    },

    setItemsJsonUrl({ url, count = 0 }) {
      this.itemsJsonUrl = url;

      const index = this.jsonUrlHistory.findIndex(i => i.url === url);
      if (index === -1) {
        this.jsonUrlHistory.push({
          url,
          count,
          added: Date.now(),
          used: Date.now(),
        });
      } else {
        this.jsonUrlHistory[index].used = Date.now();
      }
    },

    addUrlHistory(url) {
      if (!this.scanUrlHistory[url]) {
        this.scanUrlHistory[url] = {
          added: Date.now(),
          used: Date.now(),
        };
      } else {
        this.scanUrlHistory[url].used = Date.now();
      }
    },

    setQ(q) {
      if (!q) q = ""; // can be undefined
      this.q = typeof q == "object" ? q.q : q;
      this.filterItems();
    },

    addToCompare({ item, isRemove = false }) {
      let list = [...this.compareList];
      const foundIndex = list.findIndex(i => i && i.id === item.id);
      // remove and found
      if (isRemove && foundIndex !== -1) {
        delete (list[foundIndex]);
      }
      // add and not found
      if (!isRemove && foundIndex === -1) {
        list.push(item);
      }

      list = list.filter(Boolean);
      this.compareList = list;
    },
  },
});


function fieldsByItems(items, tests) {
  let excludedFields = [
    // objects
    "id",
    "tests",
    // duplicates
    "meta_engine",
    "meta_screenshots",
    "meta_prod",
    "item_root",
    // not working
    "total_pages_load_time",
    "result",
    "max_result",
    "result_percent",
  ];

  let fields = [];
  let fieldPaths = [];

  for (let itemInd in items) {
    let item = items[itemInd];

    // раньше из некоторых вложенных объектов доставались поля,
    // теперь они прессуются в одномерный объект
    let objs = {
      "": item,
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
          title: fieldName,
        };

        // info from /etc/item-info.yml
        const info = tests[fieldName];
        if (info) {
          // TODO2: remove fields list?
          const fieldsAllowed = [
            "comment",
            "description",
            "command",
            "validate",
            "default",
            "align",
            "type",
            "stat",
            "filterType",
            "href",
            "format",
          ];
          for (let fName of fieldsAllowed) {
            if (info[fName]) field[fName] = info[fName];
          }
        }

        if (!field.type) field.type = "string";

        fields.push(field);
        fieldPaths.push(fieldPath);
      }
    }
  }
  return fields;
}
