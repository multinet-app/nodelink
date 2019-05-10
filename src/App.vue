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
      // Get query parameters.
      const url = new URL(window.location.href);
      const workspace = url.searchParams.get('workspace');
      const graph = url.searchParams.get('graph');

      if (!workspace || !graph) {
        this.message = '"workspace" and "graph" query arguments are required.';
        return;
      }

      const response = await fetch('/multinet/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query {
            nodes (workspace: "${workspace}", graph: "${graph}", nodeType: "author") {
              total
            }
          }`
        }),
      });
      const json = await response.json();

      if (json.errors.length > 0) {
        this.message = json.errors.join(', ');
        return;
      }

      this.message = `${json.data.nodes.total} nodes`;
    }
  };
</script>
