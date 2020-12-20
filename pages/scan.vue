<template>
  <section class="container scan__container">
    <el-form :inline="true" class="scan__form" ref="form" v-model="form">
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

    <ul class="scan__log" v-chat-scroll>
      <li v-for="line of log" :key="line" v-html="line"></li>
    </ul>
  </section>
</template>

<style lang="scss">
  .scan__form {
    margin-top: 30px;
    max-width: 800px;

    input {
      padding: 0 10px;
      min-width: 270px;
    }
  }

  .scan__log {
    font-family: monospace;
    background: #2d2d2d;
    color: #ccc;
    list-style: none;
    margin: 0;
    padding: 5px 10px;
    max-height: calc(100vh - 150px);
    overflow-x: auto;

    a {
      color: #9ec8f0;
      text-decoration: underline;
      &:hover { color: #fff; }
    }
  }
</style>

<script>
const apiUrl = process.env.SERVER_URL || 'http://localhost:5301';

export default {
  components: {},
  data() {
    return {
      form: {
        url: "https://blog.popstas.ru",
        args: '--max-requests 10'
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
      // console.log('msg: ', msg);
      this.log.push(msg);
    });

    this.socket.on("result", (data, cb) => {
      const viewerUrl = window.location.origin + this.$router.options.base;
      if (data.json) {
        const url = viewerUrl + '?url=' + data.json;
        this.log.push(`result: <a target="_blank" href="${url}">${url}</a>`);
      }
      if (data.name) {
        const url = `${viewerUrl}?url=${apiUrl}/reports/${data.name}`;
        this.log.push(`result: <a target="_blank" href="${url}">${url}</a>`);
      }
    });
  }
};
</script>
