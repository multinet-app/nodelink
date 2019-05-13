<template>
  <svg xmlns="http://www.w3.org/2000/svg">
    <g class="links" />
    <g class="nodes" />
  </svg>
</template>

<script>
  export default {
    name: 'node-link',
    props: {
      graph: Object,
    },
    watch: {
      graph (newGraph) {
        this.update();
      },
    },
    methods: {
      update () {
        const graph = this.$props.graph;
        console.log(graph);
      },
    },
  }
</script>
