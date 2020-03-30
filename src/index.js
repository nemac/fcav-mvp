import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import nemacLogo from './nemac_trans_500.png'
import devLocations from './Development_Locations__Historical_Data_Only.geojson'

mapboxgl.accessToken = 'pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg'

class Application extends React.Component {
  dateToArray= event => {
    var layerid = event.currentTarget.value;
    var layeridstring = layerid.substring(0,4) + layerid.substring(5,7) + layerid.substring(8,10) + "_layer";
    console.log(layeridstring);
    for(var index in this.customLayers){
      var selectedLayer = layeridstring;
      //console.log(selectedLayer);
      var visibility = this.map.getLayoutProperty(selectedLayer, 'visibility');
      if (visibility === 'visible') {
        this.map.setLayoutProperty(selectedLayer, 'visibility', 'none');
        this.className = '';
      } else {
        this.className = 'active';
        this.map.setLayoutProperty(selectedLayer, 'visibility', 'visible');
      }
    }
        this.setState({current_date: layerid});
  }
  handleClick = event => {
    this.map.setStyle('mapbox://styles/mapbox/' + event.currentTarget.id);
    console.log(event.currentTarget.id);
    this.setState({ theme_color: event.currentTarget.getAttribute('themecolor')})
  }
  filterDay = event => {
    //console.log(event.currentTarget.value);
    var day = parseInt(event.currentTarget.value);
    console.log(day);
    for(var index in this.customLayers){
      var selectedLayer = this.customLayers[day].layer.id;
      console.log(selectedLayer);
      var visibility = this.map.getLayoutProperty(selectedLayer, 'visibility');
      if (visibility === 'visible') {
        this.map.setLayoutProperty(selectedLayer, 'visibility', 'none');
        this.className = '';
      } else {
        this.className = 'active';
        this.map.setLayoutProperty(selectedLayer, 'visibility', 'visible');
        this.setState({datesliderval: index});
      }
    }
    var layerid = this.customLayers[day].layer.id;
    var datestring = layerid.substring(0,4) + "-" + layerid.substring(4,6) + "-" + layerid.substring(6,8);
    this.setState({current_date: datestring});
    //var layer = this.customLayers[day];
    //console.log(layer);
    //var visibility = this.map.getLayoutProperty(layer.id, 'visibility');
    //if (visibility === 'visible') {
    //  this.map.setLayoutProperty(layer.layer.id, 'visibility', 'none');
    //  this.className = '';
    //} else {
    //  this.className = 'active';
    //  this.map.setLayoutProperty(layer.layer.id, 'visibility', 'visible');
    //}
    //console.log(layer);
    //console.log('devlocations',['==', ['string', ['get', 'enddate']], year]);
    //this.map.setFilter('devlocations',['==', ['number', ['get', 'enddate']], year])
  }
  constructor(props){
    super(props);
    this.state = {
      lng: -82.56582048445668,
      lat: 35.61540402873807,
      zoom: 12,
      theme_color: "bg-white",
      start_date: "2020-01-16",
      current_date: "2020-01-16",
      end_date: "2020-02-17",
      datesliderval: "0"
    };
    this.handleClick = this.handleClick.bind(this)
    this.filterDay = this.filterDay.bind(this)
    this.dateToArray = this.dateToArray.bind(this)
    //this.customLayers = this.customLayers.bind(this)
  }
  componentDidMount() {
  const map = new mapboxgl.Map({
  container: this.mapContainer,
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [this.state.lng, this.state.lat],
  zoom: this.state.zoom
  });
  this.map = map;
  window.map = map;
  var geolocate = new mapboxgl.GeolocateControl();
  map.addControl(geolocate);
  var customLayers = [{
    source: {
      'type': 'raster',
      'tiles': [
        'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_20200217_1YR_FW2&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
      ],
      'tileSize': 1024
    },
    layer: {
      'id': '20200217_layer',
      'type': 'raster',
      'source': '20200217_source',
      'layout': {
        'visibility' : 'visible'
      },
      'paint': {}
    }
  },
  {
    //'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_20200209_1YR_FW2MaskForForest&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
    source: {
      'type': 'raster',
      'tiles': [
        'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_20200209_1YR_FW2&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
      ],
      'tileSize': 1024
    },
    layer: {
      'id': '20200209_layer',
      'type': 'raster',
      'source': '20200209_source',
      'layout': {
        'visibility' : 'none'
      },
      'paint': {}
    }
  },
  {
    //'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_20200209_1YR_FW2MaskForForest&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
    source: {
      'type': 'raster',
      'tiles': [
        'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_20200201_1YR_FW2&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
      ],
      'tileSize': 1024
    },
    layer: {
      'id': '20200201_layer',
      'type': 'raster',
      'source': '20200201_source',
      'layout': {
        'visibility' : 'none'
      },
      'paint': {}
    }
  },
  {
    //'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_20200209_1YR_FW2MaskForForest&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
    source: {
      'type': 'raster',
      'tiles': [
        'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_20200124_1YR_FW2&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
      ],
      'tileSize': 1024
    },
    layer: {
      'id': '20200124_layer',
      'type': 'raster',
      'source': '20200124_source',
      'layout': {
        'visibility' : 'none'
      },
      'paint': {}
    }
  },
  {
    //'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_20200209_1YR_FW2MaskForForest&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
    source: {
      'type': 'raster',
      'tiles': [
        'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_2020116_1YR_FW2&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
      ],
      'tileSize': 1024
    },
    layer: {
      'id': '20200116_layer',
      'type': 'raster',
      'source': '20200116_source',
      'layout': {
        'visibility' : 'none'
      },
      'paint': {}
    }
  }
]
this.customLayers = customLayers;
  map.on('style.load', function() {
      // Always add the same custom soruces and layers after a style change

      for (var i = 0; i < customLayers.length; i++) {
          var me = customLayers[i]
          map.addSource(me.layer.source, me.source);
          map.addLayer(me.layer, 'aeroway-line')
      }
  });

  map.on('load', function() {
    /*map.addSource('developments', {
      type: 'geojson',
      data: devLocations,
      buffer: 0,
      maxzoom: 12
    });*/ //development layer
    /*map.addSource('20200217_source', {
      'type': 'raster',
      'tiles': [
        'https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_20200217_1YR_FW2MaskForForest&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256'
      ],
      'tileSize': 256
    });*/
    geolocate.trigger();
    /*map.addLayer({
      id:'devlocations',
      type: 'symbol',
      source:
        'developments'
      ,
      layout: {
        'icon-image': 'rocket-15',
        'icon-size': 2
      },
      //filter: ['==', ['number', ['get', 'enddate']], 2007]
    });*/
    /*map.addLayer(
      {
        'id': '20200217_layer',
        'type': 'raster',
        'source': '20200217_source',
        'paint': {}
      },
      'aeroway-line'
    );*/
  });

  map.on('move', () => {
    this.setState({
      lng: map.getCenter().lng.toFixed(4),
      lat: map.getCenter().lat.toFixed(4),
      zoom: map.getZoom().toFixed(2)
    });
  });

  /*map.on('click', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
                layers: ['devlocations']
            });
            if (!features.length) {
                return;
            }
            var feature = features[0];

            var popup = new mapboxgl.Popup()
              .setLngLat(map.unproject(e.point))
              .setHTML('<h3>Development Details</h3>' +
                '<ul>' +
                '<li>Name: <b>' + feature.properties.name + '</b></li>' +
                '<li>Development Start Date: <b>' + feature.properties.startdate + '</b></li>' +
                '<li>Development End Date: <b>' + feature.properties.enddate + '</b></li>' +
                '</ul>')
            .addTo(map);
  });*/ //development locations

}
render() {
  return (
    <div>
    <div ref={el => this.mapContainer = el} className="mapContainer" />
    <div className='grid absolute'>
      <div className='col'>
        <div className={`ml12 mt12 border border--2 border--white bg-white shadow-darken10  round-tl-bold round-bl-bold bg ${this.state.theme_color}`}>
          <img src={nemacLogo} width="150" alt = "deez nuts"></img>
        </div>
      </div>
      <div className='col'>
        <div className={`toggle-group bottom hmax60 ml12 mt12 border border--2 border--white shadow-darken10 unround-tl unround-bl unround-br bg ${this.state.theme_color}`}>
          <div className='txt-m absolute middle pl6'>
            Base Map:
          </div>
          <label className='toggle-container mt24'>
            <input defaultChecked name='toggle-1' type='radio' id="streets-v11" themecolor="bg-white" onClick={this.handleClick}/>
            <div className='toggle'>Streets</div>
          </label>
          <label className='toggle-container mt24'>
            <input name='toggle-1' type='radio' id="light-v10" themecolor="bg-white" onClick={this.handleClick}/>
              <div className='toggle'>Light</div>
          </label>
          <label className='toggle-container mt24'>
            <input name='toggle-1' type='radio' id="dark-v10" themecolor="bg-black" onClick={this.handleClick} />
            <div className='toggle'>Dark</div>
          </label>
          <label className='toggle-container mt24'>
            <input name='toggle-1' type='radio' id="outdoors-v11" themecolor="bg-white" onClick={this.handleClick}/>
            <div className='toggle'>Outdoors</div>
          </label>
          <label className='toggle-container mt24'>
            <input name='toggle-1' type='radio' id="satellite-v9" themecolor="bg-black" onClick={this.handleClick}/>
            <div className='toggle'>Satellite</div>
          </label>
        </div>
        <div className='col'>
          <div className={` ml12 mt12 bottom border border--2 border--white bg-white shadow-darken10  round-tl-bold round-bl-bold bg ${this.state.theme_color}`}>
            <div className='mr6 mb6 inline-block left'>
            Forest change (8-day period):
              <input className="input w150" value={this.state.current_date} type="date" onChange={this.dateToArray} min={this.state.start_date} max={this.state.end_date}/>
            </div>
            <div className='range mr5 mb6 inline-block right'>
              <input type='range' min="0" max = {"4"} step="1" defaultValue = {"4"} value={this.state.value} onChange={this.filterDay}/>
            </div>
          </div>
        </div>
      </div>


    </div>

  </div>
    )
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));
