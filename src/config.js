

const config = {
  "juliandates" : [  "001",  "009",  "017",  "025",  "033",  "041",  "049",  "057",  "065",  "073",  "081",  "089",  "097",  "105",  "113",  "121",  "129",  "137",  "145",  "153",  "161",  "169",  "177",  "185",  "193",  "201",  "209",  "217",  "225",  "233",  "241",  "249",  "257",  "265",  "273",  "281",  "289",  "297",  "305",  "313",  "321",  "329",  "337",  "345",  "353",  "361"],
  "wms_template" : function (datestring){
    /*const sampleLayer = {
      source: {
        type: "raster",
        tiles: [
          `https://fswms.nemac.org/forwarn_compare?TRANSPARENT=true&PROJECTION=EPSG%3A3857&UNITS=m&LAYERS=FW_${datestring}_1YR_FW2&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=1024&HEIGHT=1024`,
        ],
        tileSize: 1024,
      },
      layer: {
        id: `${datestring}_layer`,
        type: "raster",
        source: `${datestring}_source`,
        layout: {
          visibility: "none",
        },
        paint: {},
      },
    }*/
    const sampleLayer = {
      baseUrl: 'https://fswms.nemac.org/forwarn_compare',
      options: {
        layers: `FW_${datestring}_1YR_FW2`,
        format: 'image/png',
        transparent: true,
        tileSize: 2048,
        uppercase : true
      }
    }
    return sampleLayer;
  },
  "baseLayers" : [
    {
      name: "Streets",
      url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:""
    },
    {
      name: "Light",
      url: "https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:""
    },
    {
      name: "Dark",
      url: "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:""
    },
    {
      name: "Outdoors",
      url: "https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:""
    },
    {
      name: "Satellite",
      url: "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:""
    }
  ]
}
export default config;
