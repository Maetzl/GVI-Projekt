var map;
var layerGroups = [];
var objects = [];
var flagR = L.icon({
  iconUrl: './icons/flagRed.png',

  iconSize: [32, 32],
  iconAnchor: [5, 25],
  popupAnchor: [11, -12]
});

var flagG = L.icon({
  iconUrl: './icons/flagGreen.png',

  iconSize: [32, 32],
  iconAnchor: [5, 25],
  popupAnchor: [11, -12]
});

function initialize() {
  var text, obj;

  var files = ['./data/BSP_Datensatz.gpx', './data/Track1.gpx', './data/Track2.gpx', './data/Huawei.tcx'];
  var names = ['Beispieldatensatz', 'LIT','HIT','Huawei Watch',]

  mapload();

  for (let indexF = 0; indexF < files.length; indexF++) {
    var client = new XMLHttpRequest();
    var fileType;

    if (files[indexF].slice(-4) == '.gpx') {
      fileType = 'gpx';
    } else if (files[indexF].slice(-4) == '.tcx') {
      fileType = 'tcx';
    }

    client.open('GET', files[indexF], false);

    client.onload = function () {
      var response = client.responseText,
        parser = new DOMParser(),
        xmlDoc = parser.parseFromString(response, 'text/xml');

      var index = 0;
      var la1, lo1, la2, lo2, hr1, hr2, hrAvr;
      text = '';
      if (fileType == 'gpx') {
        text += '{';
        text += '"type": "FeatureCollection",\n' + '"name": "'+ names[indexF] +'",\n' + ' "features": [\n';

        while (xmlDoc.getElementsByTagName('trkpt')[index] != null) {
          la1 = xmlDoc.getElementsByTagName('trkpt')[index].getAttribute('lat');
          lo1 = xmlDoc.getElementsByTagName('trkpt')[index].getAttribute('lon');
          hr1 = xmlDoc.getElementsByTagName('trkpt')[index].getElementsByTagName('extensions')[0].childNodes[1].getElementsByTagName('ns3:hr')[0].childNodes[0].nodeValue;

          if (xmlDoc.getElementsByTagName('trkpt')[index + 1] != null) {
            la2 = xmlDoc.getElementsByTagName('trkpt')[index + 1].getAttribute('lat');
            lo2 = xmlDoc.getElementsByTagName('trkpt')[index + 1].getAttribute('lon');
            hr2 = xmlDoc.getElementsByTagName('trkpt')[index + 1].getElementsByTagName('extensions')[0].childNodes[1].getElementsByTagName('ns3:hr')[0].childNodes[0].nodeValue;
            hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;

            text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
          } else {
            text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hr1 + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo1 + ', ' + la1 + '  ] ] } }';
          }

          index++;

          if (xmlDoc.getElementsByTagName('trkpt')[index] != null) {
            text += ',';
          }
        }
        text += ']}';
        
        obj = JSON.parse(text);
        addRoutes(obj);
      } else if (fileType == 'tcx') {

        var w = false;

        text += '{';
        text += '"type": "FeatureCollection",\n' + '"name": "'+ names[indexF] +'",\n' + ' "features": [\n';

        hr1=-1;

        while (xmlDoc.getElementsByTagName('Trackpoint')[index] != null) {
          if (xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0] != null) 
          {
            //console.log(index, xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue); //Latitude
            //console.log(index, xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue); //Longitude
            //console.log(index, xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0].childNodes[1].childNodes[0].nodeValue); //Heartrate

            la1 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
            lo1 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;
            hr1 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0].childNodes[1].childNodes[0].nodeValue;

            if (xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('HeartRateBpm')[0] != null) {
              
              la2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
              lo2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;
              hr2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('HeartRateBpm')[0].childNodes[1].childNodes[0].nodeValue;
              hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;

              text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
            } else if (xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('HeartRateBpm')[0] == null) {
              
              la2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
              lo2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;
              hr2 = hr1;
              hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;

              text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
           
            } 
            else 
            {

              while(true){
                index++;
                w = true;

                if(xmlDoc.getElementsByTagName('Trackpoint')[index] != null)
                {
                  break;
                }

                if (xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0] != null) {
              
                  la2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
                  lo2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;
                  hr2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0].childNodes[1].childNodes[0].nodeValue;
                  hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;
    
                  text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
                  break;
                } else if (xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0] == null) {
                  
                  la2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
                  lo2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;
                  hr2 = hr1;
                  hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;
    
                  text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
                  break;
                }
              }
            }
          } 
          else if (xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0] == null) 
          {
            //console.log(index, xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue);
            //console.log(index, xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue);
            //console.log('Heartrate: ?');

            la1 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
            lo1 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;

            if (xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('HeartRateBpm')[0] != null) {
              
              la2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
              lo2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;
              hr2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('HeartRateBpm')[0].childNodes[1].childNodes[0].nodeValue;
              hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;

              text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
            } else if (xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('HeartRateBpm')[0] == null) {
              
              la2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
              lo2 = xmlDoc.getElementsByTagName('Trackpoint')[index + 1].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;
              hr2 = hr1;
              hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;

              text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
           
            } 
            else 
            {

              while(true){
                index++;
                w = true;

                if(xmlDoc.getElementsByTagName('Trackpoint')[index] != null)
                {
                  break;
                }

                if (xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0] != null) {
              
                  la2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
                  lo2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;
                  hr2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0].childNodes[1].childNodes[0].nodeValue;
                  hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;
    
                  text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
                  break;
                } else if (xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0] != null && xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('HeartRateBpm')[0] == null) {
                  
                  la2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[1].childNodes[0].nodeValue;
                  lo2 = xmlDoc.getElementsByTagName('Trackpoint')[index].getElementsByTagName('Position')[0].childNodes[3].childNodes[0].nodeValue;
                  hr2 = hr1;
                  hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;
    
                  text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
                  break;
                }
              }
            }
          }
          else {
            index++;
            w=true;
          }
          //    la1 = xmlDoc.getElementsByTagName('trkpt')[index].getAttribute('lat');
          //    lo1 = xmlDoc.getElementsByTagName('trkpt')[index].getAttribute('lon');
          //    hr1 = xmlDoc.getElementsByTagName('trkpt')[index].getElementsByTagName('extensions')[0].childNodes[1].getElementsByTagName('ns3:hr')[0].childNodes[0].nodeValue;
          //
          //    if (xmlDoc.getElementsByTagName('trkpt')[index + 1] != null) {
          //      la2 = xmlDoc.getElementsByTagName('trkpt')[index + 1].getAttribute('lat');
          //      lo2 = xmlDoc.getElementsByTagName('trkpt')[index + 1].getAttribute('lon');
          //      hr2 = xmlDoc.getElementsByTagName('trkpt')[index + 1].getElementsByTagName('extensions')[0].childNodes[1].getElementsByTagName('ns3:hr')[0].childNodes[0].nodeValue;
          //      hrAvr = (parseFloat(hr1) + parseFloat(hr2)) / 2;
          //
          //      text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hrAvr + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo2 + ', ' + la2 + '  ] ]  } }\n';
          //    } else {
          //      text += '{ "type": "Feature", "properties": {  "Latitude": ' + la1 + ', "Longitude": ' + lo1 + ', "Heartrate": ' + hr1 + '}, "geometry": { "type": "LineString", "coordinates": [ [ ' + lo1 + ', ' + la1 + ' ], [ ' + lo1 + ', ' + la1 + '  ] ] } }';
          //    }
          //

          if(!w)
          {
            w = false;
            index++;
            
            if (xmlDoc.getElementsByTagName('Trackpoint')[index] != null) {
              text += ',';
            }
          }
          else{
            w = false;
          }
          

        }
        text += ']}';

        if(text.slice(-3) == ',]}')
        {
          var text2 = text.substring(0, text.length-4) + text.substring(text.length-2, text.length);
          text = text2;
        }

        obj = JSON.parse(text);
        addRoutes(obj);
      }

      if (indexF == files.length - 1) {
        addControls();
        addChart();
      }
    };

    client.send();
  }
}

