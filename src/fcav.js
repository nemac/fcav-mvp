import React, { useState, useEffect, useDebugValue, useRef } from "react"
import L from "leaflet"
import config from "./config"
import {
  MapContainer,
  useMap
} from "react-leaflet"
import { Grid } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import nemacLogo from "./nemac_logo_white.png"
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'
import { makeStyles } from '@material-ui/core/styles'
import Icon from '@material-ui/core/Icon'
import Button from '@material-ui/core/Button'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import StopIcon from '@material-ui/icons/Stop'
import {isLeapYear, toDate, toWMSDate} from "./datemanagement"

// Map Defaults
const center = [35, -82]
const zoom = 13


function useStateWithLabel(initialValue, name) {
  const [value, setValue] = useState(initialValue)
  useDebugValue(`${name}: ${value}`)
  return [value, setValue]
}

const getLayerRangeByDate = (startDate, endDate, wmsLayers) => {
  let startIndex = -1
  let endIndex = -1
  wmsLayers.forEach((layer, index) => {
    if (layer.date >= startDate && startIndex === -1) {
      startIndex = index
    }
    if(layer.date >= endDate && endIndex === -1){
      endIndex = index-1
    }
  })
  if (endIndex === -1) {
    endIndex = wmsLayers.length - 1
  }
  const newRange = wmsLayers.slice(startIndex, endIndex+1)
  return newRange
}


