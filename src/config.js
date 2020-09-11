

const config = {
  "dates": [20200217, 20200209, 20200201, 20200124, 2020116],
  "wms_template" : function (datestring){
    const sampleLayer = {
      source: {
        type: "raster",
        tiles: [
          `https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_${datestring}_1YR_FW2&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256`,
        ],
        tileSize: 1024,
      },
      layer: {
        id: `${datestring}_layer`,
        type: "raster",
        source: `${datestring}_source`,
        layout: {
          visibility: "visible",
        },
        paint: {},
      },
    }
    return sampleLayer;
  }
}
export default config;
