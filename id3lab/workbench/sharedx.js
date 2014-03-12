var ipy = require('ipy_node');
var id3 = require('id3');
var d3 = require('d3');
var _ = require('underscore');

var Line = id3.Line;
var Figure = id3.Figure;
var Candlestick = id3.Candlestick;
var Marker = id3.Marker;
var Layer = id3.Layer;
var Legend = id3.Legend;
var lab = id3.lab;

function get_notebook_model(pathname) {
    var parts = pathname.split('/');
    var path = [];
    var notebook_name = '';
    for(var i=2; i < parts.length; i++) {
        var bit = parts[i];
        if (bit.indexOf('.ipynb') == bit.length - 6) {
            notebook_name = bit;
            break;
        }
        path.push(bit);
    }
    notebook_path = path.join('/');
    notebook_path = notebook_path.split('/').map(decodeURIComponent).join('/')
    notebook_name = notebook_name.split('/').map(decodeURIComponent).join('/')
    return {'path':notebook_path, 'name':notebook_name}
}

var notebook_model = get_notebook_model(window.location.pathname);
var base_url = window.location.origin;

lab.kernel_execute(base_url, notebook_model.path, notebook_model.name, main);

// runs in globa scope
function main(out) {
  var json = out.content.data['application/json'];
  var json = JSON.parse(json);

  var stations = json.stations;

  var charts = d3.select('#charts');
  var focus_svg = d3.select('#focus');

  // instantiate the objects
  keys = Object.keys(stations);
  var figs = keys.map(function(key) {
      var fig = lab.station_fig(stations[key], charts);
      return fig;
  });

  // axis and grids
  var fig = figs[0];
  fig.default_layout();
  figs.slice(1, figs.length).forEach(function (f) {
      f.axes_y();
      f.grid(fig.xaxis);
  });

  // focus is still kind of kludgey
  var focus = Figure();
  focus
    .margin({'left':40})
    .height(100)
    .index(stations[keys[0]].index);

  focus(focus_svg);
  var focus_data = fig.layers[0].data();
  if(focus_data.close) {
    // handle OHLC
    focus_data = focus_data.close;
  }
  focus.layer(Line().data(focus_data), 'focus');
  focus.axes_x({orient:'bottom'});
  focus.grid();

  var brush = focus.brush();

  // attach brush to each fig
  figs.forEach(function(f) { f.x.attach(brush); });

  // legend
  var legend = d3.select('#legend');
  var l = Legend();
  l.layer(fig.layers);
  l(legend);
  $('#legend').draggable({'cursor':'move'});

  // self brushing
  function selfbrush(f) {
    var fbrush = f.brush();
    fbrush.on('brushend.clear', function() {
      var domain = fbrush.extent();
      domain = _.map(domain, Math.round); // brush should always round domain?
      if (domain[1] - domain[0] < 10) {
        // don't allow brushing less than 10
        fbrush.clear();
        fbrush(fbrush.g);
        return;
      }
      brush.extent(domain);
      brush(brush.g)
      // this should have to be called here
      // this is another issue with not abstracting shared axis
      figs.forEach(function(f) { f.x.change(domain); });
      // when self brushing, remove selection after we show it
      fbrush.clear();
      fbrush(fbrush.g);
    });
  }
  figs.forEach(selfbrush);

  updateWindow();
};

function updateWindow() {
    var width = window.innerWidth - 60;
    var height = (window.innerHeight - 200)  / figs.length;
    figs.forEach(function(f) { f.width(width).height(height); })
    focus.width(width);
    // hack to get grids to redraw and use updated tickValues
    figs.forEach(function(f) { f.x.change(f.x.domain());})
    focus.x.change(focus.x.domain()); 
}

var doit;
window.onresize = function(){
  clearTimeout(doit);
  doit = setTimeout(updateWindow, 100);
};