function addRoutes(obj) {
  //console.log(obj);
  objects.push(obj);

  var layers = L.layerGroup();

  function onEachFeature(feature, layer) {
    layer.bindPopup('<h4>' + '</h4><p>Puls: ' + feature.properties.Heartrate + ' BpM');
    layers.addLayer(layer);
  }

  function getColor(d) {
    return d > 144 ? '#000' : d > 140 ? '#700600' : d > 134 ? '#d11800' : d > 124 ? '#d13800' : d > 109 ? '#d15700' : d > 90 ? '#d17d00' : d > 70 ? '#9fad00' : d > 40 ? '#00ad0c' : d == -1 ? '#000473' : '#000';
  }

  function style(feature) {
    return {
      weight: 5,
      color: getColor(feature.properties.Heartrate)
    };
  }

  L.geoJSON(obj, {
    onEachFeature: onEachFeature,
    style: style
  });

  layers.addLayer(L.marker([obj.features[0].geometry.coordinates[0][1], obj.features[0].geometry.coordinates[0][0]], { icon: flagG }).bindPopup('Start'));
  layers.addLayer(L.marker([obj.features[obj.features.length - 1].geometry.coordinates[0][1], obj.features[obj.features.length - 1].geometry.coordinates[0][0]], { icon: flagR }).bindPopup('Ende'));

  layerGroups.push(layers);
}

