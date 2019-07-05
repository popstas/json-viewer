<template>
  <div class="calc">
    <CalculatorQuestion v-for="question in questions" :key="question.name" :question="question">
    </CalculatorQuestion>

    <div class="calc-price">{{ price }}</div>
  </div>
</template>

<style lang="scss">
body {
  background: #ccc;
}
.container {
  background: #fff;
  box-shadow: 0 0 2px #ccc;
}
.calc {
  padding: 30px;
  font-size: 20px;
  text-align: left;
  &-question {
    &__required{}
  }
  &-price{
    margin-top: 2rem;
    font-weight: bold;
    font-size: 1.2rem;
  }
}
</style>


<script>
import CalculatorQuestion from "~/components/CalculatorQuestion";
export default {
  components: { CalculatorQuestion },
  props: ['questions'],
  data() {
    return {
      price: '?'
    }
  },

  computed: {
    q() {
      return this.$store.state.q;
    }
  },
}
</script>