export function App() {

  // Initialize Material UI styles
  const useStyles = makeStyles({
    root: {
      width: 300,
    },
  })
  const classes = useStyles()

  const [animating, setAnimating] = useStateWithLabel(false)

  // Date State
  const [startDate, setStartDate] = useStateWithLabel(new Date("2020-01-16"), "startDate")
  const [endDate, setEndDate] = useStateWithLabel(new Date("2020-02-17"), "endDate")
  const [dateRangeIndex, setDateRangeIndex] = useStateWithLabel(0, "dateRangeIndex")

  // Basemaps
  const basemaps = config.baseLayers
  const [basemapIndex, setBasemapIndex] = useStateWithLabel(2, "basemapIndex")
  const basemapRef = useRef()

  // Layers
  const [wmsLayers, setWmsLayers] = useStateWithLabel(config.juliandates.map(jd => {
    const date = toDate(parseInt(jd) + 7, 2020) // 7 day offset
    const wmsdate = toWMSDate(date)
    const o = config.wms_template(wmsdate)
    o.leafletLayer = L.tileLayer.wms(o.baseUrl, o.options)
    o.date = date
    return o
  }), "wmsLayers")

  const [layerRange, setLayerRange] = useStateWithLabel(
    getLayerRangeByDate(startDate, endDate, wmsLayers), "layerRange"
  )

  // State change and event handlers

  const onStartDateChange = (date) => {
    let day = date.getDate().toString()
    if(day.length < 2){
      day = "0" + day
    }
    let month = (date.getMonth()+1).toString()
    if(month.length < 2) {
      month = "0" + month
    }
    setStartDate(date)
    let newLayerRange = getLayerRangeByDate(date, endDate, wmsLayers)
    setLayerRange(newLayerRange)
    setDateRangeIndex(0)
  }

  const onEndDateChange = (date) => {
    let day = date.getDate().toString()
    if (day.length < 2) {
      day = "0" + day
    }
    let month = (date.getMonth()+1).toString()
    if (month.length < 2) {
      month = "0" + month
    }
    setEndDate(date) //set end date state
    setLayerRange(getLayerRangeByDate(startDate, date, wmsLayers)) //set date objects to state
    setDateRangeIndex(0)
  }

  const onBasemapChange = (event) => {
    let index = event.target.value
    setBasemapIndex(index)
  }

  const onSliderChange = (e, v) => {
    console.log('slider change')
    console.log('slider value is ' + String(v))
    if (v !== dateRangeIndex) { setDateRangeIndex(v) }
  }

  const onAnimate = (e, v) => {
    console.log('animate button clicked')
    setAnimating(!animating)
  }

  function MapController () {

    const map = useMap()

    // Clear map utility
    const clearMap = () => {
      console.log("Clearing map...")
      //basemapRef.current.bringToBack()
      map.eachLayer((layer) => {
        if (basemapRef.current === layer) {
          console.log("Skipping basemap layer...")
          console.log(basemapRef.current)
          return
        }
        console.log("Removing layer: ")
        console.log(layer)
        //map.removeLayer(layer)
      })
    }

    // Hook: basemap change
    useEffect(() => {
      console.log('basemap change')
      let oldBasemap = basemapRef.current
      let newBasemap = basemaps[basemapIndex]
      let leafletLayer = new L.tileLayer(newBasemap.url, {
        opacity: 0,
        attribution: newBasemap.attribution
      })
      map.addLayer(leafletLayer)
      leafletLayer.bringToBack()
      leafletLayer.setOpacity(1)
      basemapRef.current = leafletLayer
      return () => {
        map.removeLayer(basemapRef.current)
      }
    }, [basemapIndex])

    // Hook: date range index change
    useEffect(() => {
      clearMap()
      const layer = layerRange[dateRangeIndex]
      console.log("new layer: ")
      console.log(layer)
      if (!map.hasLayer(layer.leafletLayer)) {
        console.log("adding layer to the map...")
        map.addLayer(layer.leafletLayer)
      }
      layer.leafletLayer.bringToFront()
      layer.leafletLayer.setOpacity(1)
      if (animating) {
        const newIndex = (dateRangeIndex+1) === layerRange.length ? 0 : dateRangeIndex+1
        const timer = setTimeout(() => {
          setDateRangeIndex(newIndex)
        }, 10000)
        return () => { if (timer) clearTimeout(timer) }
      }
    }, [dateRangeIndex])

    // Hook: Animation button clicked - add all layers to the map
    useEffect(() => {
      if (!animating) { return }
      layerRange.forEach(layer => {
        layer.leafletLayer.setOpacity(0)
        if (!map.hasLayer(layer.leafletLayer)) {
          map.addLayer(layer.leafletLayer)
        }
      })
    }, [animating])

    return null

  }

  function AnimateBtn (props) {

    return (
      <Button
        letiant="contained"
        color="primary"
        className={classes.button}
        startIcon={ animating ? <StopIcon/> : <PlayArrowIcon />}
        onClick={ () => { setAnimating(!animating) } }
      >{ animating ? "Stop" : "Play" }</Button>
    )

  }

  function DateRangePicker () {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker style={{marginRight: 16 }}
              disableToolbar
              letiant="inline"
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
                defaultValue={dateRangeIndex}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={layerRange.length-1}
                onChangeCommitted={ onSliderChange }
              />
            </div>
            <KeyboardDatePicker style={{marginRight: 16 }}
              disableToolbar
              letiant="inline"
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
    )
  }


  function BasemapSelect () {

    return (
      <FormControl letiant="outlined" style={{marginRight: 16 }}>
        <InputLabel shrink id="demo-simple-select-placeholder-label-label">
          Basemap
        </InputLabel>
        <Select
          labelId="fcav-product-select-label"
          id="fcav-product-select"
          value={basemapIndex}
          onChange={onBasemapChange}
          label="Product"
        >
          {
            basemaps.map((basemap, index) => (
              <MenuItem key={index} value={index}>{basemap.name}</MenuItem>
            ))
          }
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
          color="#424242"

          style={{ zIndex: '0', flexWrap: 'flex', flexDirection: 'column', backgroundColor: "#424242"}}
        >
          <Toolbar>
            <img src={nemacLogo} width="150" alt="your mom"></img>
            <BasemapSelect/>
            <DateRangePicker/>
            <AnimateBtn />
          </Toolbar>
        </AppBar>
      </Grid>
    )
  }

  // App
  return (
    <Grid container>
      <TopBar/>
      <Grid item xs={12}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "90vh" }}
        >
          <MapController />
        </MapContainer>
      </Grid>
    </Grid>
  )

}
