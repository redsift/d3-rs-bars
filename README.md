# d3-rs-bars

`d3-rs-bars` generate a range of bar charts.

## Builds

[![Circle CI](https://circleci.com/gh/Redsift/d3-rs-bars.svg?style=svg)](https://circleci.com/gh/Redsift/d3-rs-bars)

## Example

[View @redsift/d3-rs-bars on Codepen](https://....)

## Usage

### Browser
	
	<script src="//static.redsift.io/reusable/d3-rs-bars/latest/d3-rs-bars.umd-es2015.min.js"></script>
	<script>
		var chart = d3_rs_bars.html();
		...
	</script>

### ES6

	import { chart } from "@redsift/d3-rs-bars";
	let eml = chart.html();
	...
	
### Require

	var chart = require("@redsift/d3-rs-bars");
	var eml = chart.html();
	...

### Parameters

|Name|Description|Transition|
|----|-----------|----------|
|classed|SVG custom class|N|