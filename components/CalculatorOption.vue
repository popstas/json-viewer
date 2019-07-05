<template>
  <div :class="{'calc-question__option': true, 'calc-question__option_checked': checked}">
    <input :id="questionId + option.name" v-model="checked" type="radio" :name="questionId" :value="option.price">
    <label :for="questionId + option.name">{{ option.name }} <span class="calc-question__option-price"> ({{ option.price }} {{ $store.state.currency }})</span></label>
  </div>
</template>

<style lang="scss">
.calc-question__option {
  &_checked {
    .calc-question__option-price {
      color: #000;
    }
  }
  input {
    padding-right: 0.5rem;
  }
  &-price {
    color: #ccc;
  }
}
</style>


<script>
export default {
  name: 'CalculatorOption',
  props: ['option', 'questionId'],
  data() {
    return {
      id: '',
      checked: false,
    }
  },

  computed: {
    /* q() {
      return this.$store.state.q;
    },

    price() {
      let p = '?';
      if (this.checked) p = option.price;
      return p;
    } */
  },

  watch: {
    checked() {
      console.log('this.checked: ', this.checked);
      if(this.checked){
        this.$emit('input', this);
        this.$emit('change', this);
      }
    }
  },

  methods: {
    onChange(option){
      console.log('option: ', option);
    }
  },

  mounted() {
    const rand = Math.random() * 1000;
    this.id = 'option' + rand;
  }
}
</script>
