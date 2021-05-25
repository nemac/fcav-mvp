import React, { useState, useEffect, useDebugValue, useRef } from "react";
import L from "leaflet";
import config from "./config";
import {
  MapContainer,
} from "react-leaflet";
import { useLeafletContext } from '@react-leaflet/core';
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
import StopIcon from '@material-ui/icons/Stop';
import {isLeapYear, toDate, toWMSDate} from "./datemanagement";
import {theme} from "./index";


// Map Defaults
const center = [35.61540402873807, -82.56582048445668];
const zoom = 5;

const getLayerRangeByDate = (startDate, endDate, wmsLayers) => {
  var startIndex = -1;
  var endIndex = -1;
  for (let index = 0; index < wmsLayers.length; index++) {
    if (wmsLayers[index].date >= startDate && startIndex === -1) {
      startIndex = index
    }
    if(wmsLayers[index].date >= endDate && endIndex === -1){
      endIndex = index-1
    }
  }
  if (endIndex === -1) {
    endIndex = wmsLayers.length - 1;
  }
  const newRange = wmsLayers.slice(startIndex, endIndex+1);
  return newRange;
}



export function App() {

  // Initialize Material UI styles
  const useStyles = makeStyles({
    root: {
      width: 300,
    },
  });
  const classes = useStyles();

  const [animating, setAnimating] = useStateWithLabel(false);
  const [animReady, setAnimReady] = useStateWithLabel(false);

  // Date State
  const [startDate, setStartDate] = useStateWithLabel(new Date("2020-01-16"), "startDate")
  const [currentDate, setCurrentDate] = useStateWithLabel("2020-01-16","currentDate")
  const [endDate, setEndDate] = useStateWithLabel(new Date("2020-02-17"), "endDate")
  const [dateRangeIndex, setDateRangeIndex] = useStateWithLabel(0, "dateRangeIndex");
  const [activeLayer, setActiveLayer] = useStateWithLabel(-1, "activeLayer")

  // Map
  const [map, setMap] = useState(null);

  // Basemaps
  const [basemaps] = useStateWithLabel(config.baseLayers, "basemaps");
  const basemapRef = useRef()
  const [activeBasemap, setActiveBaseMap] = useStateWithLabel(config.baseLayers[2], "activeBasemap");

  // Layers
  const [wmsLayers, setWmsLayers] = useStateWithLabel(config.juliandates.map(jd => {
    const date = toDate(parseInt(jd) + 7, 2020); //7 day offset
    const wmsdate = toWMSDate(date);
    const o = config.wms_template(wmsdate);
    o.leafletLayer = L.tileLayer.wms(o.baseUrl, o.options);
    o.date = date;
    return o;
  }), "wmsLayers")

  const [layerRange, setLayerRange] = useStateWithLabel(
    getLayerRangeByDate(startDate, endDate, wmsLayers), "layerRange"
  )

  const allDates = wmsLayers.map(o => o.date)


  // Components

  const TileLayerManager = () => {

    const context = useLeafletContext()

    const clearMap = () => {
      console.log("Clearing map...")
      context.map.eachLayer((layer) => {
        if (basemapRef.current === layer) {
          console.log("Skipping basemap layer...")
          console.log(basemapRef.current)
          return
        }
        context.map.removeLayer(layer)
      })
    }

    const addLayer = (index) => {
      const layer = layerRange[index]
      if (!context.map.hasLayer(layer.leafletLayer)) {
        console.log("Adding layer to map...")
        console.log(layer)
        context.map.addLayer(layer.leafletLayer)
      } else {
        console.log("Layer is already on the map: ")
        console.log(layerRange[index])
      }
      layer.leafletLayer.setOpacity(1)
      layer.leafletLayer.bringToFront()
    }

    const addAllLayers = () => {
      let layersToLoad = wmsLayers.length;
      for(var i = 0; i < wmsLayers.length; i++){
        var layer = wmsLayers[i].leafletLayer;
        layer.setOpacity(0);
        context.map.addLayer(layer);
        wmsLayers[i].leafletLayer = layer;
        layer.on('load', function(){
          console.log("loaded");
          layersToLoad--;
          console.log(layersToLoad);
          //layer.setOpacity(1);
          //layer.bringToFront();
          if(layersToLoad == 0){
            console.log("All layers loaded.")
            setAnimReady(true)
          }
        });
      } 
    }

    useEffect(() => {
      addLayer(dateRangeIndex)
      if (animating && animReady) {
        const newDateRangeIndex = (dateRangeIndex+1) == layerRange.length ? 0 : dateRangeIndex+1
        console.log("Setting new dateRangeIndex " + newDateRangeIndex + " in 3 seconds")
        const timer = setTimeout(() => { setDateRangeIndex(newDateRangeIndex) }, 3000)
        return () => { clearTimeout(timer) }
      }
    }, [dateRangeIndex])

    useEffect(() => {
      if (animating) {
        console.log("Preloading animation layers...")
        addAllLayers()
      } else {
        console.log("Stop button triggered, setting animReady to false...")
        setAnimReady(false)
      }
    }, [animating])

    useEffect(() => {
      if (animReady) {
        console.log("Animation ready. Setting dateRangeIndex to 0...")
        setDateRangeIndex(0)
      } else {
        console.log("animReady set to false, clearing map...")
        clearMap()
      }
    }, [animReady])

    return null

  }

  function DateRangeAnimate () {


    const onStartDateChange = (date) => {
      var day = date.getDate().toString()
      if(day.length < 2){
        day = "0" + day
      }
      var month = (date.getMonth()+1).toString()
      if(month.length < 2) {
        month = "0" + month
      }
      var year = date.getFullYear().toString()
      var layerIdString = (year + month +  day + "_layer")
      setStartDate(date)

      var newLayerRange = getLayerRangeByDate(date, endDate, wmsLayers);
      setLayerRange(newLayerRange);
      setDateRangeIndex(0)
    }

    const onEndDateChange = (date) => {
      var day = date.getDate().toString();
      if (day.length < 2) {
        day = "0" + day;
      }
      var month = (date.getMonth()+1).toString()
      if (month.length < 2) {
        month = "0" + month;
      }
      var year = date.getFullYear().toString();
      var layerIdString = (year + month +  day + "_layer");
      setEndDate(date); //set end date state
      setLayerRange(getLayerRangeByDate(startDate, date, wmsLayers)); //set date objects to state
      setDateRangeIndex(0)
    }

    function AnimateBtn () {

      return (
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          startIcon={ animating ? <StopIcon/> : <PlayArrowIcon />}
          onClick={ () => { setAnimating(!animating) } }
        >{ animating ? "Stop" : "Play" }</Button>
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
                value={dateRangeIndex}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={layerRange.length-1}
                onChange={ (e, v) => { setDateRangeIndex(v) } }
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

  function BasemapSelect () {

    const handleBaseLayerChange = (event) => {
      var index = event.target.value;
      setActiveBaseMap(basemaps[index]);
    };

    return (
      <FormControl variant="outlined" style={{marginRight: 16 }}>
        <InputLabel shrink id="demo-simple-select-placeholder-label-label">
          Basemap
        </InputLabel>
        <Select
          labelId="fcav-product-select-label"
          id="fcav-product-select"
          value = {basemaps.indexOf(activeBasemap)}
          onChange={handleBaseLayerChange}
          label="Product"
        >
          {
            config.baseLayers.map((baseLayer, index) => (
              <MenuItem key = {index} value={index}>{baseLayer.name}</MenuItem>
            ))
          }
        </Select>
      </FormControl>
    )
  }

  function ProductTypeSelect () {
    const handleProductChange = (event) => {
      //setProduct(event.target.value);
    };

    return (
      <FormControl variant="outlined" style={{ marginLeft: 16, marginRight: 16 }}>
        <InputLabel shrink id="demo-simple-select-placeholder-label-label">
          Product
        </InputLabel>
        <Select
          labelId="fcav-product-select-label"
          id="fcav-product-select"
          value="0"
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
          style={{ zIndex: '0', flexWrap: 'flex', flexDirection: 'column'}}
        >
          <Toolbar>
            <img src={nemacLogo} width="150" alt="your mom"></img>
            {/*<ProductTypeSelect/>*/}
            <BasemapSelect/>
            <DateRangeAnimate/>
          </Toolbar>
        </AppBar>
      </Grid>
    ) 
  }

  function BasemapLayer () {
    const context = useLeafletContext()

    useEffect(() => {

      basemapRef.current = new L.tileLayer(activeBasemap.url, { opacity: 0, attribution: activeBasemap.attribution })
      const container = context.map
      container.addLayer(basemapRef.current)
      basemapRef.current.bringToBack()
      basemapRef.current.setOpacity(1)

      return () => {
        container.removeLayer(basemapRef.current)
      }
    }, [])

    return null
  }

  // App
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
          <BasemapLayer/>
          <TileLayerManager/>
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
