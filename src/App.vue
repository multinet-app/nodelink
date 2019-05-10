<template>
  <div id="app">
    <h1>Welcome to Your Vue.js App</h1>
    <span>{{ message }}</span>
  </div>
</template>

<script>
  export default {
    name: 'app',

    components: {

    },

    data () {
      return {
        message: '(waiting for data)',
      };
    },

    async mounted () {
      const response = await fetch('/multinet/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query {
            nodes (workspace: "dblp", graph: "coauth", nodeType: "author") {
              total
            }
          }`
        }),
      });
      const json = await response.json();

      this.message = `${json.data.nodes.total} nodes`;
    }
  };
</script>
