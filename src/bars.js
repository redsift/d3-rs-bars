
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import { scaleLinear, scaleLog } from 'd3-scale';
import { axisTop, axisRight, axisBottom, axisLeft } from 'd3-axis';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import { html as svg } from '@redsift/d3-rs-svg';

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

const DEFAULT_STYLE = "@import url(https://fonts.googleapis.com/css?family=Source+Code+Pro:300); text{ font-family: 'Source Code Pro'; font-weight: 300; fill: " + display.text.black + "; } path, line { fill: none; stroke: " + display.lines.seperator + "; shape-rendering: crispEdges; } line { stroke-width: 1.5px } line.grid { stroke-width: 1.0px } line.axis-z { stroke-width: 2.0px }";

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
      fill = presentation10.standard[0],
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
      defaultValueFormat = format(DEFAULT_TICK_FORMAT_VALUE),
      defaultValueFormatSi = format(DEFAULT_TICK_FORMAT_VALUE_SI),
      defaultValueFormatSmall = format(DEFAULT_TICK_FORMAT_VALUE_SMALL),
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

    let colors = () => fill;
    if (fill === 'series') {
      let rnd = random(presentation10.standard);
      colors = (d, i) => rnd(i.toString());
    } else if (fill === 'global') {
      let rnd = random(presentation10.standard);
      let count = -1;
      colors = () => (count++, rnd(count.toString()));
    } else if (typeof fill === 'function') {
      colors = fill;
    }

    let formatTime = null;
    if (labelTime != null) {
      formatTime = timeFormat(labelTime);
    }

    let fnBarSize = (I) => barSize < 0.0 ? Math.max(I(-barSize), 1) : barSize;

    selection.each(function() {
      let node = select(this);  
      let sh = height || Math.round(width * DEFAULT_ASPECT);

      let sid = null;
      if (id) sid = 'svg-' + id;
      let root = svg(sid).width(width).height(sh).margin(margin).scale(scale).style(style);
      let tnode = node;
      if (transition === true) {
        tnode = node.transition(context);
      }
      tnode.call(root);
      
      let elmS = node.select(root.self()).select(root.child());

      let w = root.childWidth(),
          h = root.childHeight();
      
      let g = elmS.select(_impl.self())
      if (g.empty()) {
        g = elmS.append('g').attr('class', classed).attr('id', id);
        g.append('g').attr('class', 'axis-v axis');
        g.append('g').attr('class', 'axis-i axis');
      }

      let data = g.datum() || [];
      let mm = extent(data, function(d) {
        let array = value(d);
        return array[0]; // this assume the data is ordered and stacked lowest to highest
      });
      
      if (mm[0] === mm [1]) mm[0] = 0;

      if (minValue != null) mm[0] = minValue;
      if (maxValue != null) mm[1] = maxValue;
      
      if (mm[0] === undefined) mm[0] = 0;
      if (mm[1] === undefined) mm[1] = DEFAULT_SCALE;
            
      let rects = g.selectAll('g.stack').data(data);
      rects.exit().remove();
      rects = rects.enter().append('g').attr('class', 'stack').merge(rects);
            
      let sV = scaleLinear(); 
      if (logValue > 0) sV = scaleLog().base(logValue);
      let scaleV = sV.domain(mm).clamp(true);

      let sI = scaleLinear(); 
      let scaleI = sI.domain([0, data.length > 0 ? data.length - 1 : DEFAULT_SCALE]);

      let ticks = tickCountIndex;
      if (ticks == null) {
        ticks = Math.min(DEFAULT_TICK_COUNT, data.length - 1);
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
      
      let scaleFn = tickDisplayValue;
      
      if (scaleFn == null && logValue === 0) {
        scaleFn = function (i) {
          if (tickFormatValue != null) {
            return scaleV.tickFormat()(i);
          } else if (i > 9999 || i <= 0.001) {
            return defaultValueFormatSi(i);  
          } else if (i < 1) {
            return defaultValueFormatSmall(i);  
          } else {
            return defaultValueFormat(i);
          }
        }
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
          gridSize = 0.0,
          fnAttrV = null,
          fnAttrVV = null,
          attrV = '',
          attrVV = '',
          attrIV = '',
          axisV = null,
          axisI = null,
          translateV = '',
          translateI = '';
            
      if (orientation === 'top' || orientation === 'left') {
        let toV = w,
            fromI = 0;

            
        toI = h - inset;
        gridSize = inset / 2 - h;
        attrV = 'x';
        attrVV = 'width';
        attrIV = 'height';
        axisV = axisBottom;
        axisI = axisLeft;  
        translateV = 'translate(0,' + (h - inset / 2) + ')';
        translateI = 'translate(' + (inset / 2) + ',0)';
        
        if (orientation === 'top') {
          toV = h; toI = w; fromI = inset;
          gridSize = inset / 2 - w;
          attrV = 'y'; attrIV = 'width'; attrVV = 'height'; 
          axisV = axisLeft; axisI = axisTop;
          translateV = 'translate(' + inset / 2 + ', 0)';
          translateI = 'translate(0, ' + (inset / 2) + ')';
        }
        
        scaleI = scaleI.rangeRound([fromI, toI]);
        scaleV = scaleV.range([inset, toV]);


        v0 = scaleV(0);
        fnAttrV = (d) => d < 0 ? scaleV(d) : v0;
        fnAttrVV = (d) => Math.max(scaleV(Math.abs(d)) - v0, 1);

      } else if (orientation === 'bottom' || orientation === 'right') {
        let toV = w - inset,
            fromI = 0;
            
        toI = h - inset;
        gridSize = inset / 2 - h;
        attrV = 'x';
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
          attrV = 'y'; attrIV = 'width'; attrVV = 'height';
          axisV = axisLeft; axisI = axisBottom;
          translateV = 'translate(' + inset / 2 + ', 0)';
          translateI = 'translate(0, ' + (h - inset / 2) + ')';          
        }        
        
        scaleI = scaleI.rangeRound([fromI, toI]);
        scaleV = scaleV.range([toV, 0]);

        v0 = scaleV(0);
        fnAttrV = (d) => Math.min(scaleV(d), v0);
        fnAttrVV = (d) => Math.max(v0 - scaleV(Math.abs(d)), 1);
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
      aI.tickFormat(labelFn);
      g.select('g.axis-i').attr('transform', translateI).call(aI);
      
      if (!isFinite(v0)) v0 = 0.0; // e.g. log scales

      let c0 = v0 + 0.5;
      if (orientation === 'bottom' || orientation === 'top') {
        aZ.attr('y1', c0).attr('y2', c0).attr('x1', inset / 2).attr('x2', toI + inset / 2);
      } else {
        aZ.attr('x1', c0).attr('x2', c0).attr('y1', 0).attr('y2', toI + inset / 2);
      }


      let sz = fnBarSize(scaleI);

      let r = rects.attr('transform', (d, i) => 'translate(' + (attrV !== 'x' ? (scaleI(i) - sz/2) + ',0' : '0,'+ (scaleI(i) - sz/2) ) + ')')
                    .data((d) => (d == null) ? [] : d.map(value)).selectAll('rect').data((d) => d);
      r.exit().remove();
      r = r.enter().append('rect').merge(r);
      r.attr(attrV, fnAttrV)
            .attr(attrVV, fnAttrVV)
            .attr(attrIV, sz)
            .attr('fill', colors);

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
  
          
  return _impl;
}