function addControls() {
  console.log(layerGroups);

  var layerControl = {
    'Beispiel Datensatz': layerGroups[0],
    LIT: layerGroups[1],
    HIT: layerGroups[2],
    Huawei: layerGroups[3]
  };

  layerGroups.forEach((element) => {
    element.addTo(map);
  });

  L.control.layers(null, layerControl).addTo(map);
}

function mapload() {
  map = L.map('map_canvas', {
    center: [48.7829184, 9.2130416],
    zoom: 14
  });

  var osm = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a>     contributors',
    minZoom: 2,
    maxZoom: 18
  });

  var legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += 'Puls <br>';

    //return d > 144 ? '#000': d > 140 ? '#700600': d > 134 ? '#d11800' : d > 124 ? '#d13800' : d > 109 ? '#d15700' : d > 90 ? '#d17d00' :
    //       d > 70 ? '#9fad00' : d > 40 ? '#00ad0c' : '#000';

    div.innerHTML += '<i style="background: #000' + '"></i> > 145 BpM<br>' + '<i style="background: #700600' + '"></i> 141-144 BpM<br>' + '<i style="background: #d11800' + '"></i> 135-140 BpM<br>' + '<i style="background: #d13800' + '"></i> 125-134 BpM<br>' + '<i style="background: #d15700' + '"></i> 110-124 BpM<br>' + '<i style="background: #d17d00' + '"></i> 91-109 BpM<br>' + '<i style="background: #9fad00' + '"></i> 71-90 BpM<br>' + '<i style="background: #00ad0c' + '"></i> 41-70 BpM<br>' + '<i style="background: #000473' + '"></i> Unknown BpM<br>';

    return div;
  };

  legend.addTo(map);

  map.addLayer(osm);
}

function addChart()
{
  var chartData = [];
  var maxSize = objects[0].features.length;
  

  for (var i = 0; i < objects.length; i++) {
    if(objects[i].features.length >= maxSize)
    {
      maxSize = objects[i].features.length;
    }
    console.log(objects[i].name )
    var a = [];
    for (var ii = 0; ii < objects[i].features.length; ii++) {
      if(objects[i].features[ii].properties.Heartrate > 0)
      {
        a.push(objects[i].features[ii].properties.Heartrate);   
      }   
      else{
        a.push(0);
      }
    }

    chartData.push(a);
  }

console.log(maxSize)

  var options = {
    series: [{
      name: objects[0].name,
      data: chartData[0],
    },
    {
      name: objects[1].name,
      data: chartData[1],
    },
    {
      name: objects[2].name,
      data: chartData[2],
    },    
    {
      name: objects[3].name,
      data: chartData[3],
    }
  
  ],
    chart: {
      animations: {
        enabled: false
      },
      type: "line",
      zoom: {
        enabled: true,
        autoScaleYaxis: true
      },
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    title: {
      text: "Daten verschiedener Laufstrecken und verschiedenen Messgeräten",
      align: "middle",
    },
    tooltip: {
      enabled:true,
      followCursor: true,
      shared:false,
      y: {
        formatter: function (val) {
          if(val != undefined){
            return "" + val + " BpM"
          }
          else
          {
            return "no Data"
          }          
        }
      },      
      x: {
        show: false
      }
    },    
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.8,
      },
    },
    yaxis: {
      title: {
        text: "Puls in BpM",
      },
    },
    xaxis: {
    type: "category",
    min: 0, //years.min,
    max: maxSize, // years.max,
    tickAmount: 20,
    tickPlacement: 'on',
      title: {
        text: "Trackpoints",
      },
      labels: {
        show: true,
      },
      categories: [], //years,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "right",
    }
  };
  
  var chart = new ApexCharts(document.querySelector("#chart"), options);

  chart.render();
}
