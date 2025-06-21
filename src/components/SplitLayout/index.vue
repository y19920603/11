<template>
  <Splitpanes style="height: 100%">
    <Pane>
      <SplitPaneContent paneKey="-left" />
    </Pane>
    <Pane>
      <SplitPaneContent paneKey="-right" />
    </Pane>
  </Splitpanes>
</template>

<script setup lang="ts">
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
</script>
<style>
.splitpanes--vertical > .splitpanes__splitter {
  background: aliceblue;
  width: 2px;
}
</style>
