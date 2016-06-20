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

[ {l:'top', s:'height'}, {l:'bottom', s:'height'}, {l:'left', s:'width'}, {l:'right', s:'width'}].forEach(function (o) {

var layout = o.l;
var testSize = o.s;

tape("html() data state - " + layout, function(t) {
    var host = bars.html().orientation(layout);
    var el = d3.select('#test');
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    rects = el.selectAll('rect');
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
    
    rects = el.selectAll('rect');
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
    
    rects = el.selectAll('rect');
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

});

