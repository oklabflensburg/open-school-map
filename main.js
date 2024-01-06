fetch('./data/schulen_flensburg.geojson', {
    method: 'GET'
})
.then((response) => {
    return response.json()
})
.then((data) => {
    marker(data)
})
.catch(function (error) {
    console.log(error)
})


fetch('./data/flensburg_stadtteile.geojson', {
    method: 'GET'
})
.then((response) => {
    return response.json()
})
.then((data) => {
    addDistrictsLayer(data)
})
.catch(function (error) {
    console.log(error)
})


const layerStyle = {
    transparent: {
        color: 'transparent',
        fillColor: 'transparent',
        fillOpacity: 0.7,
        opacity: 0.6,
        weight: 1
    },
    standard: {
        color: '#fff',
        fillColor: '#11aa44',
        fillOpacity: 0.4,
        opacity: 0.6,
        weight: 3
    },
    click: {
        color: '#fff',
        fillColor: '#002db4',
        fillOpacity: 0.4,
        opacity: 0.8,
        weight: 4
    }
}


const map = L.map('map').setView([54.7836, 9.4321], 13)

L.tileLayer.wms('https://sgx.geodatenzentrum.de/wms_basemapde?SERVICE=WMS&Request=GetCapabilities', {
  layers: 'de_basemapde_web_raster_grau',
  maxZoom: 19,
  attribution: '<a href="https://www.bkg.bund.de">© GeoBasis-DE BKG</a> | <a href="https://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>'
}).addTo(map);

/*L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)*/

let geocoder = L.Control.Geocoder.nominatim()
let previousSelectedMarker = null


if (typeof URLSearchParams !== 'undefined' && location.search) {
    // parse /?geocoder=nominatim from URL
    let params = new URLSearchParams(location.search)
    let geocoderString = params.get('geocoder')

    if (geocoderString && L.Control.Geocoder[geocoderString]) {
        console.log('Using geocoder', geocoderString)
        geocoder = L.Control.Geocoder[geocoderString]()
    } else if (geocoderString) {
        console.warn('Unsupported geocoder', geocoderString)
    }
}

const osmGeocoder = new L.Control.geocoder({
    query: 'Flensburg',
    position: 'topright',
    placeholder: 'Adresse oder Ort',
    defaultMarkGeocode: false
}).addTo(map)


osmGeocoder.on('markgeocode', e => {
    const bounds = L.latLngBounds(e.geocode.bbox._southWest, e.geocode.bbox._northEast)
    map.fitBounds(bounds)
})


function addDistrictsLayer(data) {
    L.geoJson(data, {
        style: layerStyle.standard
    }).addTo(map)
}


function renderFeatureDetails(feature) {
    const city = feature.properties.city
    const street_name = feature.properties.street_name
    const house_number = feature.properties.house_number
    const postal_code = feature.properties.postal_code
    const phone_number = feature.properties.phone_number
    const website = feature.properties.website
    const facility = feature.properties.facility
    const director = feature.properties.director
    const institution = feature.properties.institution
    const prerequisite = feature.properties.prerequisite
    const employees = feature.properties.employees
    const teachers = feature.properties.teachers
    const students = feature.properties.students
    const grades = feature.properties.grades
    const open_all_day = feature.properties.open_all_day
    const compulsory_all_day = feature.properties.compulsory_all_day
    const graduation_esa = feature.properties.graduation_esa
    const graduation_msa = feature.properties.graduation_msa
    const graduation_abi = feature.properties.graduation_abi
    const special_needs_school = feature.properties.special_needs_school
    const elementary_school = feature.properties.elementary_school
    const secondary_school = feature.properties.secondary_school
    const high_school = feature.properties.high_school

    let detailOutput = '';

    if (facility !== '') {
        detailOutput += `<li class="py-2 px-2 pt-1 text-xl"><strong>${facility}</strong></li>`
    }

    if (street_name !== '' && house_number !== '' && postal_code !== '' && city !== '') {
        detailOutput += `<li class="last-of-type:pb-2 px-2 py-1">${street_name} ${house_number}<br>${postal_code} ${city}</li>`
    }

    if (employees > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Angestellte</strong> ${employees}</li>`
    }

    if (teachers > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Lehrkräfte</strong> ${teachers}</li>`
    }

    if (students > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Schüler insgesamt</strong> ${students}</li>`
    }

    if (grades > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Jahrgangstufen</strong> ${grades}</li>`
    }

    if (open_all_day > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Offene Ganztagsschule</strong> ${open_all_day}</li>`
    }

    if (compulsory_all_day > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Gebundene Ganztagsschule</strong> ${compulsory_all_day}</li>`
    }

    if (graduation_esa > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Abschluss ESA</strong> ${graduation_esa}</li>`
    }

    if (graduation_msa > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Abschluss MSA</strong> ${graduation_msa}</li>`
    }

    if (graduation_abi > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Abschluss Abitur</strong> ${graduation_abi}</li>`
    }

    if (special_needs_school > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Förderschule</strong> ${special_needs_school}</li>`
    }

    if (elementary_school > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Grundschule</strong> ${elementary_school}</li>`
    }

    if (secondary_school > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Gemeinschaftsschule</strong> ${secondary_school}</li>`
    }

    if (high_school > 0) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Gymnasium</strong> ${high_school}</li>`
    }

    if (institution) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Träger</strong><br>${institution}</li>`
    }

    if (website) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Website</strong><br><a class="text-blue-600 hover:text-blue-500 focus:text-blue:500" target="_blank" href="${website}">${website}</a></li>`
    }

    if (phone_number) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Telefon</strong><br><a class="text-blue-600 hover:text-blue-500 focus:text-blue:500" href="tel:${phone_number}">${phone_number}</a></li>`
    }

    if (director) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Schulleiter</strong><br>${director}</li>`
    }

    document.querySelector('#details').classList.remove('hidden')
    document.querySelector('#detailList').innerHTML = detailOutput

    document.querySelector('title').innerHTML = facility
    document.querySelector('meta[property="og:title"]').setAttribute('content', facility)
}


const defaultIcon = L.icon({
    iconUrl: './static/marker-icon-blue.png',
    shadowUrl: './static/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    tooltipAnchor: [2, -41],
    shadowSize: [45, 41]
})


const selectedIcon = L.icon({
    iconUrl: './static/marker-icon-red.png',
    shadowUrl: './static/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    tooltipAnchor: [2, -41],
    shadowSize: [45, 41]
})


function marker(data) {
    let markers = L.markerClusterGroup({
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 15
    })

    const geojsonGroup = L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                document.getElementById('filter').scrollTo({
                    top: 0,
                    left: 0
                })
                
                const currentZoom = map.getZoom()

                if (currentZoom < 15) {
                    map.setView(e.latlng, 15)
                }
                else {
                    map.setView(e.latlng, currentZoom)
                }

                renderFeatureDetails(e.target.feature)
            })
        },
        pointToLayer: function (feature, latlng) {
            const label = String(feature.properties.facility)

            return L.marker(latlng, {icon: defaultIcon}).bindTooltip(label, {
                permanent: false,
                direction: 'top'
            }).openTooltip()
        }
    })


    markers.on('click', function (a) {
        if (previousSelectedMarker !== null) {
            previousSelectedMarker.setIcon(defaultIcon)
        }

        a.layer.setIcon(selectedIcon)
        previousSelectedMarker = a.layer
    })

    markers.addLayer(geojsonGroup)
    map.addLayer(markers)
}
