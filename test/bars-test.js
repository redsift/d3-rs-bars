var tape = require("@redsift/tape-reel")("<div id='test'></div>"),
    d3 = require("d3-selection"),
    bars = require("../");

// This test should be on all brick compatable charts
tape("html() empty state", function(t) {
    var host = bars.html();
    var el = d3.select('#test');
    el.call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    // In this chart, no rects should be visible
    t.equal(el.selectAll('rect').size(), 0);
    
    // But there should be some text
    t.ok(el.selectAll('text').size() > 0);
    
    // Should be some lines
    t.ok(el.selectAll('line').size() > 0);
    
    // should have an X and Y axis
    t.equal(el.selectAll('g.axis').size(), 2);
        
    t.end();
});

tape("html() 1 bar state", function(t) {
    var host = bars.html();
    var el = d3.select('#test');
    el.datum([ 1 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    // In this chart, one rect should be there
    t.equal(el.selectAll('rect').size(), 1);
    
    t.end();
});

['left', 'right'].forEach(function (layout) {

tape("html() data state - " + layout, function(t) {
    var host = bars.html().orientation(layout);
    var el = d3.select('#test');
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    rects = el.selectAll('rect');
    t.equal(rects.size(), 2);
    
    var one = parseInt(rects.nodes()[0].getAttribute('width'));
    var two = parseInt(rects.nodes()[1].getAttribute('width'));
    t.ok(one > 0);    
    t.ok(one < two);
    
    
    t.end();
});

tape("html() data scale - " + layout, function(t) {
    var host = bars.html().orientation(layout).minValue(0);
    var el = d3.select('#test');
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    rects = el.selectAll('rect');
    t.equal(rects.size(), 2);
    
    var one = parseInt(rects.nodes()[0].getAttribute('width'));
    var two = parseInt(rects.nodes()[1].getAttribute('width'));
    t.equal(Math.round(one*2), Math.round(two));
    
    
    t.end();
});

});

['top', 'bottom'].forEach(function (layout) {

tape("html() data state - " + layout, function(t) {
    var host = bars.html().orientation(layout);
    var el = d3.select('#test');
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    rects = el.selectAll('rect');
    t.equal(rects.size(), 2);
    
    var one = parseInt(rects.nodes()[0].getAttribute('height'));
    var two = parseInt(rects.nodes()[1].getAttribute('height'));
    t.ok(one > 0);
    t.ok(one < two);
    
    
    t.end();
});

tape("html() data scale - " + layout, function(t) {
    var host = bars.html().orientation(layout).minValue(0);
    var el = d3.select('#test');
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    rects = el.selectAll('rect');
    t.equal(rects.size(), 2);
    
    var one = parseInt(rects.nodes()[0].getAttribute('height'));
    var two = parseInt(rects.nodes()[1].getAttribute('height'));
    t.equal(Math.round(one*2), Math.round(two));
    
    
    t.end();
});


});
