<template>
  <section class="container scan__container">
    <el-form class="scan__form" ref="form" v-model="form" label-width="120px">
      <el-form-item label="URL">
        <el-input v-model="form.url"></el-input>
      </el-form-item>
      <el-form-item label="Arguments">
        <el-input v-model="form.args"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="sendTask">Scan</el-button>
      </el-form-item>
    </el-form>

    <ul class="scan__log">
      <li v-for="line of log" :key="line" v-html="line"></li>
    </ul>
  </section>
</template>

<style lang="scss">
  .scan__form {
    margin-top: 30px;
    max-width: 640px;
  }

  .scan__log {
    font-family: monospace;
    background: #2d2d2d;
    color: #ccc;
    list-style: none;
    margin: 0;
    padding: 5px 10px;

    a {
      color: #9ec8f0;
      text-decoration: underline;
      &:hover { color: #fff; }
    }
  }
</style>

<script>
const apiUrl = 'http://localhost:3001';

export default {
  components: {},
  data() {
    return {
      form: {
        url: "https://blog.popstas.ru",
        args: '--max-requests 10 --upload'
      },
      log: []
    };
  },

  methods: {
    async sendTask() {
      this.log.splice(0, this.log.length);
      const opts = {
        url: this.form.url,
        args: this.form.args
      };
      console.log("scan:", opts);
      const res = await this.$axios.$post(`${apiUrl}/scan`, opts);
      console.log('res: ', res);
    },
  },

  async mounted() {
    this.socket = this.$nuxtSocket({
      channel: "/",
    });
    /* Listen for events: */
    this.socket.on("status", (msg, cb) => {
      console.log('msg: ', msg);
      this.log.push(msg);
    });
  }
};
</script>
