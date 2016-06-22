
import { select } from 'd3-selection';
import { max, min } from 'd3-array';
import { scaleLinear, scaleLog } from 'd3-scale';
import { axisTop, axisRight, axisBottom, axisLeft } from 'd3-axis';
import { timeFormatLocale } from 'd3-time-format';
import { formatLocale } from 'd3-format';

import { html as svg } from '@redsift/d3-rs-svg';
import { units, time } from "@redsift/d3-rs-intl";
import { tip } from "@redsift/d3-rs-tip";
import { 
  random as random, 
  presentation10 as presentation10,
  display as display
} from '@redsift/d3-rs-theme';

const DEFAULT_SIZE = 420;
const DEFAULT_ASPECT = 160 / 420;
const DEFAULT_MARGIN = 26;  // white space
const DEFAULT_INSET = 24;   // scale space
const DEFAULT_TICK_FORMAT_VALUE = ',.0f';
const DEFAULT_TICK_FORMAT_VALUE_SI = '.2s';
const DEFAULT_TICK_FORMAT_VALUE_SMALL = '.3f';
const DEFAULT_TICK_FORMAT_INDEX = ',d';
const DEFAULT_TICK_COUNT = 4;
const DEFAULT_SCALE = 42; // why not
const DEFAULT_LEGEND_SIZE = 10;
const DEFAULT_LEGEND_PADDING = 8;
const DEFAULT_LEGEND_TEXT_SCALE = 8; // hack value to do fast estimation of length of string
const DEFAULT_HIGHLIGHT_TEXT_PADDING = 2;
const DEFAULT_STYLE = "@import url(https://fonts.googleapis.com/css?family=Source+Code+Pro:300); text{ font-family: 'Source Code Pro'; font-weight: 300; fill: " + display.text.black + "; } path, line { fill: none; stroke: " + display.lines.seperator + "; shape-rendering: crispEdges; } line { stroke-width: 1.5px } line.grid { stroke-width: 1.0px } line.axis-z { stroke-width: 2.0px } .legend text { font-size: 12px } .highlight { opacity: 0.66 } .highlight text { font-size: 12px } ";

