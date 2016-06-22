# d3-rs-bars

`d3-rs-bars` generate a range of bar charts.

## Builds

[![Circle CI](https://circleci.com/gh/Redsift/d3-rs-bars.svg?style=svg)](https://circleci.com/gh/Redsift/d3-rs-bars)

## Example

[View @redsift/d3-rs-bars on Codepen](https://....)

### Bottom orientation

![Sample bars with a bottom orientation](https://bricks.redsift.io/reusable/d3-rs-bars.svg?_datum=[1,200,3100,1000]&orientation=bottom)

### Left orientation as a series

![Sample bars with a bottom orientation](https://bricks.redsift.io/reusable/d3-rs-bars.svg?_datum=[1,200,3100,1000]&orientation=left&fill=global)

### Top orientation as time

![Sample bars with a bottom orientation](https://bricks.redsift.io/reusable/d3-rs-bars.svg?_datum=[{%22v%22:1,%22l%22:1466424812000},{%22v%22:2,%22l%22:1466511212000},{%22v%22:3,%22l%22:1466597612000},{%22v%22:300.5,%22l%22:1466684012000},{%22v%22:4000,%22l%22:1466770412000},{%22v%22:40000,%22l%22:1466856812000}]&orientation=bottom&labelTime=%25a%20%25d)


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
|labelTime|Interpret the label as a millisecond epoch and format it using the [specified string](https://github.com/d3/d3-time-format#locale_format).|N|
|minValue,maxValue|Sets the minimum and maximum Value scale range. Note that for log scales, minValue must be > 0|Y|
|barSize|Size of the bar elements|Y|