<template>
  <div class="item-details">
    <button v-if="$store.state.flags.compare" class="item-compare" @click="toggleCompare">{{ isInCompare ? 'Add to compare' : 'Remove from compare'}}</button>
    <a
      v-if="item.url && lastGroup"
      class="item-details__title"
      :href="item.url"
      target="_blank"
      >{{ item.url }}</a
    >

    <!-- navigation -->
    <div class="item-details__groups" v-if="lastGroup">
      <a
        :class="{
          'item-details__groups-link_active': group.name === lastGroup,
          'item-details__groups-link': true
        }"
        :href="$nuxt.$route.fullPath.replace(/#.*/, '') + '#' + item[$store.state.defaultField] + '-' + group.name"
        v-for="group in groups"
        :key="group.name"
        >{{ group.name }}</a
      >
    </div>

    <!-- groups panels -->
    <div
      :class="{
        'item-details__group': true,
        'item-details__group_lighthouse': group.name.match(/Lighthouse/),
      }"
      v-for="group in groups"
      :data-group="group.name"
      :key="group.name"
      :id="item[$store.state.defaultField] + '-' + group.name"
    >
      <div class="item-details__group-name">{{ group.name }}</div>
      <ul class="item-details__group-fields">
        <li
          v-for="field in group.fields"
          :key="field.name"
          :title="field.name"
          :class="field.validateClass"
        >
          <span class="item-details__label">{{
            field.comment || field.name
          }}</span>
          <span
            class="item-details__value"
            v-html="field.valueText || field.value"
          ></span>

          <FilterPresetButton
            v-if="itemsLength > 1"
            class="field-preset"
            :preset="{ q: field.name + '=' + field.value }"
            append
          >
            <icon name="filter" scale="0.6"></icon>
          </FilterPresetButton>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.VueTables__child-row {
  background: none !important;
}
</style>

<script>
import FilterPresetButton from "~/components/FilterPresetButton";
import "vue-awesome/icons/filter";

const groupsDefaultOrder = [
  // site-discovery
  'site_main',
  'meta',

  // site-audit-seo
  'metatags',
  'readability',
  'yake',
  'perf',
  'content',
];


export default {
  components: { FilterPresetButton },
  props: ["item"],
  data() {
    return {
      observer: null,
      lastGroup: '',
      isInCompare : false,
    }
  },

  watch: {
    lastGroup(val) {
      this.$emit('hideTable', val !== '');
    }
  },

  computed: {
    id() {
      return this.$store.state.itemsJsonUrl + '_' + this.url;
    },

    tests() {
      return this.$store.state.tests;
    },
    itemsLength() {
      return this.$store.state.items.length;
    },

    groups() {
      // console.log('$nuxt.$route: ', $nuxt.$route);
      let groups = { unnamed: { name: "", fields: [] } };
      for (let colName in this.item) {
        let val = this.item[colName];
        if (typeof val === "object") continue;
        if (val === "") continue;

        const field = this.tests[colName];
        if (!field || !field.groups) {
          // groups.unnamed.fields.push(val);
          continue;
        }
        field.value = val;

        const groupsList = Array.isArray(field.groups)
          ? field.groups
          : [field.groups];

        field.validateClass = this.getColumnValidateClass(val, field.validate);

        // console.log(colName + ' validateClass: ', field.validateClass);

        let valueText;

        if (colName.match(/url/i)) {
          valueText = `<a href="${val}" target="_blank">${val}</a>`;
        }

        if (field.type == "boolean") {
          valueText = parseInt(val) ? "yes" : "no"; // tolang
        }

        if (
          typeof val === "string" &&
          (field.type === "image" ||
            val.match(/^http.*\.(jpg|jpeg|png|gif)$/)) &&
          val
        ) {
          // const src = val.replace(/^\//, this.tests.url);
          valueText = `<img alt="error loading image" style="width: 150px; height: auto;" src="${val}" title="${val}"/>`;
        }

        field.valueText = valueText;

        // add to groups
        for (let g in groupsList) {
          // console.log('g: ', g);
          let groupName = groupsList[g];
          if (!(groupName in groups)) {
            groups[groupName] = { name: groupName, fields: [] };
          }

          const f = { ...field };

          // hide field duplicates
          if (g != 0) f.validateClass += " secondary group-" + groupName;

          groups[groupName].fields.push(f);
        }
      }

      // sort
      const groupsSorted = {};

      // first from hardcoded order
      for (let groupName of groupsDefaultOrder) {
        if (groups[groupName]) groupsSorted[groupName] = groups[groupName];
      }
      // console.log('groupsSorted: ', groupsSorted);

      // then other groups
      for (let groupName in groups) {
        // console.log('groupName: ', groupName);
        if (!groupsSorted[groupName]) groupsSorted[groupName] = groups[groupName];
      }

      // console.log('groups: ', groups);
      // console.log('groupsSorted: ', groupsSorted);

      return groupsSorted;
    },
  },

  methods: {
    // выдает класс валидации по значению и правилам валидации
    getColumnValidateClass(value, validateRules) {
      return this.$store.getters.getColumnValidateClass(value, validateRules);
    },

    onElementObserved(entries) {
      let lastTarget;
      console.log('');
      entries.forEach(({ target, isIntersecting}) => {
        // console.log('target.dataset.group: ', target.dataset.group);

        // hide all groups
        if (target === this.$el && !isIntersecting) {
          this.lastGroup = '';
          return;
        }

        if (!isIntersecting) return;
        // console.log('target: ', target);
        lastTarget = target;
        // this.observer.unobserve(target);
      });

      if (lastTarget) {
        this.lastGroup = lastTarget.dataset.group;
        // console.log('lastTarget: ', lastTarget);
      }
    },

    toggleCompare() {
      const isRemove = !this.isInCompare;
      this.isInCompare = !this.isInCompare;
      const item = {
        id: this.id,
        reportUrl: this.$store.state.itemsJsonUrl,
        item: this.item
      };
      console.log('isRemove: ', isRemove);
      this.$store.dispatch('addToCompare', {item, isRemove});
    },

  },

  mounted() {
    // item details table of contents observe
    this.observer = new IntersectionObserver(
      this.onElementObserved/* ,
      {
        root: this.$el,
        threshold: 1.0,
      } */
    );
    const groups = this.$el.querySelectorAll('.item-details__group');
    // console.log('groups: ', groups);
    this.observer.observe(this.$el);
    for(let group of groups) {
      this.observer.observe(group);
    }

    if (this.$store.state.flags.compare) {
      console.log('compareList: ', this.$store.state.compareList);
      this.isInCompare = !!this.$store.state.compareList.findIndex(i => i && i.id == this.id);
    }
  },

  beforeDestroy() {
    this.observer.disconnect();
    this.$emit('hideTable', false);
  },
};
</script>
