
const config = {
  "juliandates" : [  "001",  "009",  "017",  "025",  "033",  "041",  "049",  "057",  "065",  "073",  "081",  "089",  "097",  "105",  "113",  "121",  "129",  "137",  "145",  "153",  "161",  "169",  "177",  "185",  "193",  "201",  "209",  "217",  "225",  "233",  "241",  "249",  "257",  "265",  "273",  "281",  "289",  "297",  "305",  "313",  "321",  "329",  "337",  "345",  "353",  "361"],
  "wms_template" : function (datestring){
    const sampleLayer = {
      baseUrl: 'https://fswms.nemac.org/forwarn_compare',
      options: {
        layers: `FW_${datestring}_1YR_FW2`,
        format: 'image/png',
        transparent: true,
        tileSize: 2048,
        uppercase : true,
        opacity: 0
      },
      leafletLayer: ""
    }
    return sampleLayer;
  },
  "baseLayers" : [
    {
      name: "Streets",
      url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:"",
      layer: ""
    },
    {
      name: "Light",
      url: "https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:"",
      layer: ""
    },
    {
      name: "Dark",
      url: "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:"",
      layer: ""
    },
    {
      name: "Outdoors",
      url: "https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:"",
      layer: ""
    },
    {
      name: "Satellite",
      url: "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrZWpheSIsImEiOiJjazVoM3JwaTMwZXJiM2t0ZDZyZnF5bnN3In0.NQ71qNFEXZZzlOhYyWlIPg",
      attribution:"",
      layer: ""
    }
  ]
}
export default config;
