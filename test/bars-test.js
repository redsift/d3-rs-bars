var tape = require("@redsift/tape-reel")("<div id='test'></div>"),
    d3 = require("d3-selection"),
    scale = require("d3-scale"),
    fmt = require("d3-format"),
    bars = require("../");

// This test should be on all brick compatable charts
tape("html() empty state", function(t) {
    var host = bars.html();
    var el = d3.select('#test');
    el.call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    var node = el.select(host.self());
    
    // In this chart, no rects should be visible apart from the clipper
    t.equal(node.select('g.stacks').selectAll('rect').size(), 0);
    
    // But there should be some text
    t.ok(node.selectAll('text').size() > 0);
    
    // Should be some lines
    t.ok(node.selectAll('line').size() > 0);
    
    // should have an X and Y axis
    t.equal(node.selectAll('g.axis').size(), 2);
        
    t.end();
});

tape("html() 1 bar state", function(t) {
    var host = bars.html();
    var el = d3.select('#test');
    el.datum([ 1 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    var node = el.select(host.self());
        
    // In this chart, one rect should be there
    t.equal(node.select('g.stacks').selectAll('rect').size(), 1);
    
    t.end();
});

tape("html() custom local currency works", function(t) {
    var definition = {
        "decimal": ".",
        "thousands": ",",
        "grouping": [3],
        "currency": ["£", ""]
    };

    fmt.formatDefaultLocale(definition);
    
    var s = scale.scaleLog()
        .domain([1, 100]);
    
    var ticks = s.ticks(5),
        tickFormat = s.tickFormat(5, '$.02f');

    t.equal(0, ticks.map(tickFormat).filter(v => v !== '').filter(v => v.indexOf('£') !== 0).length);
    
    t.end();
});

[ {l:'top', s:'height'}, {l:'bottom', s:'height'}, {l:'left', s:'width'}, {l:'right', s:'width'}].forEach(function (o) {

var layout = o.l;
var testSize = o.s;

tape("html() data reentrant - " + layout, function(t) {
    var host = bars.html().orientation(layout);
    var el = d3.select('#test');
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    rects = el.selectAll('*');
    var initial = rects.size()
    
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(initial, rects.size());
        
    t.end();
});

tape("html() data state - " + layout, function(t) {
    var host = bars.html().orientation(layout);
    var el = d3.select('#test');
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    var node = el.select(host.self());
        
    rects = node.select('g.stacks').selectAll('rect');
    t.equal(rects.size(), 2);
    
    var one = parseInt(rects.nodes()[0].getAttribute(testSize));
    var two = parseInt(rects.nodes()[1].getAttribute(testSize));
    t.ok(one > 0);    
    t.ok(one < two);

    t.equal(rects.nodes()[0].getAttribute('fill'), rects.nodes()[1].getAttribute('fill')); 
        
    t.end();
});

tape("html() data scale - " + layout, function(t) {
    var host = bars.html().orientation(layout).minValue(0);
    var el = d3.select('#test');
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    var node = el.select(host.self());
    
    rects = node.select('g.stacks').selectAll('rect');
    t.equal(rects.size(), 2);
    
    var one = parseInt(rects.nodes()[0].getAttribute(testSize));
    var two = parseInt(rects.nodes()[1].getAttribute(testSize));
    t.equal(Math.round(one*2), Math.round(two));
    
    t.equal(rects.nodes()[0].getAttribute('fill'), rects.nodes()[1].getAttribute('fill')); 
    
    t.end();
});

tape("html() data extremes - " + layout, function(t) {
    var host = bars.html().orientation(layout).minValue(0);
    var el = d3.select('#test');
    el.datum([ 0.00001, 1, 4000000000 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    var node = el.select(host.self());
        
    rects = node.select('g.stacks').selectAll('rect');
    t.equal(rects.size(), 3);
    
    var one = parseInt(rects.nodes()[0].getAttribute(testSize));
    var two = parseInt(rects.nodes()[1].getAttribute(testSize));
    var three = parseInt(rects.nodes()[2].getAttribute(testSize));
    t.equal(one, 1);
    t.equal(two, 1);    
    t.ok(three > 50);    
    
    t.equal(rects.nodes()[0].getAttribute('fill'), rects.nodes()[1].getAttribute('fill')); 
    t.equal(rects.nodes()[2].getAttribute('fill'), rects.nodes()[1].getAttribute('fill')); 
    
    t.end();
});

tape("html() data series stacked - " + layout, function(t) {
    var host = bars.html().orientation(layout).minValue(0);
    var el = d3.select('#test');
    el.datum([ [ 3, 3 ], 6 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    var node = el.select(host.self());
        
    rects = node.select('g.stacks').selectAll('rect');
    t.equal(rects.size(), 3);
    
    var one = parseInt(rects.nodes()[0].getAttribute(testSize));
    var two = parseInt(rects.nodes()[1].getAttribute(testSize));
    var three = parseInt(rects.nodes()[2].getAttribute(testSize));
    
    t.equal(one, three / 2);
    t.equal(one, two);
        
    t.end();            
});

});

