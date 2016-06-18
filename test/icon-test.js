var tape = require("@redsift/tape-reel")("<div id='test'></div>"),
    d3 = require("d3-selection"),
    icon = require("../");

// This test should be on all brick compatable charts
tape("html() empty state", function(t) {
    var host = icon.html();
    var el = d3.select('#test');
    el.call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    // In this chart, the rect should be visible
    t.equal(el.selectAll('rect').size(), 1);
    // But there should be no text
    t.equal(el.selectAll('text').size(), 0);
        
    t.end();
});

tape("html() generates and updates svg", function(t) {
    var data = 'A';
    
    var host = icon.html();
    var el = d3.select('#test').datum(data);
    
    el.call(host);
    t.equal(el.selectAll('svg').size(), 1);    
    
    t.equal(el.select('g').text(), data);

    el.call(host);
    t.equal(el.selectAll('svg').size(), 1);    

    t.equal(el.select('g').text(), data);
    
    data = 'B';
    el.datum(data).call(host);
    
    t.equal(el.select('g').text(), data);
    
    t.end();
});   


tape("html() generates and updates 2 svgs", function(t) {
    var data = 'A';
    
    var one = icon.html('id-1');
    var two = icon.html('id-2');
    
    var el = d3.select('#test').datum(data);
    
    el.call(one);
    el.call(two);
    
    t.equal(el.selectAll('svg').size(), 2);    
    t.end();
}); 

