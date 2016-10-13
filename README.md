# d3-rs-bars

`d3-rs-bars` generate a range of bar charts. Supports stacked and un-stacked series, hovers and highlights.

## Builds

[![Circle CI](https://circleci.com/gh/Redsift/d3-rs-bars.svg?style=svg)](https://circleci.com/gh/Redsift/d3-rs-bars)

## Example

[View @redsift/d3-rs-bars on Codepen](http://codepen.io/rahulpowar/pen/mEOopX?editors=0010)

[Full example @redsift/d3-rs-bars as REFViewer on Codepen](http://codepen.io/rahulpowar/full/OXgWYj/)


### Bottom orientation

![Sample bars with a bottom orientation](https://bricks.redsift.cloud/reusable/d3-rs-bars.svg?_datum=[1,200,3100,1000]&orientation=bottom)

### Left orientation as a series

![Sample bars with a left orientation](https://bricks.redsift.cloud/reusable/d3-rs-bars.svg?_datum=[1,200,3100,1000]&orientation=left&fill=global)

### Top orientation as time

![Sample bars with a top orientation and time label](https://bricks.redsift.cloud/reusable/d3-rs-bars.svg?_datum=[{%22v%22:1,%22l%22:1466424812000},{%22v%22:2,%22l%22:1466511212000},{%22v%22:3,%22l%22:1466597612000},{%22v%22:300.5,%22l%22:1466684012000},{%22v%22:4000,%22l%22:1466770412000},{%22v%22:40000,%22l%22:1466856812000}]&orientation=top&labelTime=%25a%20%25d)

### Right orientation as stacked time

![Sample bar stack with a right orientation](https://bricks.redsift.cloud/reusable/d3-rs-bars.svg?_datum=[[1, 10],[200,300],[3000, 100],[100, 1000]]&orientation=right&fill=series)

### Side-by-Side with highlight and legend

![Sample bars with a bottom orientation](https://bricks.redsift.cloud/reusable/d3-rs-bars.svg?_datum=[[100, 1000],[20000,30000],[30000, 10000],[10000, 10000]]&orientation=bottom&stacked=false&legend=Alpha&legend=Omega&highlight=15000)

## Usage

### Browser
	
	<script src="//static.redsift.io/reusable/d3-rs-bars/latest/d3-rs-bars.umd-es2015.min.js"></script>
	<script>
		var chart = d3_rs_bars.html();
		chart.fill('global');
		d3.select('body').datum([ 1, 2, 3, 10, 100 ]).call(chart);
	</script>

### ES6

	import { html as bars } from "@redsift/d3-rs-bars";
	import { select } from "d3-selection";
	
	let chart = bars();
	select('body').datum([ 1, 2, 3, 10, 100 ]).call(chart);
	
### Require

	var chart = require("@redsift/d3-rs-bars");
	var eml = chart.html();
	...

### Datum

- Simplest form, array of numbers: `[1,2,3,4...]` [Datum Bricks Example]()
- Different set of array `[[1,2],[4,6]]` to form stacked arrays. [Datum Bricks Example]()
- The datum parameter can be altered using **Index** and **Value** to customise the ticks and the bar size. Index is used to customise the tick taking a String
or an Integer as an argument.The following datum uses a String [{"l":"Boys","v":30},{"l":"Girls","v":83}] where "v" can contain a single or an array of numbers. [Datum Bricks Example]()
- Epoch time can also be supplied to Index to include customised Calendar date to chart. 

### Parameters

Property|Description|Transition|Preview
----|-----------|----------|-------
`classed`| *String*  Customise SVG by adding, removing and toggling of CSS classes. |N|
`background`|  *Sting, Array, Function* Change the background colour of the SVG container. Background colour can be set using a colour name, rgb or hex value. | Y
`theme`| *String* Customise the chart theme including `'light'`(default) and `'dark'`. |Y 
`fill`| *Sting, Array, Function* Change the bar chart colour using a `String` which can take colour name, rgb or hex value as an argument. Using an `Array` of custom colours or use `'global'` to generate random colour  or supply a custom function.| Y
`style`|*String* Custom CSS to inject into chart. |N
`width`, `height` |*Integer* Resize the height and width of the chart. `Default` `width`: `420` pixels. |Y|
`size` | *Integer* Resize the chart to a certain size changing both the width and height maintaining a default aspect ratio. |Y|
`scale` | *Integer* Scale the entire chart by the scaling value. Used to zoom the chart or compensate for high DPI displays when rasterized. `Default` `scale`: 1 |Y| 
`margin`| *Number* Change the chart margin inside of the SVG container. `Default margin: 26`.|Y|
`inset`| *Number* Resize the space inside the chart margin for the main chart element. This excludes items like legends. |Y|
`highlight`| *(Array of)Integer* Highlight an array of value or a particular value. |Y| 
`minValue`,`maxValue`| *Number* Sets the minimum and maximum Value scale range. Note that for log scales, minValue must be > 0.|Y
`legend`| *(Array of) String* Add legends to the chart where array of `String` can be supply for multiple bar chart. | N| 
`legendOrientation` | *String* Position the legend, positions include top, bottom, left or right. `Default orientation : 'bottom'` | Y |
`orientation`| *String* Set the orientation of the labels. `Default` oriented : `left`. Parameters include `right`,`left`,`top` and `bottom`. | Y
`rotateValue`,`rotateIndex` | *Integer* Rotate the Index or Value ticks in degree where positive degree represent clockwise rotation and negative degree anticlockwise rotation. `Default` `rotation` : `0`. |Y|
`labelTime`| *String* Interpret the label as a millisecond epoch and format it using [specified string](https://github.com/d3/d3-time-format#locale_format).|N|![labelTime=%a %b](https://bricks.redsift.io/reusable/d3-rs-bars.svg?width=200&height=200&_datum=[{%22v%22:300.5,%22l%22:1466684012000},{%22v%22:4000,%22l%22:1466770412000},{%22v%22:40000,%22l%22:1466856812000}]&orientation=bottom&labelTime=%25a%20%25d)
`barSize`| *Interger* Change the size of the bar elements. Positive value set the absolute value in pixels. Negative values specify the scale relative to space between ticks. i.e. -0.5 will set the bar size to 50% of the width between the ticks. `Default` size set to `6`. |Y|![Fixed bar size](https://bricks.redsift.io/reusable/d3-rs-bars.svg?width=200&height=200&_datum=[1,200,3100,1000]&barSize=12)![Dynamic bar size](https://bricks.redsift.io/reusable/d3-rs-bars.svg?width=200&height=200&_datum=[1,200,3100,1000]&barSize=-0.5)
`tickDisplayValue`| *String, Integer* Rename all tick to a single argument taking a String or a Number. |N|
`label`| *String* Use the same labels for value using a String or an Integer. |N |
`tickFormatValue`, `tickFormatIndex`| *String, Function* Set the formatting string or function for the ticks. |N|
`tickCountValue`, `tickCountIndex`| *Number, String, Interval Function* Hints at the number of ticks to set in the corresponding axis. Supports strings for example split [time intervals](https://github.com/d3/d3-time#intervals), apply when using epoch time format. `Default tickCountIndex: 6` | N |
`displayTip`| *Integer* Position the tip display on the bar chart on hovering. |Y| 
`displayHtml` | *String,Function* Customise the tip info. Function parameters include `(d,i)`, `d` represent data and `i` the dataset. |N|
`stacked`| *Boolean* Enable bar chart to stack onto each other. | Y| 
`value`| *Function* Generate a bar chart from selecting an object values carrying the data to generate the bar chart.|N|
`grid`| *Boolean* Enable grid to display on the chart. `Default`: `true`. |N|	
`logValue`| *Integer* Alter the grid spacing for value. |Y|  
`language`| *String* Change the language format of the chart affecting digit, currency and time formats. |N |



