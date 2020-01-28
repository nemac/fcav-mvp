import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg'

class Application extends React.Component {
  handleClick = event => {
    this.map.setStyle('mapbox://styles/mapbox/' + event.currentTarget.id);
    console.log(event.currentTarget.id);
  }
  constructor(props){
    super(props);
    this.state = {
      lng: -82.56582048445668,
      lat: 35.61540402873807,
      zoom: 12
    };
    this.handleClick = this.handleClick.bind(this)
  }
  componentDidMount() {
  const map = new mapboxgl.Map({
  container: this.mapContainer,
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [this.state.lng, this.state.lat],
  zoom: this.state.zoom
  });
  this.map = map;
  var geolocate = new mapboxgl.GeolocateControl();
  map.addControl(geolocate);

  map.on('load', function() {
    geolocate.trigger();
  });

  map.on('move', () => {
    this.setState({
      lng: map.getCenter().lng.toFixed(4),
      lat: map.getCenter().lat.toFixed(4),
      zoom: map.getZoom().toFixed(2)
    });
  });
}
render() {
  return (
    <div>
    <div ref={el => this.mapContainer = el} className="mapContainer" />
    <div className='grid absolute'>
      <div className='bg-blue  ml12 mt12 border border--2 border--white bg-white shadow-darken10  round-tl-bold round-bl-bold'>
        <img src="https://www.drupalasheville.com/sites/default/files/styles/large/public/2016-05/nemac.png?itok=cF__xuhM" width="150"></img>
      </div>
      <div className='toggle-group bottom hmax60 ml12 mt12 border border--2 border--white bg-white shadow-darken10 unround-tl unround-bl unround-br'>
        <label className='toggle-container mt12'>
          <input defaultChecked name='toggle-1' type='radio' id="streets-v11" onClick={this.handleClick}/>
          <div className='toggle'>Streets</div>
        </label>
        <label className='toggle-container mt12'>
          <input name='toggle-1' type='radio' id="light-v10" onClick={this.handleClick}/>
          <div className='toggle'>Light</div>
        </label>
        <label className='toggle-container mt12'>
          <input name='toggle-1' type='radio' id="dark-v10" onClick={this.handleClick} />
          <div className='toggle'>Dark</div>
        </label>
        <label className='toggle-container mt12'>
          <input name='toggle-1' type='radio' id="outdoors-v11" onClick={this.handleClick}/>
          <div className='toggle'>Outdoors</div>
        </label>
        <label className='toggle-container mt12'>
          <input name='toggle-1' type='radio' id="satellite-v9" onClick={this.handleClick}/>
          <div className='toggle'>Satellite</div>
        </label>
      </div>
    </div>
  </div>
    )
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));
