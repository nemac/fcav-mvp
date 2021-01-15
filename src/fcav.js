import React, { useRef, useState, useEffect, useDebugValue } from "react";
import L from "leaflet";
import config from "./config";
import {
  LayersControl,
  MapContainer,
  TileLayer,
  LayerGroup,
  Marker,
  useMap
} from "react-leaflet";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";
import nemacLogo from "./nemac_logo_white.png";
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';

const { Overlay } = LayersControl;

const center = [35.61540402873807, -82.56582048445668];
const zoom = 12;
const theme_color = "bg-white";
const baseMap = "streets-v11";
const startDate = new Date("2020-01-16");
const current_date = "2020-01-16";
const endDate = new Date("2020-02-17");
const selectedDate = "0";
const wmsLayers = config.juliandates.map(jd => {
  var date = toDate(parseInt(jd) + 7, 2020); //7 day offset
  var wmsdate = toWMSDate(date);
  return config.wms_template(wmsdate);
});
const dates = config.juliandates.map(jd => {
  var date = toDate(parseInt(jd) + 7, 2020);
  return date;
});

function toDate(julianDay, year) {
  // structure: YYYYMMDD
  julianDay = parseInt(julianDay);
  let monthIndex = 0;
  var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  for (let i = 0; i < dayCount.length; i++) {
    if (julianDay > dayCount[i + 1]) {
      monthIndex = i + 1;
    }
  }
  let day = julianDay - dayCount[monthIndex];
  let dateObj = new Date(year, monthIndex, day);
  //  console.log(monthIndex, day, year, dateObj);
  return dateObj;
}

function toWMSDate(dateObj, toHyphenate = false) {
  var fullDateString = dateObj.toString();
  var year = String(dateObj.getFullYear());
  var month = String(dateObj.getMonth() + 1);
  var day = String(dateObj.getDate());
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  if (toHyphenate) {
    var wmsString = year + "-" + month + "-" + day;
    return wmsString;
  } else {
    var wmsString = year + month + day;
    return wmsString;
  }
}


const icon = L.icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png"
});

function App() {
  const mapRef = useMap();
  console.log(mapRef);
  //const firstOverlayRef = useRef();
  //const secondOverlayRef = useRef();
  const [baseMaps, setBaseMaps] = useStateWithLabel(config.baseLayers, "baseMaps");
  const [activeBaseMap, setActiveBaseMap] = useStateWithLabel("Dark", "activeBaseMap");
  const [startDate, setStartDate] = useStateWithLabel(
    new Date("2020-01-16"),
    "startDate"
  );
  const [currentDate, setCurrentDate] = useStateWithLabel(
    "2020-01-16",
    "currentDate"
  );
  const [endDate, setEndDate] = useStateWithLabel(
    new Date("2020-02-17"),
    "endDate"
  );
  const [wmsLayers, setWMSLayers] = useStateWithLabel(
    config.juliandates.map(jd => {
      var date = toDate(parseInt(jd) + 7, 2020); //7 day offset
      var wmsdate = toWMSDate(date);
      return config.wms_template(wmsdate);
    }),
    "wmsLayers"
  );



  mapRef.on("baselayerchange", function(e) {
    setActiveBaseMap(e.name);
    //e.layer.bringToBack();
    console.log("baselayerchange");
  });

  //mapRef.on('load', function(){
  var wmsTest = L.tileLayer.wms(wmsLayers[0].baseUrl, wmsLayers[0].options);
  mapRef.addLayer(wmsTest);
  wmsTest.bringToFront();
  console.log(mapRef);
  //});

  /*const addLayers = () => {
    if (mapRef.current && firstOverlayRef.current) {
      const map = mapRef.current.leafletElement;
      const firstLayer = firstOverlayRef.current.leafletElement;
      const secondLayer = secondOverlayRef.current.leafletElement;
      [firstLayer, secondLayer].forEach(layer => map.addLayer(layer));
    }
  };

  const removeLayers = () => {
    if (mapRef.current && firstOverlayRef.current) {
      const map = mapRef.current.leafletElement;
      const firstLayer = firstOverlayRef.current.leafletElement;
      const secondLayer = secondOverlayRef.current.leafletElement;
      [firstLayer, secondLayer].forEach(layer => map.removeLayer(layer));
    }
  };*/
  const [product, setProduct] = useStateWithLabel("forwarn", "Product");

  const handleProductChange = (event) => {
    setProduct(event.target.value);
  };
  const handleBaseLayerChange = (event) => {
    var index = event.target.value;
    setActiveBaseMap(baseMaps[index].name);
    //var baseElement = baseMaps.find((event.target.value));
  //  console.log(baseElement);
    var baseLayer = L.tileLayer(baseMaps[index].url);
    mapRef.addLayer(baseLayer);
  };
  return (
    <div id = "UI">
      <AppBar position="static" color="primary">
        <Toolbar>
          <img src={nemacLogo} width="150" alt="deez nuts"></img>
          <FormControl variant="outlined" >
            <InputLabel shrink id="demo-simple-select-placeholder-label-label">
              Product
            </InputLabel>
            <Select
              labelId="fcav-product-select-label"
              id="fcav-product-select"
              value={product}
              onChange={handleProductChange}
              label="Product"
            >
              <MenuItem value="forwarn">
                <em>None</em>
              </MenuItem>
              <MenuItem value={"forwarn"}>FORWARN</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" >
            <InputLabel shrink id="demo-simple-select-placeholder-label-label">
              Base Layer
            </InputLabel>
            <Select
              labelId="fcav-product-select-label"
              id="fcav-product-select"
              value = {activeBaseMap.name}
              onChange={handleBaseLayerChange}
              label="Product"
            >
              {config.baseLayers.map((baseLayer, index) => (
                <MenuItem value={index}>{baseLayer.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
    </div>
  );
}

function useStateWithLabel(initialValue, name) {
  const [value, setValue] = useState(initialValue);
  useDebugValue(`${name}: ${value}`);
  return [value, setValue];
}

export function MapComponent() {
  //const mapComponentRef = useMap();
  //console.log(mapComponentRef);

  console.log("mapcomponent basemap: " + wmsLayers);
  return (
    <div>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true}>
        <App />
      </MapContainer>
    </div>
  );
}
