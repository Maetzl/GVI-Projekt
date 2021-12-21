var map;

function initialize() {
  var text, obj;

  var files = ['./data/activity_2041740146.gpx', './data/garminErsterTrack.gpx'];

  mapload();

  for (let index = 0; index < files.length; index++) {
    var client = new XMLHttpRequest();

    client.open('GET', files[index], false);

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
    };
    client.send();
  }
}

function addRoutes(obj) {
  console.log(obj);
  function onEachFeature(feature, layer) {
    layer.bindPopup('<h4>' + '</h4><p>Puls: ' + feature.properties.Heartrate + ' BpM');
  }

  function getColor(d) {
    return d > 110 ? '#ad0900' : d > 90 ? '#ad6200' : d > 70 ? '#9fad00' : d > 40 ? '#00ad0c' : '#000';
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
  }).addTo(map);

  L.marker([obj.features[0].geometry.coordinates[0][1], obj.features[0].geometry.coordinates[0][0]]).bindPopup('Start').addTo(map);
  L.marker([obj.features[obj.features.length - 1].geometry.coordinates[0][1], obj.features[obj.features.length - 1].geometry.coordinates[0][0]])
    .bindPopup('Ende')
    .addTo(map);

  var legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    //div.innerHTML += 'Baujahr <br>';
    // loop through our density intervals and generate a label with a colored square for each interval
    //for (var i = 10; i < years.length; i += 10) {
    //  if (i != 90) {
    //    div.innerHTML +=
    //      '<i style="background:' + getColor(years[i]) + '"></i> ' +
    //      years[i - 10] + "-" + years[i] + '<br>';
    //  }
    //  else {
    //    div.innerHTML +=
    //      '<i style="background:' + getColor(years[i]) + '"></i> ' +
    //      years[i - 10] + "-" + years[93] + '<br>';
    //  }
    //
    //}

    return div;
  };

  legend.addTo(map);
}

function mapload() {
  map = L.map('map_canvas').setView([48.77339324913919, 9.172363495454192], 16);

  var osm = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a>     contributors',
    minZoom: 2,
    maxZoom: 18
  });

  map.addLayer(osm);
}
