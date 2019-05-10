<template>
  <div id="app">
    <h1>Welcome to Your Vue.js App</h1>
    <span>{{ message }}</span>
  </div>
</template>

<script>
  import { graphql } from '@/util/multinet';

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

      const json = await graphql(`query {
        nodes (workspace: "${workspace}", graph: "${graph}", nodeType: "author") {
          total
          nodes (limit: 100) {
            key
          }
        }
      }`);

      if (json.errors.length > 0) {
        this.message = json.errors.join(', ');
        return;
      }

      this.message = `${json.data.nodes.total} nodes`;
    }
  };
</script>
