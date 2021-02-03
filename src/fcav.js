import React, { useState, useEffect, useDebugValue } from "react";
import L from "leaflet";
import config from "./config";
import {
  MapContainer,
  useMap
} from "react-leaflet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import nemacLogo from "./nemac_logo_white.png";
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const center = [35.61540402873807, -82.56582048445668];
const zoom = 12;

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
  return dateObj;
}

function toWMSDate(dateObj, toHyphenate = false) {
  var year = String(dateObj.getFullYear());
  var month = String(dateObj.getMonth() + 1);
  var day = String(dateObj.getDate());
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  var wmsString = "";
  if (toHyphenate) {
    wmsString = year + "-" + month + "-" + day;
    return wmsString;
  }
  else {
    wmsString = year + month + day;
    return wmsString;
  }
}

function App() {

  const mapRef = useMap();

  const [baseMaps] = useStateWithLabel(config.baseLayers, "baseMaps");
  const [activeBaseMap, setActiveBaseMap] = useStateWithLabel(config.baseLayers[2], "activeBaseMap");

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

  const dates = config.juliandates.map(jd => {
    var date = toDate(parseInt(jd)+7, 2020);
    return date;
  });

  const loadInitialLayers = (wmsLayers) => {
    for(var index in wmsLayers){
      var wmsLayer = L.tileLayer.wms(wmsLayers[index].baseUrl, wmsLayers[index].options);
      mapRef.addLayer(wmsLayer);
      wmsLayer.bringToFront();
    }
  };

  const getDateRange = (startDate, endDate) => {
    var startIndex = -1;
    var endIndex = -1;
    for(var index = 0; index < dates.length; index++){
      if(dates[index] >= startDate && startIndex === -1){
        startIndex = index;
      }
      if(dates[index] >= endDate && endIndex === -1){
        endIndex = index-1;
      }
    }
    if(endIndex === -1){
      endIndex = dates.length - 1;
    }
    var dateRange = dates;
    var newDateRange = dateRange.slice(startIndex, endIndex+1);
    console.log(newDateRange);
    return newDateRange;
  }

  const getWMSDateRange = (startDate, endDate) => {
    console.log("dates: ", dates);
    var startIndex = -1;
    var endIndex = -1;
    for(var index = 0; index < dates.length; index++){
      if(dates[index] >= startDate && startIndex === -1){
        startIndex = index;
      }
      if(dates[index] >= endDate && endIndex === -1){
        endIndex = index-1;
      }
    }
    if(endIndex === -1){
      endIndex = dates.length - 1;
    }
    var newWMSLayers = wmsLayers.slice(startIndex, endIndex+1);
    console.log(newWMSLayers);
    loadInitialLayers(newWMSLayers);
    return newWMSLayers;
  }

  const [dateRange, setDateRange] = useStateWithLabel(
    getDateRange(startDate, endDate), "dateRange"
  );

  const [wmsLayersRange, setWmsLayersRange] = useStateWithLabel(
    getWMSDateRange(startDate, endDate), "wmsLayersRange"
  );

  mapRef.on("baselayerchange", function(e) {
    console.log("baselayerchange");
  });

  const [product, setProduct] = useStateWithLabel("forwarn", "Product");

  useEffect(() => { //initialize map
    var baseLayer = L.tileLayer(activeBaseMap.url);
    activeBaseMap.layer = baseLayer;
    mapRef.addLayer(baseLayer);
    console.log(mapRef);
  }, []);

  const handleProductChange = (event) => {
    setProduct(event.target.value);
  };

  const handleBaseLayerChange = (event) => {
    var index = event.target.value;
    var currLayer = activeBaseMap.layer;
    console.log("current layer:",currLayer);
    if(currLayer!=null){
      mapRef.removeLayer(currLayer);
    }

    console.log("Removing ", currLayer);
    mapRef.eachLayer(function(layer){
      console.log(layer);
    })

    var baseLayer = L.tileLayer(baseMaps[index].url);
    baseMaps[index].layer = baseLayer;
    setActiveBaseMap(baseMaps[index]);
    console.log("adding ", baseLayer);
    mapRef.addLayer(baseLayer);
    activeBaseMap.layer = baseLayer;
    baseLayer.bringToBack();
    mapRef.eachLayer(function(layer){
      console.log(layer);
    })
  };

  const onStartDateChange = (date) => {
    var day = date.getDate().toString();
    if(day.length < 2){
      day = "0" + day;
    }

    var month = (date.getMonth()+1).toString();
    if(month.length < 2){
      month = "0" + month;
    }

    var year = date.getFullYear().toString();

    var layerIdString = (year + month +  day + "_layer");
    console.log(layerIdString);

    setStartDate(date);
    var newDateRange = getDateRange(startDate, endDate);
    setDateRange(newDateRange);
    var newDates = getWMSDateRange(startDate, endDate);
    setWmsLayersRange(newDates);
  };

  const onEndDateChange = (date) => {
    var day = date.getDate().toString();
    if(day.length < 2){
      day = "0" + day;
    }

    var month = (date.getMonth()+1).toString();
    if(month.length < 2){
      month = "0" + month;
    }

    var year = date.getFullYear().toString();

    var layerIdString = (year + month +  day + "_layer");
    console.log(layerIdString);

    setEndDate(date); //set end date state
    var newDateRange = getDateRange(startDate, endDate); //get new array of date objects
    setDateRange(newDateRange); //set date objects to state
    var newWMSDates = getWMSDateRange(startDate, endDate); //get new array of wms layers
    setWmsLayersRange(newWMSDates); //set wms layers to state
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
              value = {baseMaps.indexOf(activeBaseMap)}
              onChange={handleBaseLayerChange}
              label="Product"
            >
              {config.baseLayers.map((baseLayer, index) => (
                <MenuItem value={index}>{baseLayer.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Start Date"
              value={startDate}
              onChange={onStartDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
              />
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="date-picker-inline"
                label="End Date"
                value={endDate}
                onChange={onEndDateChange}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
          </MuiPickersUtilsProvider>
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
  return (
    <div>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true}>
        <App />
      </MapContainer>
    </div>
  );
}
