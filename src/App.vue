<template>
  <div id="app">
    <h1>Welcome to Your Vue.js App</h1>
    <span>{{ message }}</span>
    <node-link :graph="graph" />
  </div>
</template>

<script>
  import NodeLink from '@/components/NodeLink';

  import { graphql } from '@/util/multinet';

  async function getNodes (workspace, graph, nodeType) {
    const limit = 10;
    const result = await graphql(`query {
        nodes (workspace: "${workspace}", graph: "${graph}", nodeType: "${nodeType}") {
          total
          nodes (limit: ${limit}) {
            key
          }
        }
      }`);
    return result.data.nodes.nodes;
  }

  export default {
    name: 'app',

    components: {
      NodeLink
    },

    data () {
      return {
        message: '(waiting for data)',
        graph: null,
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

      const authors = await getNodes(workspace, graph, 'author');
      const conf = await getNodes(workspace, graph, 'conference');
      const journal = await getNodes(workspace, graph, 'journal');
      const nodes = [].concat(authors, conf, journal);

      const edges = await this.getEdges(workspace, 'authorship', nodes);

      this.graph = {
        nodes,
        edges
      };
    },

    methods: {
      async getEdges (workspace, table, nodes) {
        const keys = new Set();
        nodes.forEach((node) => {
          keys.add(node.key);
        });

        const countQ = await graphql(`query {
          rows (workspace: "${workspace}", table: "${table}") {
            total
          }
        }`);
        const count = countQ.data.rows.total;

        let offset = 0;
        const limit = 10000;
        let finalEdges = [];
        while (offset < count) {
          this.message = `Processing edges ${offset} through ${Math.min(offset +
          limit, count + 1)}`;

          const edgeQ = await graphql(`query {
            rows (workspace: "${workspace}", table: "${table}") {
              total
              rows (offset: ${offset}, limit: ${limit}) {
                key
                columns (keys: ["_from", "_to"]) {
                  key
                  value
                }
              }
            }
          }`);

          const edges = edgeQ.data.rows.rows.map((edge) => {
            let result = {
              key: edge.key
            };

            edge.columns.forEach((col) => {
              result[col.key.slice(1)] = col.value;
            });

            return result;
          });

          offset += edges.length;

          edges = edges.filter((edge) => {
            return keys.has(edge.from) || keys.has(edge.to);
          });

          finalEdges = finalEdges.concat(edges);
        }

        this.message = `Processed ${count} edges; found ${finalEdges.length} edges`

        return finalEdges;
      },
    },
  };
</script>
