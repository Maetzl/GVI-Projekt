var map;
var layerGroups = [];
var flagR = L.icon({
  iconUrl: './icons/flagRed.png',

  iconSize:     [32, 32],
  iconAnchor:   [5, 25],
  popupAnchor:  [11, -12] 

})

var flagG = L.icon({
  iconUrl: './icons/flagGreen.png',

  iconSize:     [32, 32],
  iconAnchor:   [5, 25], 
  popupAnchor:  [11, -12] 

})

function initialize() {
  var text, obj;

  var files = ['./data/activity_2041740146.gpx', './data/garminErsterTrack.gpx'];

  mapload();

  for (let indexF = 0; indexF < files.length; indexF++) {
    var client = new XMLHttpRequest();

    client.open('GET', files[indexF], false);

    client.onload = function () {
      var response = client.responseText,
        parser = new DOMParser(),
        xmlDoc = parser.parseFromString(response, 'text/xml');

      var index = 0;
      var la1, lo1, la2, lo2, hr1, hr2, hrAvr;
      text = '{';
      text += '"type": "FeatureCollection",\n' + '"name": "gpxFile1",\n' + ' "features": [\n';

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

      if(indexF == (files.length - 1))
      {
        addControls();
      }

    };
    
    client.send();
  }
}


function addRoutes(obj) {
  //console.log(obj);
  
  var layers = L.layerGroup();

  function onEachFeature(feature, layer) {
    layer.bindPopup('<h4>' + '</h4><p>Puls: ' + feature.properties.Heartrate + ' BpM');
    layers.addLayer(layer);
  }

  function getColor(d) {
    return d > 109 ? '#ad0900' : d > 90 ? '#d17d00' : d > 70 ? '#9fad00' : d > 40 ? '#00ad0c' : '#000';
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


  layers.addLayer(L.marker([obj.features[0].geometry.coordinates[0][1], obj.features[0].geometry.coordinates[0][0]], {icon: flagR}).bindPopup('Start'));
  layers.addLayer(L.marker([obj.features[obj.features.length - 1].geometry.coordinates[0][1], obj.features[obj.features.length - 1].geometry.coordinates[0][0]], {icon: flagG}).bindPopup('Ende')); 

  layerGroups.push(layers);
  
}

function addControls(){
  console.log(layerGroups);

  var layerControl = {
    "Beispiel Datensatz": layerGroups[0],
    "Uhr 2": layerGroups[1]
  };

  layerGroups.forEach(element => {
    
    element.addTo(map)

  });

  L.control.layers(null,  layerControl).addTo(map);
}

function mapload() {

  map = L.map('map_canvas', {

    center : [48.77339324913919, 9.172363495454192],
    zoom: 16

  });

  var osm = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a>     contributors',
    minZoom: 2,
    maxZoom: 18
  });

  var legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += 'Puls zwischen <br>';

    //d > 110 ? '#ad0900' : d > 90 ? '#d17d00' : d > 70 ? '#9fad00' : d > 40 ? '#00ad0c' : '#000';

    div.innerHTML +='<i style="background: #ad0900' + '"></i> > 110 BpM<br>'
                  + '<i style="background: #d17d00' + '"></i> 91-109 BpM<br>'
                  + '<i style="background: #9fad00' + '"></i> 71-90 BpM<br>'
                  + '<i style="background: #00ad0c' + '"></i> 41-70 BpM<br>';

    return div;
  };

  legend.addTo(map);

  map.addLayer(osm);
}
