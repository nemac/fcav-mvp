import React, { useRef } from "react";
import ReactDOM from "react-dom";
import nemacLogo from "./nemac_trans_500.png";
import config from "./config";
import { MapContainer, Marker, Popup, TileLayer, LayersControl } from "react-leaflet";
import { Icon } from "leaflet";
import Button from '@material-ui/core/Button';

const mapboxAccessToken = "pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg";


Date.prototype.isLeapYear = function() {
    var year = this.getFullYear();
    if ((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
};
// Get Day of Year
Date.prototype.getDOY = function() {
    var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var mn = this.getMonth();
    var dn = this.getDate();
    var dayOfYear = dayCount[mn] + dn;
    if (mn > 1 && this.isLeapYear()) dayOfYear++;
    return dayOfYear;
};

function toDate(julianDay, year) {
  // structure: YYYYMMDD
  julianDay = parseInt(julianDay);
  let monthIndex = 0;
  var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  for(let i = 0; i < dayCount.length; i++){
    if(julianDay > dayCount[i+1]){
      monthIndex = i + 1;
    }
  }
  let day = julianDay - dayCount[monthIndex];
  let dateObj = new Date(year, monthIndex, day);
//  console.log(monthIndex, day, year, dateObj);
  return dateObj;
}

function toWMSDate(dateObj, toHyphenate=false) {
  var fullDateString = dateObj.toString();
  var year = String(dateObj.getFullYear());
  var month = String(dateObj.getMonth() + 1);
  var day = String(dateObj.getDate());
  if(month.length < 2){
    month = "0" + month;
  }
  if(day.length < 2){
    day = "0" + day;
  }
  if(toHyphenate){
    var wmsString = year + "-" + month + "-" + day;
    return wmsString;
  }
  else{
    var wmsString = year + month + day;
    return wmsString;
  }

}

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -82.56582048445668,
      lat: 35.61540402873807,
      zoom: 12,
      theme_color: "bg-white",
      baseMap: "streets-v11",
      startDate: new Date("2020-01-16"),
      current_date: "2020-01-16",
      endDate: new Date("2020-02-17"),
      selectedDate: "0",
      wmsLayers : config.juliandates.map(jd => {
        var date = toDate(parseInt(jd)+7, 2020); //7 day offset
        var wmsdate = toWMSDate(date);
        return config.wms_template(wmsdate);
      }),
      dates: config.juliandates.map(jd => {
        var date = toDate(parseInt(jd)+7, 2020);
        return date;
      }),
      loadedLayers: this.loadInitialLayers(this.wmsLayers),
    };
    this.state.dateRange = this.getDateRange(this.state.startDate, this.state.endDate);
    this.state.selectedDate = this.state.dateRange[0]
    this.handleClick = this.handleClick.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.setStartDate = this.setStartDate.bind(this);
    this.state.wmsLayersRange = this.getWMSDateRange(this.state.startDate, this.state.endDate);
    this.loadInitialLayers = this.loadInitialLayers.bind(this);
  }
  setStartDate = (event) => {
    var layerid = event.currentTarget.value;
    var layeridstring =
      layerid.substring(0, 4) +
      layerid.substring(5, 7) +
      layerid.substring(8, 10) +
      "_layer";
//    console.log(layerid);
    var startDate = new Date(layerid.substring(0, 4), parseInt(layerid.substring(5, 7))-1, layerid.substring(8, 10));
    this.setState({
      startDate: new Date(layerid.substring(0, 4), parseInt(layerid.substring(5, 7))-1, layerid.substring(8, 10)),
      dateRange: this.getDateRange(startDate, this.state.endDate),
      wmsLayersRange: this.getWMSDateRange(startDate, this.state.endDate)
    });
  };
  setEndDate = (event) => {
    var layerid = event.currentTarget.value;
    var layeridstring =
      layerid.substring(0, 4) +
      layerid.substring(5, 7) +
      layerid.substring(8, 10) +
      "_layer";
//    console.log(layerid);
    var endDate = new Date(layerid.substring(0, 4), parseInt(layerid.substring(5, 7))-1, layerid.substring(8, 10));
    this.setState({
      endDate: new Date(layerid.substring(0, 4), parseInt(layerid.substring(5, 7))-1, layerid.substring(8, 10)),
      dateRange: this.getDateRange(this.state.startDate, endDate),
      wmsLayersRange: this.getWMSDateRange(this.state.startDate, endDate)
    });
  };
  getDateRange = (startDate, endDate) => {
    var startIndex = -1;
    var endIndex = -1;
    for(var index = 0; index < this.state.dates.length; index++){
      if(this.state.dates[index] >= startDate && startIndex === -1){
        startIndex = index;
      }
      if(this.state.dates[index] >= endDate && endIndex === -1){
        endIndex = index-1;
      }
    }
    if(endIndex === -1){
      endIndex = this.state.dates.length - 1;
    }
    var dateRange = this.state.dates;
    var newDateRange = dateRange.slice(startIndex, endIndex+1);
    console.log(newDateRange);
    return newDateRange;
  }
  getWMSDateRange = (startDate, endDate) => {
    var startIndex = -1;
    var endIndex = -1;
    for(var index = 0; index < this.state.dates.length; index++){
      if(this.state.dates[index] >= startDate && startIndex === -1){
        startIndex = index;
      }
      if(this.state.dates[index] >= endDate && endIndex === -1){
        endIndex = index-1;
      }
    }
    if(endIndex === -1){
      endIndex = this.state.dates.length - 1;
    }
    var wmsLayers = this.state.wmsLayers;
    var newWMSLayers = wmsLayers.slice(startIndex, endIndex+1);
    console.log(newWMSLayers);
    this.loadInitialLayers(newWMSLayers);
    return newWMSLayers;
  }
  handleClick = (event) => {
    //this.map.setStyle("mapbox://styles/mapbox/" + event.currentTarget.id);
    this.setState({
      baseMap: event.currentTarget.id,
    });
//    console.log(event.currentTarget.id);
    this.setState({
      theme_color: event.currentTarget.getAttribute("themecolor"),
    });
    //this.state.wmsLayersRange.forEach(e => {
      //this.map.addSource(e.layer.source, e.source);
  //    this.map.addLayer(e.layer);
  //  })
    //var initialLayer = this.state.dateRange.indexOf(this.state.selectedDate)
    //this.map.setLayoutProperty(this.state.wmsLayersRange[initialLayer].layer.id, "visibility", "visible");
  };
  loadInitialLayers = (wmsLayers) => {
    const map = useRef()
    console.log(this.map);
    for(var index in wmsLayers){
      //this.map.addSource(wmsLayers.source);
      //this.map.addLayer(wmsLayers.layer);
      //console.log("added");
    }
  };
