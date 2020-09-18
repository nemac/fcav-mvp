var julian = require('julian');

const config = {
  "juliandates" : [  "001",  "009",  "017",  "025",  "033",  "041",  "049",  "057",  "065",  "073",  "081",  "089",  "097",  "105",  "113",  "121",  "129",  "137",  "145",  "153",  "161",  "169",  "177",  "185",  "193",  "201",  "209",  "217",  "225",  "233",  "241",  "249",  "257",  "265",  "273",  "281",  "289",  "297",  "305",  "313",  "321",  "329",  "337",  "345",  "353",  "361"],
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
