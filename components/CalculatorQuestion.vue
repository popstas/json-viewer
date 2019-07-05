<template>
  <div :class="{'calc-question': true, 'calc-question__required': question.required}">
    <div class="calc-question__name">{{ question.name }}</div>

    <div class="calc-question-options">
      <CalculatorOption
        v-model="checked" :option="option" :question-id="id" @change="onQuestionChange"
        v-for="option in question.options" :key="option.name"
      ></CalculatorOption>
      <!-- <div class="calc-question__option" v-for="option in question.options" :key="option.name">
        <input :id="id + option.name" v-model="checked" type="radio" :name="option.name" :value="option.price">
        <label :for="id + option.name">{{ option.name }} <span class="calc-question__option-price"> ({{ option.price}} руб)</span></label>
      </div> -->
    </div>

    <template v-for="option in question.options">
      <div :class="{'option-questions': true, hidden: option.price != checked}" :key="option.name">
        <CalculatorQuestion @change="onSubquestionChange" v-for="question in option.questions" :key="question.name" :question="question"></CalculatorQuestion>
      </div>
    </template>

    <div class="calc-question-price">{{ price }}</div>
  </div>
</template>

<style lang="scss">
.calc-question {
  padding-top: 2rem;
  padding-left: 2rem;

  label {
    font-weight: normal;
    padding-left: 0.5rem;
  }

  &__required{}
  &-options{
    margin-top: 1rem;
  }
  &__option {
    input {
      padding-right: 0.5rem;
    }
    &-price {
      color: #ccc;
    }
  }
  &-price{
    margin-top: 2rem;
    font-weight: bold;
    font-size: 1.2rem;
  }
}
</style>


<script>
import CalculatorOption from "~/components/CalculatorOption";
export default {
  name: 'CalculatorQuestion',
  components: { CalculatorOption },
  props: ['question'],
  data() {
    return {
      checked: false,
      id: '',
      price: '?'
    }
  },

  computed: {
    q() {
      return this.$store.state.q;
    },
  },

  watch: {
    checked() {
      console.log('question change, this.checked: ', this.checked);
      this.price = this.calculatePrice();
    }
  },

  methods: {
    onChange(option){
      console.log('onChange, option: ', option);
      this.price = this.calculatePrice();
    },

    onQuestionChange(option) {
      console.log('onQuestionChange');
      console.log('option: ', option);

      // this.selected = this.find


      this.onChange(option);
      this.$emit('change ' + this.question.name, this);
    },

    onSubquestionChange(q) {
      console.log('onSubquestionChange');
      console.log('q: ', q);
      this.onChange(q);
      this.$emit('change ' + q.question.name, this);
    },

    calculatePrice() {
      // this.options.find(o => o.)
      console.log('calculatePrice', this.checked);
      let price = this.checked.option.price || 0;
      console.log('this.checked: ', this.checked);
      if(this.checked.option.questions){
        console.log('this.question.options: ', this.question.options);
        const found = this.question.options.find(o => {
          console.log('o: ', o);
          console.log('this.checked.option.name: ', this.checked.option.name);
          return o.name == this.checked.option.name;
        });
        let checkedQuestions = [];
        if(found) checkedQuestions = found.questions;
        console.log('found: ', found);
        if(checkedQuestions) {
          checkedQuestions.forEach(q => {
            price += q.price
          });
        }
      }
      console.log('this.question: ', this.question);
      console.log('price: ', price);
      return price;
    },

  },

  mounted() {
    const rand = Math.random() * 1000;
    this.id = 'question' + rand;
  }
}
</script>
