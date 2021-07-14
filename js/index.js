const SPREADSHEET_ID = '1v5uxLBRIWGwhkGkFIC7idg_cQuv2gtKUb78flIk1ewg'
const SPREADSHEET_KEY = 'AIzaSyBxy4juu30u8ac7Cd5bsx2dhQeapOVs_i4'

const latlng = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/location!A1:Z1000?key=${SPREADSHEET_KEY}`
const properties = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/popup_properties!A1:Z1000?key=${SPREADSHEET_KEY}`

$.getJSON(latlng, latlng => {
    $.getJSON(properties, properties => {

        let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
        let mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

        let grayscale = L.tileLayer(mbUrl, {
            id: 'mapbox/light-v9',
            tileSize: 512,
            zoomOffset: -1,
            attribution: mbAttr
        })

        let map = L.map('map', {
            center: [39.73, -104.99],
            zoom: 10,
            layers: [grayscale]
        });

        let transToObject = (array) => {
            let data = []
            for (let i = 1; i < array.length; i++) {
                let object = {}
                for (let j = 0; j < array[i].length; j++) {
                    let a = array[0][j]
                    object[a] = array[i][j]

                }
                data.push(object)
            }
            return data
        }

        function showPopup(feature, layer) {

            let id = feature.properties.id

            let filMetaData = detail.filter((a) => {
                return a.match_id === id.toString()
            })

            let arr, body, tab, tr, td, tn, row, col;

            arr = filMetaData.map(p => {
                return Object.values(p)
            })

            body = document.getElementsByTagName('body')[0];
            tab = document.createElement('table');

            let thead = Object.keys(filMetaData[0]).slice(1,this.length)
          
            let head = []
            for(let i = 0; i < thead.length; i++) {
                head.push(`<td class="head">${thead[i]}</td>`)
            }
            tab.innerHTML = head.join("")
            // let head = ['Name','Phone','Email']

            for (row = 0; row < arr.length; row++) {
                tr = document.createElement('tr');
                for (col = 1; col < arr[row].length; col++) {
                    td = document.createElement('td');
                    tn = document.createTextNode(arr[row][col]);
                    
                    td.appendChild(tn);
                    tr.appendChild(td);
                }
                
                tab.appendChild(tr);
            }
            
            console.log(tab)
           
            layer.bindPopup(tab);

            
           
        }

        let location = transToObject(latlng.values)
        let detail = transToObject(properties.values)

        let geoJsonPoint = location.map(obj => {
            let id = obj.id
            let lat = parseFloat(obj.Latitude);
            let lon = parseFloat(obj.Longitude);

            let feature = {
                type: 'Feature',
                properties: {
                    'id': id
                },
                geometry: {
                    type: 'Point',
                    coordinates: [lon, lat]
                }
            };
            return feature
        })

        let geojson = {
            "type": "FeatureCollection",
            "features": geoJsonPoint
        }

        let layer = L.geoJson(geojson, {
            onEachFeature: showPopup,
        }).addTo(map);

        map.fitBounds(layer.getBounds());
    })
})