handleSliderChange = (event) => {
    var index = parseInt(event.currentTarget.value);
    this.setState({
      selectedDate: this.state.dateRange[index],
    })
    console.log(index);
    var selectedLayer = this.state.wmsLayersRange[index];
    console.log("Layer to load: " + selectedLayer.layer.id);
    //if(!this.map.getLayer(selectedLayer.layer.id)){ //layer doesnt exist, lets add it
  //    this.map.addSource(selectedLayer.layer.source, selectedLayer.source);
  //    this.map.addLayer(selectedLayer.layer);
  //    this.setState(
//        { loadedLayers: [...this.state.loadedLayers, selectedLayer] }
  //    )
  //  }
    this.state.wmsLayersRange.forEach(e => {
      //this.map.setLayoutProperty(e.layer.id, "visibility", "none");
    })
    //this.map.setLayoutProperty(selectedLayer.layer.id, "visibility", "visible");
    //var currentLayers =
//    console.log(day);
    /*for (var index in this.customLayers) {
      var selectedLayer = this.customLayers[day].layer.id;
//      console.log(selectedLayer);
//      var visibility = this.map.getLayoutProperty(selectedLayer, "visibility");
        var visibility = "visible";
      if (visibility === "visible") {
        //this.map.setLayoutProperty(selectedLayer, "visibility", "none");
        this.className = "";
      } else {
        this.className = "active";
        //this.map.setLayoutProperty(selectedLayer, "visibility", "visible");
        this.setState({
          datesliderval: index,
        });
      }
    }
    var layerid = this.customLayers[day].layer.id;
    var datestring =
      layerid.substring(0, 4) +
      "-" +
      layerid.substring(4, 6) +
      "-" +
      layerid.substring(6, 8);
    this.setState({
      current_date: datestring,
    });*/
  };
  componentDidMount() {
    /*const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
    });
    this.map = map;
    window.map = map;
    var geolocate = new mapboxgl.GeolocateControl();
    map.addControl(geolocate);
        //console.log(config.wms_template(20200217));
    //var jd = config.juliandates.map(date => julian.toDate("20" + date));
    var sampleDate = toDate("033", 2020);
    toWMSDate(sampleDate);*/
/*    var customLayers = config.juliandates.map(jd => {
      var date = toDate(jd, 2020);
      var wmsdate = toWMSDate(date);
      return config.wms_template(wmsdate);
    });*/
    ////console.log(this.state.wmsLayers);
//    this.customLayers = customLayers;
/*    map.on("style.load", () => {
      // Always add the same custom soruces and layers after a style change

      for (var i = 0; i < customLayers.length; i++) {
        var me = customLayers[i];
        ////map.addSource(me.layer.source, me.source);
        if (this.state.chosenMap !== "satellite-v9") {
          ////map.addLayer(me.layer, "aeroway-line");
        } else {
          ////map.addLayer(me.layer);
        }
      }
    });*/
    /*let self = this;
    map.on("load", function () {
      geolocate.trigger();
      self.state.wmsLayersRange.forEach(e => {
        this.addSource(e.layer.source, e.source);
        this.addLayer(e.layer);
      })
      var initialLayer = self.state.dateRange.indexOf(self.state.selectedDate)
      this.setLayoutProperty(self.state.wmsLayersRange[initialLayer].layer.id, "visibility", "visible");
    });

    map.on("move", () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
    });*/
  }
  render() {
    return (
      <div>
        <MapContainer center={[this.state.lat, this.state.lng]} zoom={13} scrollWheelZoom={false}>
          <LayersControl position="topright">
             <LayersControl.BaseLayer checked name="Streets">
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url={"https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                  //url={"https://api.mapbox.com/styles/v1/mapbox/" + this.state.baseMap + "/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Light">
                 <TileLayer
                   attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                   url={"https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                   //url={"https://api.mapbox.com/styles/v1/mapbox/" + this.state.baseMap + "/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                 />
               </LayersControl.BaseLayer>
               <LayersControl.BaseLayer name="Dark">
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url={"https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                    //url={"https://api.mapbox.com/styles/v1/mapbox/" + this.state.baseMap + "/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Outdoors">
                   <TileLayer
                     attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                     url={"https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                     //url={"https://api.mapbox.com/styles/v1/mapbox/" + this.state.baseMap + "/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                   />
                 </LayersControl.BaseLayer>
                 <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      url={"https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                      //url={"https://api.mapbox.com/styles/v1/mapbox/" + this.state.baseMap + "/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg"}
                    />
                  </LayersControl.BaseLayer>
              </LayersControl>
          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
        <div className="grid absolute">
          <div className="col">
            <div
              className={`ml12 mt12 border border--2 border--white bg-white shadow-darken10  round-tl-bold round-bl-bold bg ${this.state.theme_color}`}
            >
              <img src={nemacLogo} width="150" alt="deez nuts"></img>
            </div>
          </div>

            <div className="col">
              <div
                className={` ml12 mt12 bottom border border--2 border--white bg-white shadow-darken10  round-tl-bold round-bl-bold bg ${this.state.theme_color}`}
              >
                <div className="mr6 mb6 inline-block left">
                  Start Date:
                  <input
                    className="input w150"
                    value={toWMSDate(this.state.startDate, true)}
                    type="date"
                    onChange={this.setStartDate}
                    min={"2020-01-01"}
                    max={this.state.endDate}
                  />
                </div>
                <div className="mr6 mb6 inline-block left">
                  End Date:
                  <input
                    className="input w150"
                    value={toWMSDate(this.state.endDate, true)}
                    type="date"
                    onChange={this.setEndDate}
                    min={this.state.startDate}
                    max={"2020-12-31"}
                  />
                </div>
                <div className="range mr5 mb6 inline-block right">
                  <input
                    type="range"
                    min="0"
                    max={this.state.dateRange.length-1}
                    step="1"
                    value={this.state.dateRange.indexOf(this.state.selectedDate)}
                    onChange={this.handleSliderChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

ReactDOM.render(<Application />, document.getElementById("app"));
