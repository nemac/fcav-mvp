import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg'

const options = [{
  name: 'Base Map',
  url: 'mapbox://styles/mapbox/streets-v11'
}, {
  name: 'Satellite',
  url: 'mapbox://styles/mapbox/satellite-v9'
}]



class Application extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      lng: -82.56582048445668,
      lat: 35.61540402873807,
      zoom: 12,
      active: options[0]
    };
  }
  componentDidMount() {
  const map = new mapboxgl.Map({
  container: this.mapContainer,
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [this.state.lng, this.state.lat],
  zoom: this.state.zoom
  });

  var geolocate = new mapboxgl.GeolocateControl();
  map.addControl(geolocate);

  map.on('load', function() {
    geolocate.trigger();
  });

  var layerList = document.getElementById('menu');
  var inputs = layerList.getElementsByTagName('input');
  function switchLayer(layer) {
  var layerId = layer.target.id;
  map.setStyle('mapbox://styles/mapbox/' + layerId);
  }

  for (var i = 0; i < inputs.length; i++) {
  inputs[i].onclick = switchLayer;
  }

  map.on('move', () => {
  this.setState({
  lng: map.getCenter().lng.toFixed(4),
  lat: map.getCenter().lat.toFixed(4),
  zoom: map.getZoom().toFixed(2)
  });
  });

}
render() {

  const renderOptions = (option, i) => {
        /*return (
          <label key={i} className="toggle-container">
            <input onChange={() => { this.switchLayer(); this.setState({ active: options[i]}) } } checked={option.url=== this.state.active.url} name="toggle" type="radio" />
            <div className="toggle txt-s py3 toggle--active-white">{option.name}</div>
          </label>
        );*/
      }

return (
<div>
<div ref={el => this.mapContainer = el} className="mapContainer" />
/*<div className="toggle-group absolute top left ml12 mt12 border border--2 border--white bg-white shadow-darken10 z1">
  //{options.map(renderOptions)}
//</div>*/
</div>
)
}
}

ReactDOM.render(<Application />, document.getElementById('app'));
