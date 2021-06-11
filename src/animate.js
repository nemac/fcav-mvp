import { useState, useEffect } from "react"
import { useLeafletContext } from '@react-leaflet/core'

const AnimationController = (props) => {
  let [index, setIndex] = useState(null)
  const context = useLeafletContext()

  // Frame update
  useEffect(() => {
    if (index === null) return
    const layer = props.layers[index]
    props.layers.forEach(_layer => {
      _layer.leafletLayer.bringToBack()
    })
    layer.leafletLayer.bringToFront()
    const newIndex = (index+1) === props.layers.length ? 0 : index+1
    const timer = setTimeout(() => {
      setIndex(newIndex)
    }, 1000)
    return () => { clearTimeout(timer) }
  }, [index])

  // Initial load
  useEffect(() => {
    if (!props.go) return
    let layersToLoad = props.layers.length
    props.layers.forEach(layer => {
      layer.leafletLayer.setOpacity(0)
      if (!context.map.hasLayer(layer.leafletLayer)) {
        console.log("Adding layer to map with opacity 0...")
        console.log(layer)
        context.map.addLayer(layer.leafletLayer)
      } else {
        console.log("Layer is already on the map: ")
        console.log(layer)
      }
      console.log("Moving layer to the back...")
      layer.leafletLayer.bringToBack()
      console.log("Setting opacity to 1...")
      layer.leafletLayer.setOpacity(1)
      layer.leafletLayer.on('load', function(){
        console.log("loaded")
        layersToLoad--
        console.log(layersToLoad)
        if(layersToLoad === 0){
          console.log("All layers loaded.")
          setIndex(0)
        }
      })
    })
  }, [])

  return null

}

export {AnimationController}