export default function bars(id) {
  let classed = 'chart-bars', 
      background = null,
      width = DEFAULT_SIZE,
      height = null,
      margin = DEFAULT_MARGIN,
      style = DEFAULT_STYLE,
      scale = 1.0,
      logValue = 0,
      barSize = 6,
      fill = null,
      orientation = 'left',
      minValue = null,
      maxValue = null,
      inset = DEFAULT_INSET,
      tickFormatValue = null,
      tickFormatIndex = DEFAULT_TICK_FORMAT_INDEX,
      labelTime = null,
      tickCountValue = DEFAULT_TICK_COUNT,
      tickCountIndex = null,
      tickDisplayValue = null,
      grid = true,
      label = null,
      language = null,
      stacked = true,
      legend = null,
      highlight = null,
      displayTip = -1,
      value = function (d) {
        if (Array.isArray(d)) {
          return d;
        }
        if (typeof d === 'object') {
          d = d.v;
        }
        if (!Array.isArray(d)) {
            d = [ d ];
        }          

        return d;
      };

  
  function _impl(context) {
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);

    let ldg = legend;
    if (legend != null) {
      if (!Array.isArray(legend)) {
        ldg = [ legend ];
      } else if (legend.length === 0) {
        ldg = null;
      }
    }

    
    let hlt = highlight;
    if (highlight == null) {
      hlt = [];
    } else if (!Array.isArray(highlight)) {
      hlt = [ highlight ];
    }   
     
    //TODO: display highlight on value
    //TODO: display an exposed tip if displayTip
    
    let formatTime = null;
    if (labelTime != null) {
      let locale = timeFormatLocale(time(language).d3);
      formatTime = locale.format(labelTime);
    }

    let scaleFn = tickDisplayValue;
    
    if (scaleFn == null && logValue === 0) {
      let locale = formatLocale(units(language).d3);

      let defaultValueFormat = locale.format(DEFAULT_TICK_FORMAT_VALUE);
      let defaultValueFormatSi = locale.format(DEFAULT_TICK_FORMAT_VALUE_SI);
      let defaultValueFormatSmall = locale.format(DEFAULT_TICK_FORMAT_VALUE_SMALL);      
      
      if (tickFormatValue != null) {
        let fn = locale.format(tickFormatValue);
        scaleFn = (i) => fn(i); 
      } else {
        scaleFn = function (i) {
          if (i === 0.0) {
            return defaultValueFormat(i);
          } else if (i > 9999 || i <= 0.001) {
            return defaultValueFormatSi(i);  
          } else if (i < 1) {
            return defaultValueFormatSmall(i);  
          } else {
            return defaultValueFormat(i);
          }
        }
      }
    }

    let fnBarSize = (I) => barSize < 0.0 ? Math.max(I(-barSize), 1) : barSize;
       
    let ran = random(presentation10.standard.slice().reverse());
    let icolors = (d, i) => ran(i);
      
    selection.each(function() {
      let node = select(this);  
      let sh = height || Math.round(width * DEFAULT_ASPECT);

      let sid = null;
      if (id) sid = 'svg-' + id;
      let root = svg(sid).width(width).height(sh).margin(margin).scale(scale);
      let tnode = node;
      if (transition === true) {
        tnode = node.transition(context);
      }
      tnode.call(root);
      
      let elmS = node.select(root.self()).select(root.child());

      let tid = null;
      if (id) tid = 'tip-' + id;
      let rtip = tip(tid).html((d, i) => data);
      
      rtip.direction(orientation === 'top' ? 's' : 'n');   
              
      let st = style + ' ' + rtip.style();
      rtip.style(st);

      elmS.call(rtip);
    
      let g = elmS.select(_impl.self())
      if (g.empty()) {
        g = elmS.append('g').attr('class', classed).attr('id', id);
        g.append('g').attr('class', 'axis-v axis');
        g.append('g').attr('class', 'axis-i axis');
        g.append('g').attr('class', 'legend');
      }


      let twoD = false;
      
      let data = g.datum() || [];
      
      let vdata = data.map(function(d) {
        let a = value(d);
        if (stacked) {
          let t = 0.0;
          return a.map((v) => (t += v, t)).reverse();
        } else {
          return a;
        }
      });
      
      g.datum(vdata); // this rebind is required even though there is a following select
      let maxSeries = 1;
     
      let maxV = max(vdata, function (d) { 
        let l = d.length;
        
        if (l > 1) {
          maxSeries = Math.max(maxSeries, l);
          twoD = true;
        }        
        return max(d)
      });

      let minV = minValue;
      if (minV == null) {
        minV = min(vdata, (d) => min(d));
        if (minV > 0) {
          minV = logValue === 0 ? 0 : 1;
        }
      }
      
      let mm = [ minV, maxV ];
            
      if (mm[0] === mm[1]) mm[0] = 0;
      
      if (maxValue != null) mm[1] = maxValue;
      
      if (mm[0] === undefined) mm[0] = 0;
      if (mm[1] === undefined) mm[1] = DEFAULT_SCALE;

      function _makeFillFn() {
        let colors = () => fill;
        if (fill == null) {
          if (twoD) {
            // data has nested stacks, use the series presentation
            let rnd = random(presentation10.standard);
            colors = (d, i) => rnd(i);          
          } else {
            colors = () => presentation10.standard[0];
          }
        } else if (fill === 'series') {
          let rnd = random(presentation10.standard);
          colors = (d, i) => rnd(i);
        } else if (fill === 'global') {
          let rnd = random(presentation10.standard);
          let count = -1;
          colors = () => (count++, rnd(count));
        } else if (typeof fill === 'function') {
          colors = fill;
        } else if (Array.isArray(fill)) {
          let count = -1;
          colors = () => (count++, fill[ count % fill.length ])
        }
        return colors;  
      }

            
      let w = root.childWidth(),
          h = root.childHeight();
      
      if (ldg !== null) {
        h = h - DEFAULT_LEGEND_SIZE;
        let rg = g.select('g.legend');
        let lg = rg.attr('transform', 'translate(' + (w/2) + ',' + (h + DEFAULT_LEGEND_PADDING) + ')').selectAll('g').data(ldg);
        lg.exit().remove();
        let newlg = lg.enter().append('g');
        
        let colors = _makeFillFn();

        newlg.append('rect')
              .attr('width', DEFAULT_LEGEND_SIZE)
              .attr('height', DEFAULT_LEGEND_SIZE)
              .attr('fill', colors);

        newlg.append('text')
          .attr('dominant-baseline', 'central')
          .attr('y', DEFAULT_LEGEND_SIZE / 2)
          .attr('x', () => DEFAULT_LEGEND_SIZE + DEFAULT_LEGEND_PADDING);
              
        lg = newlg.merge(lg);

        lg.selectAll('text').text((d) => d);

        let lens = ldg.map((s) => s.length * DEFAULT_LEGEND_TEXT_SCALE + DEFAULT_LEGEND_SIZE + 2 * DEFAULT_LEGEND_PADDING);
        let clens = []
        let total = lens.reduce((p, c) => (clens.push(p) , p + c), 0);
        
        let offset = -total / 2;
        rg.selectAll('g').data(clens).attr('transform', (d) => 'translate(' + (offset + d) + ',0)');
      }            
      
      let colors = _makeFillFn();
            
      let rects = g.selectAll('g.stack').data(vdata);
      rects.exit().remove();
      rects = rects.enter().append('g').attr('class', 'stack').merge(rects);
            
      let sV = scaleLinear(); 
      if (logValue > 0) sV = scaleLog().base(logValue);
      let scaleV = sV.domain(mm); // .clamp(true)
      
      let sI = scaleLinear(); 
      let domainI = [ 0, DEFAULT_SCALE ];
      if (vdata.length > 4) {
        domainI = [ 0, vdata.length ];
      } else if (vdata.length > 0) {
        domainI = [ -1, vdata.length ]
      }
      let scaleI = sI.domain(domainI);

      let ticks = tickCountIndex;
      if (ticks == null) {
        ticks = Math.min(DEFAULT_TICK_COUNT, vdata.length - 1);
      }

      let labelFn = label;
      if (labelFn == null) {
        labelFn = function (i) {
          let d = data[i];
          if (d != null && d.l !== undefined) {
            if (formatTime != null ) {
              return formatTime(d.l);
            }
            return d.l;
          }
          if (formatTime != null ) {
            return formatTime(i);
          }
          return scaleI.tickFormat(ticks, tickFormatIndex)(i);
        };
      }

      
      if (transition === true) {
        rects = rects.transition(context);
      }  

      // negative values need a center line
      let aZ = g.select('line.axis-z');
      if (mm[0] < 0) {
        if (aZ.empty()) aZ = g.append('line').attr('class', 'axis-z axis grid');
        aZ.attr('stroke', '#000');
      } else {
        aZ.remove();
      }

      let v0 = 0.0,
          toI = 0.0,
          fromI = 0.0,
          gridSize = 0.0,
          fnAttrV = null,
          fnAttrVV = null,
          attrV = '',
          attrO = '',
          attrVV = '',
          attrIV = '',
          axisV = null,
          axisI = null,
          translateV = '',
          translateI = '';
            
      if (orientation === 'top' || orientation === 'left') {
        let toV = w;

        toI = h - inset;
        gridSize = inset / 2 - h;
        attrV = 'x';
        attrO = 'y';        
        attrVV = 'width';
        attrIV = 'height';
        axisV = axisBottom;
        axisI = axisLeft;  
        translateV = 'translate(0,' + (h - inset / 2) + ')';
        translateI = 'translate(' + (inset / 2) + ',0)';
        
        if (orientation === 'top') {
          toV = h; toI = w; fromI = inset;
          gridSize = inset / 2 - w;
          attrV = 'y'; attrO = 'x'; attrIV = 'width'; attrVV = 'height'; 
          axisV = axisLeft; axisI = axisTop;
          translateV = 'translate(' + inset / 2 + ', 0)';
          translateI = 'translate(0, ' + (inset / 2) + ')';
        }
        
        scaleI = scaleI.rangeRound([fromI, toI]);
        scaleV = scaleV.range([inset, toV]);


        v0 = scaleV(mm[0]);
        let t0 = scaleV(0);

        fnAttrV = (d) => mm[0] < 0 && d < 0 ? scaleV(d) : (mm[0] < 0 ? t0 : Math.min(scaleV(d), v0) );
        fnAttrVV = (d) => mm[0] < 0 && d < 0 ? t0 - scaleV(d) :  Math.max(scaleV(Math.abs(d)) - (mm[0] < 0 ? t0 : v0), 1);
      } else if (orientation === 'bottom' || orientation === 'right') {
        let toV = w - inset;
            
        toI = h - inset;
        gridSize = inset / 2 - h;
        attrV = 'x';
        attrO = 'y'; 
        attrVV = 'width';
        attrIV = 'height';
        axisV = axisBottom;
        axisI = axisRight;
        translateV = 'translate(0,' + (h - inset / 2) + ')';
        translateI = 'translate(' + (w - inset / 2) + ',0)';        
                
        if (orientation === 'bottom') {
          toV = h - inset; toI = w; 
          gridSize = inset / 2 - w;
          fromI = inset;
          attrV = 'y'; attrO = 'x'; attrIV = 'width'; attrVV = 'height';
          axisV = axisLeft; axisI = axisBottom;
          translateV = 'translate(' + inset / 2 + ', 0)';
          translateI = 'translate(0, ' + (h - inset / 2) + ')';          
        }        
        
        scaleI = scaleI.rangeRound([fromI, toI]);
        scaleV = scaleV.range([toV, 0]);

        v0 = scaleV(mm[0]);
        let t0 = scaleV(0);
                
        fnAttrV = (d) => mm[0] < 0 && d < 0 ? t0 : Math.min(scaleV(d), v0);
        fnAttrVV = (d) => mm[0] < 0 && d < 0 ? scaleV(d) - t0 : Math.max((mm[0] < 0 ? t0 : v0) - scaleV(Math.abs(d)), 1);
      }

      let aV = axisV(scaleV).ticks(tickCountValue, (tickFormatValue == null ? DEFAULT_TICK_FORMAT_VALUE : tickFormatValue));
      if (grid) {
        aV.tickSizeInner(gridSize);
      }
      aV.tickFormat(scaleFn);

      g.select('g.axis-v')
        .attr('transform', translateV)
        .call(aV)
        .selectAll('line')
          .attr('class', grid ? 'grid' : null);
      

      let aI = axisI(scaleI).ticks(ticks, tickFormatIndex);
      aI.tickValues(vdata.map((d,i) => i));
      aI.tickFormat(labelFn);
      
      g.select('g.axis-i').attr('transform', translateI).call(aI);
      
      let t0 = scaleV(0);
      if (!isFinite(t0)) t0 = 0.0; // e.g. log scales

      let c0 = t0 + 0.5;
      if (orientation === 'bottom' || orientation === 'top') {
        aZ.attr('y1', c0).attr('y2', c0).attr('x1', inset / 2).attr('x2', toI + inset / 2);
      } else {
        aZ.attr('x1', c0).attr('x2', c0).attr('y1', 0).attr('y2', toI + inset / 2);
      }

      let sz = fnBarSize(scaleI);

      let r = rects.attr('transform', (d, i) => 'translate(' + (attrV !== 'x' ? (scaleI(i) - sz/2) + ',0' : '0,'+ (scaleI(i) - sz/2) ) + ')')
                    .data((d) => (d == null) ? [] : d.map(value)).selectAll('rect').data((d) => d);
      r.exit().remove();
      r = r.enter()
            .append('rect')
              .on('mouseover', rtip.show)
              .on('mouseout', rtip.hide)
            .merge(r);
      r.attr(attrV, fnAttrV)
            .attr(attrVV, fnAttrVV)
            .attr(attrO, (d, i) => stacked ? 0 : (i - ((maxSeries - 1) / 2)) * sz) // center the series when not stacked
            .attr(attrIV, sz)
            .attr('fill', colors);

      let hls = g.selectAll('.highlight').data(hlt);
      hls.exit().remove();
      let nhls = hls.enter().append('g').attr('class', 'highlight');
      hls = nhls.merge(hls);
      
      nhls.append('rect').attr('class', 'marker');
      nhls.append('rect').attr('class', 'label-background');
      nhls.append('text').attr('class', 'label').attr('text-anchor', 'end');    
      
      hls.attr('transform', (d) => 'translate(' + ( attrV === 'x' ? (scaleV(d) + ',0') : ('0,' + scaleV(d)) ) + ')');
      hls.selectAll('rect.marker')
        .attr(attrVV, 2)
        .attr(attrO, fromI)
        .attr(attrIV, toI - fromI)
        .attr('fill', icolors);
      
      function textForData(d) {
        if (scaleFn != null) {
          return scaleFn(d)
        }
        return d + ''; // TODO: FLoating point?
      }
      
      hls.selectAll('rect.label-background')
        .attr(attrV, -DEFAULT_LEGEND_SIZE) // TODO: Position wrong for left / right charts
        .attr(attrO, (d) => toI - (DEFAULT_HIGHLIGHT_TEXT_PADDING * 2 + textForData(d).length * DEFAULT_LEGEND_TEXT_SCALE))
        .attr('height', DEFAULT_LEGEND_SIZE + 1)
        .attr('width', (d) => DEFAULT_HIGHLIGHT_TEXT_PADDING * 2 + textForData(d).length * DEFAULT_LEGEND_TEXT_SCALE)
        .attr('fill', icolors);
      
      hls.selectAll('text').attr(attrO, toI - DEFAULT_HIGHLIGHT_TEXT_PADDING).text((d) => textForData(d));
        
      if (displayTip > -1) {
        let no = r.nodes();
        if (no.length > 0) {
          rtip.show(no[0]); //TODO: incorrect layout on bricks.html 
        }
      }
    });
    
  }
  
  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); }

  _impl.id = function() {
    return id;
  };
    
  _impl.classed = function(value) {
    return arguments.length ? (classed = value, _impl) : classed;
  };
    
  _impl.background = function(value) {
    return arguments.length ? (background = value, _impl) : background;
  };

  _impl.size = function(value) {
    return arguments.length ? (width = value, height = null, _impl) : width;
  };
    
  _impl.width = function(value) {
    return arguments.length ? (width = value, _impl) : width;
  };  

  _impl.height = function(value) {
    return arguments.length ? (height = value, _impl) : height;
  }; 

  _impl.scale = function(value) {
    return arguments.length ? (scale = value, _impl) : scale;
  }; 

  _impl.margin = function(value) {
    return arguments.length ? (margin = value, _impl) : margin;
  };   

  _impl.logValue = function(value) {
    return arguments.length ? (logValue = value, _impl) : logValue;
  }; 

  // if > 0, pixels size. if < 0, relative to the interspacing [-1.0 to 0.0]
  _impl.barSize = function(value) {
    return arguments.length ? (barSize = value, _impl) : barSize;
  }; 

  _impl.fill = function(value) {
    return arguments.length ? (fill = value, _impl) : fill;
  };  

  _impl.orientation = function(value) {
    return arguments.length ? (orientation = value, _impl) : orientation;
  };  
  
  _impl.minValue = function(value) {
    return arguments.length ? (minValue = value, _impl) : minValue;
  };  

  _impl.maxValue = function(value) {
    return arguments.length ? (maxValue = value, _impl) : maxValue;
  };  

  _impl.inset = function(value) {
    return arguments.length ? (inset = value, _impl) : inset;
  };  

  _impl.tickCountIndex = function(value) {
    return arguments.length ? (tickCountIndex = value, _impl) : tickCountIndex;
  };  

  _impl.tickCountValue = function(value) {
    return arguments.length ? (tickCountValue = value, _impl) : tickCountValue;
  };  

  _impl.tickFormatIndex = function(value) {
    return arguments.length ? (tickFormatIndex = value, _impl) : tickFormatIndex;
  };  

  _impl.tickFormatValue = function(value) {
    return arguments.length ? (tickFormatValue = value, _impl) : tickFormatValue;
  };  

  _impl.tickDisplayValue = function(value) {
    return arguments.length ? (tickDisplayValue = value, _impl) : tickDisplayValue;
  };  

  _impl.style = function(value) {
    return arguments.length ? (style = value, _impl) : style;
  }; 

  _impl.grid = function(value) {
    return arguments.length ? (grid = value, _impl) : grid;
  };
  
  _impl.value = function(valuep) {
    return arguments.length ? (value = valuep, _impl) : value;
  };
  
  _impl.label = function(value) {
    return arguments.length ? (label = value, _impl) : label;
  };  
  
  _impl.labelTime = function(value) {
    return arguments.length ? (labelTime = value, _impl) : labelTime;
  };    
  
  _impl.language = function(value) {
    return arguments.length ? (language = value, _impl) : language;
  };   
  
  _impl.stacked = function(value) {
    return arguments.length ? (stacked = value, _impl) : stacked;
  };    
  
  _impl.legend = function(value) {
    return arguments.length ? (legend = value, _impl) : legend;
  };  
  
  _impl.displayTip = function(value) {
    return arguments.length ? (displayTip = value, _impl) : displayTip;
  };   
  
  _impl.highlight = function(value) {
    return arguments.length ? (highlight = value, _impl) : highlight;
  };    
            
  return _impl;
}