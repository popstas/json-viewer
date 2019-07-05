<template>
  <section class="container">
    <CalculatorForm :questions="questions"></CalculatorForm>
  </section>
</template>

<style lang="scss" src="../index.scss"></style>

<script>
import CalculatorForm from "~/components/CalculatorForm";
import yaml from 'js-yaml';

export default {
  components: { CalculatorForm },
  data() {
    return {
      questions: [],
      pageTitle: 'Калькулятор цены на сайт'
    };
  },

  computed: {
    q() {
      return this.$store.state.q;
    },

    price() {
      return '?';
    },

  },

  watch: {
  },

  methods: {
    async loadQuestions() {
      const rawYml = await this.$axios.$get(this.$store.state.calcYmlUrl);
      // console.log('rawYml: ', rawYml);
      return yaml.safeLoad(rawYml);
    }
  },

  async mounted() {
    const form = await this.loadQuestions();
    this.questions = form.questions;
    /* this.questions = [
      {
        name: 'Вопрос 1',
        options: [
          {
            name: 'ответ 1',
            price: '10',
            questions: [
              {
                name: 'Вопрос ответившему вариантом 1',
                options: [
                  { name:'30', price: 30 },
                  { name:'40', price: 40 },
                ]
              }
            ]
          },
          {
            name: 'ответ 2',
            price: '20',
            questions: [
              {
                name: 'Вопрос ответившему вариантом 2',
                options: [
                  { name:'50', price: 50 },
                  { name:'60', price: 60 },
                ]
              }
            ]
          },
        ],
      }
    ]; */

    // console.log('questions: ', this.questions);
  },

  head() {
    return {
      title: this.pageTitle
    };
  }
};
</script>
