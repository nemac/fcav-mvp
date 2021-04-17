import React, { useState, useEffect, useDebugValue, useRef } from "react";
import L from "leaflet";
import config from "./config";
import {
  MapContainer,
  TileLayer,
  useMap
} from "react-leaflet";
import { Grid } from "@material-ui/core";
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
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import {isLeapYear, toDate, toWMSDate} from "./datemanagement";
import {theme} from "./index";


const center = [35.61540402873807, -82.56582048445668];
const zoom = 5;


export function App() {

  /******************************* STATE ***********************************/

  const [map, setMap] = useState(null);
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
  const [dateSliderVal, setDateSliderVal] = useStateWithLabel(0, "dateSliderVal");
  const [sliderAnimCount, setSliderAnimCount] = useStateWithLabel(0, "sliderAnimCount");
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
  const [product, setProduct] = useStateWithLabel("forwarn", "Product");
  const [animation, setAnimation] = useStateWithLabel(false);

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
    //console.log(newDateRange);
    return newDateRange;
  }

  const getWMSDateRange = (startDate, endDate) => {
    const loadInitialLayers = (wmsLayers) => {
      for(var index in wmsLayers){
        var wmsLayer = L.tileLayer.wms(wmsLayers[index].baseUrl, wmsLayers[index].options);
        wmsLayers[index].leafletLayer = wmsLayer;
      }
    };
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
    loadInitialLayers(newWMSLayers);
    return newWMSLayers;
  }
  const [dateRange, setDateRange] = useStateWithLabel(
    getDateRange(startDate, endDate), "dateRange"
  );
  const [wmsLayersRange, setWmsLayersRange] = useStateWithLabel(
    getWMSDateRange(startDate, endDate), "wmsLayersRange"
  );

  // Material UI magic
  const useStyles = makeStyles({
    root: {
      width: 300,
    },
  });
  const classes = useStyles();


  /*************************** COMPONENTS *********************************/

  function DateRangeAnimate () {

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
      setStartDate(date);
      var newDateRange = getDateRange(date, endDate);
      setDateRange(newDateRange);
      var newDates = getWMSDateRange(date, endDate);
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
      setEndDate(date); //set end date state
      var newDateRange = getDateRange(startDate, date); //get new array of date objects
      setDateRange(newDateRange); //set date objects to state
      var newWMSDates = getWMSDateRange(startDate, date); //get new array of wms layers
      setWmsLayersRange(newWMSDates); //set wms layers to state
    };

    const handleSliderChange = (event, value) => {
      var index = value;
      setDateSliderVal(index);
      console.log("slider change: " + index);
      map.eachLayer((layer) =>{
        if(layer != activeBaseMap.layer){
          map.removeLayer(layer);
        }
      })
      wmsLayersRange[index].leafletLayer.setOpacity(1);
      map.addLayer(wmsLayersRange[index].leafletLayer);
      wmsLayersRange[index].leafletLayer.bringToFront();
    }


    function AnimateBtn () {
      const startSliderAnim = () =>{
        console.log("start anim");
        if(!animation){
          setAnimation(true);
          //1. clear all layer
          map.eachLayer((layer) =>{
            if(layer != activeBaseMap.layer){
              map.removeLayer(layer);
            }
          })
          //2. preload with opacity set to 0
          /*wmsLayersRange.forEach(e =>{
            var layer = e.leafletLayer;
            var index = wmsLayersRange.indexOf(e);
            layer.setOpacity(0);
            map.addLayer(layer);
            //check if layer is loaded
            layer.on('load', function(){
              console.log("loaded:" + index);
              layer.setOpacity(1);
              layer.bringToFront();
            });
          })*/
          for(var i = 0; i < wmsLayersRange.length; i++){
            var layer = wmsLayersRange[i].leafletLayer;
            layer.setOpacity(0);
            map.addLayer(layer);
            layer.on('load', function(){
              console.log("loaded");
              layer.setOpacity(1);
              layer.bringToFront();
            });
          }
        }
        else{
          setAnimation(false);
        }
        while(animation){
          for(var i = 0; i < wmsLayersRange.length; i++){
            setDateSliderVal(i);
            var layer = wmsLayersRange[i].leafletLayer;
            layer.setOpacity(1);
            setTimeout(() => {
              layer.setOpacity(0);
            }, 1000);
          }
        }
      }

      return (
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          endIcon={<PlayArrowIcon />}
          onClick = {startSliderAnim}
        >
          Animate
        </Button>
      )
    }


    return (
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker style={{marginRight: 16 }}
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
            <div className={classes.root} style={{marginRight: 16, marginTop: 16 }}>
              <Slider color="secondary"
                defaultValue={0}
                //getAriaValueText={0}
                value = {dateSliderVal}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={wmsLayersRange.length-1}
                onChange={handleSliderChange}
              />
            </div>
            <KeyboardDatePicker style={{marginRight: 16 }}
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
        <AnimateBtn/>
      </MuiPickersUtilsProvider>
      )
  }

  function BaseMapSelect () {

    const handleBaseLayerChange = (event) => {
      var index = event.target.value;
      var currLayer = activeBaseMap.layer;
      //console.log("current layer:",currLayer);
      if(currLayer!=null){
        map.removeLayer(currLayer);
      }

      //console.log("Removing ", currLayer);
      map.eachLayer(function(layer){
        //console.log(layer);
      })

      var baseLayer = L.tileLayer(baseMaps[index].url);
      baseMaps[index].layer = baseLayer;
      setActiveBaseMap(baseMaps[index]);
      //console.log("adding ", baseLayer);
      map.addLayer(baseLayer);
      activeBaseMap.layer = baseLayer;
      baseLayer.bringToBack();
      map.eachLayer(function(layer){
        //console.log(layer);
      })

      //change theme
      if(baseMaps[index].theme = "Light"){
        //theme.primary = baseMaps
        //theme.palette.primary.main = config.themeColors[1].palette.primary.main;
        //theme.palette.secondary.main = config.themeColors[1].palette.secondary.main;
        //theme = config.themeColors[1];
      }
    };

    return (
      <FormControl variant="outlined" style={{marginRight: 16 }}>
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
            <MenuItem key = {index} value={index}>{baseLayer.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  function ProductTypeSelect () {
    const handleProductChange = (event) => {
      setProduct(event.target.value);
    };

    return (
      <FormControl variant="outlined" style={{ marginLeft: 16, marginRight: 16 }}>
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
    )
  }

  function TopBar () {
    return (
       <Grid item xs={12}>
        <AppBar
          id='menu'
          position="static"
          color="primary"
          style={{flexWrap: 'flex', flexDirection: 'column'}}
        >
          <Toolbar>
            <img src={nemacLogo} width="150" alt="your mom"></img>
            {/*<ProductTypeSelect/>*/}
            <BaseMapSelect/>
            <DateRangeAnimate/>
          </Toolbar>
        </AppBar>
      </Grid>
    ) 
  }

  return (
    <Grid container>
      <TopBar/>
      <Grid item xs={12}>
        <MapContainer
          center={[50, 50]}
          zoom={zoom}
          style={{ height: "90vh" }}
          whenCreated={setMap}
        >
          <TileLayer
            attribution={ activeBaseMap.attribution }
            url={ activeBaseMap.url }
          />
        </MapContainer>
      </Grid>
    </Grid>
  );
}


function useStateWithLabel(initialValue, name) {
  const [value, setValue] = useState(initialValue);
  useDebugValue(`${name}: ${value}`);
  return [value, setValue];
}
