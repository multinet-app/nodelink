<template>
  <div id="app">
    <h1>Welcome to Your Vue.js App</h1>
    <node-link :graph="graph" />
    <div>{{ message }}</div>
  </div>
</template>

<script>
  import NodeLink from '@/components/NodeLink';

  import { graphql } from '@/util/multinet';

  async function getNodes (workspace, graph) {
    const limit = 100;
    const result = await graphql(`query {
      graph (workspace: "${workspace}", name: "${graph}") {
        nodes {
          total
          data (limit: ${limit}) {
            key
            properties (keys: ["type", "name", "title"]) {
              key
              value
            }
          }
        }
      }
    }`);

    return result.data.graph.nodes.data.map((node) => {
      let rec = {
        key: node.key
      };

      node.properties.forEach(({key, value}) => {
        rec[key] = value;
      });

      return rec;
    });
  }

  export default {
    name: 'app',

    components: {
      NodeLink
    },

    data () {
      return {
        message: '(waiting for data)',
        graph: {
          nodes: [],
          edges: [],
        },
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

      const nodes = await getNodes(workspace, graph);
      const edges = await this.getEdges(workspace, graph, nodes);

      this.graph = {
        nodes,
        edges,
      };
    },

    methods: {
      async getEdges (workspace, graph, nodes) {
        const keys = new Set();
        nodes.forEach((node) => {
          keys.add(node.key);
        });

        let offset = 0;
        const limit = 10000;
        const edgeQ = await graphql(`query {
          graph (workspace: "${workspace}", name: "${graph}") {
            edges {
              total
              data (offset: ${offset}, limit: ${limit}) {
                key
                properties (keys: ["_from", "_to"]) {
                  key
                  value
                }
              }
            }
          }
        }`);
        const count = edgeQ.data.graph.edges.total;

        let edges = edgeQ.data.graph.edges.data.map((edge) => {
          let result = {
            key: edge.key
          };

          edge.properties.forEach((col) => {
            const key = col.key === '_from' ? 'source' : 'target';
            result[key] = col.value;
          });

          return result;
        });

        offset += edges.length;

        edges = edges.filter((edge) => {
          return keys.has(edge.source) && keys.has(edge.target);
        });

        this.message = `Processed ${count} edges; found ${edges.length} edges`

        return edges;
      },
    },
  };
</script>
