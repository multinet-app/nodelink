<template>
  <svg ref="svg" xmlns="http://www.w3.org/2000/svg"
    :width="width" :height="height"
    :viewBox="viewBox">
    <g class="links" />
    <g class="nodes" />
  </svg>
</template>

<script>
  import { select, event } from 'd3-selection';
  import { forceSimulation, forceLink, forceManyBody, forceX, forceY } from 'd3-force';
  import { drag } from 'd3-drag';

  export default {
    name: 'node-link',

    props: {
      graph: Object,
    },

    data () {
      return {
        width: 600,
        height: 600,
      };
    },

    computed: {
      viewBox: function () {
        return [
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height].join(',');
      }
    },

    watch: {
      graph () {
        this.update();
      },
    },

    methods: {
      update () {
        let graph = {
          nodes: [...this.graph.nodes],
          edges: [...this.graph.edges],
        };

        const simulation = forceSimulation(graph.nodes)
          .force('link', forceLink(graph.edges).id(d => d.key))
          .force('charge', forceManyBody())
          .force('x', forceX())
          .force('y', forceY());

        const svg = select(this.$refs.svg);

        const link = svg.select('g.links')
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.6)
          .selectAll('line')
          .data(graph.edges)
          .join('line')
          .attr('stroke-width', 2);

        const dragFunc = (sim) => {
          function dragstarted(d) {
            if (!event.active) {
              sim.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
          }

          function dragged(d) {
            d.fx = event.x;
            d.fy = event.y;
          }

          function dragended(d) {
            if (!event.active) {
              sim.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
          }

          return drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
        };

        const node = svg.select('g.nodes')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5)
          .selectAll('circle')
          .data(graph.nodes)
          .join('circle')
          .attr('r', 5)
          .attr('fill', 'blue')
          .call(dragFunc(simulation));

        node.append('title')
          .text(d => d.key);

        simulation.on('tick', () => {
          link.attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

          node.attr('cx', d => d.x)
            .attr('cy', d => d.y);
        });
      },
    },
  }
</script>
