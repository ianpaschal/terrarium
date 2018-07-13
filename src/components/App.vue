<template>
	<div id="app">
		<Viewport/>
	</div>
</template>

<script>
import Viewport from "./Viewport";
export default {
	name: "App",
	components: {
		Viewport
	}
};
</script>

<style lang="less">
html, body, #app {
	margin: 0;
	padding: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
