console.log('Main js')

var customLabel = {
    restaurant: {
      label: 'R'
    },
    bar: {
      label: 'B'
    }
  };

  var iconBase = 'http://maps.google.com/mapfiles/kml/shapes/';
  var icons = {
    pickupSale: {
      icon: iconBase + 'truck.png'
    },
    pickupAssistance: {
      icon: iconBase + 'phone.png'
    },
    replacement: {
      icon: iconBase + 'mechanic.png'
    }
  };


  var map
  var all_data

    function initMap() {
      console.log('initMap')
      var input = document.getElementById('search-input');

      // Change this depending on the name of your PHP or XML file
      downloadUrl('https://github.com/jemay86/map-google-filter/blob/master/markers.xml', function(data){
        all_data = data
        refreshMap()
      });
    }


    function draw_points(data, types, id_found) {

      map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(41.902782, 12.496365),
        zoom: 6
      });
      var infoWindow = new google.maps.InfoWindow;

      var xml = data.responseXML;
      var markers = xml.documentElement.getElementsByTagName('marker');
      document.getElementById('locator-list').innerHTML = ""
      Array.prototype.forEach.call(markers, function(markerElem) {
        if(types == null || types.indexOf(markerElem.getAttribute('type')) >= 0) {
          var id = markerElem.getAttribute('id');

          var name = markerElem.getAttribute('name');
          var address = markerElem.getAttribute('address');
          var type = markerElem.getAttribute('type');
          var point = new google.maps.LatLng(
              parseFloat(markerElem.getAttribute('lat')),
              parseFloat(markerElem.getAttribute('lng'))
          );

          if(id_found != undefined && id_found.length == 1 && id_found.indexOf(id) > -1){
            map.setZoom(10)
            map.setCenter(point)
          }

          var infowincontent = document.createElement('div');
          var strong = document.createElement('strong');
          strong.textContent = name
          infowincontent.appendChild(strong);
          infowincontent.appendChild(document.createElement('br'));

          var text = document.createElement('text');
          text.textContent = address
          infowincontent.appendChild(text);
          var icon = {
            url:icons[type].icon,
            scaledSize: new google.maps.Size(30, 30),
        };
          var marker = new google.maps.Marker({
            map: map,
            position: point,
            icon: icon,

          });
          marker.addListener('click', function() {
            infoWindow.setContent(infowincontent);
            infoWindow.open(map, marker);
          });

          
          var locators = document.getElementById('locator-list')
          var locator = document.createElement('li');
          locator.setAttribute("id", id);
          if(id_found != undefined && id_found.indexOf(id) == -1){
            locator.style.display = "none";
          }
          var a = document.createElement('a');
          a.setAttribute("href", "javascript:refreshMap("+id+")")
          a.textContent = name
          locator.appendChild(a);
          locator.appendChild(document.createElement('br'));

          var text = document.createElement('text');
          text.textContent = address
          locator.appendChild(text);
          locators.appendChild(locator)
          
      }
      });
    }

  function search() {
    // Declare variables
    var input, filter, ul, li, a, i, id_found;
    input = document.getElementById('search-input');
    filter = input.value.toUpperCase();
    ul = document.getElementById("locator-list");
    li = ul.getElementsByTagName('li');
    id_found = []
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        name = li[i].getElementsByTagName("a")[0].innerHTML;
        text = li[i].getElementsByTagName("text")[0].innerHTML;
        if (name.toUpperCase().indexOf(filter) > -1 || text.toUpperCase().indexOf(filter) > -1 ) {
            li[i].style.display = "";
            id_found.push(li[i].id)
        } else {
            li[i].style.display = "none";
        }
    }
    refreshMap(id_found)
  }

  function downloadUrl(url, callback) {
    var request = window.ActiveXObject ?
        new ActiveXObject('Microsoft.XMLHTTP') :
        new XMLHttpRequest;

    request.onreadystatechange = function() {
      if (request.readyState == 4) {
        request.onreadystatechange = doNothing;
        callback(request, request.status);
      }
    };

    request.open('GET', url, true);
    request.send(null);
  }

  function doNothing() {}

  function refreshMap(id_found){
    var param = []
    var filter1 = document.getElementById("pickupSale");
    if(filter1.checked) {
      param.push("pickupSale");
    }
    var filter2 = document.getElementById("pickupAssistance");
    if(filter2.checked) {
      param.push("pickupAssistance");
    }
    var filter3 = document.getElementById("replacement");
    if(filter3.checked) {
      param.push("replacement");
    }
    draw_points(all_data, param, id_found)
  }

  function geolocation() {
      infoWindow = new google.maps.InfoWindow;

      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          var center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

          map.setCenter(center)
          map.setZoom(10);

          var cityCircle = new google.maps.Circle({
            strokeColor: '#B61020',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: '#B61020',
            fillOpacity: 0.15,
            map: map,
            center: center,
            radius: 20000
        });
        }, function() {
          handleLocationError(true, infoWindow, map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }
    

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(map);
    }

  }


