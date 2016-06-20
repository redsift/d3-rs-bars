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
    
    // In this chart, no rects should be visible
    t.equal(el.selectAll('rect').size(), 1);
    
    t.end();
});
