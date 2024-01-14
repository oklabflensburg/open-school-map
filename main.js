let dataObject = null
let cluster = null

fetch('./data/schulen_flensburg.geojson', {
    method: 'GET'
})
.then((response) => {
    return response.json()
})
.then((data) => {
    renderPromise(data, 0)
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
    standard: {
        color: '#fff',
        fillColor: '#b0a944',
        fillOpacity: 0.4,
        opacity: 0.6,
        weight: 3
    }
}


const map = L.map('map').setView([54.7836, 9.4321], 13)

/* L.tileLayer.wms('https://sgx.geodatenzentrum.de/wms_basemapde?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities', {
  layers: 'de_basemapde_web_raster_farbe',
  maxZoom: 19,
  attribution: '<a href="https://www.bkg.bund.de">© GeoBasis-DE / BKG (2024)</a> | <a href="https://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>'
}).addTo(map) */

/* L.tileLayer('https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png', {
    maxZoom: 19,
    attribution: '<a href="https://www.bkg.bund.de">© GeoBasis-DE / BKG (2024)</a> | <a href="https://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>'
}).addTo(map) */

L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

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
    const private_school = feature.properties.private_school
    const special_needs_school = feature.properties.special_needs_school
    const elementary_school = feature.properties.elementary_school
    const secondary_school = feature.properties.secondary_school
    const high_school = feature.properties.high_school

    let detailOutput = ''
    let graduation = ''
    let school = ''

    let graduation_esa_tag = '<span class="bg-pink-100 text-pink-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-pink-900 dark:text-pink-300">ESA</span>'
    let graduation_msa_tag = '<span class="bg-pink-100 text-pink-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-pink-900 dark:text-pink-300">MSA</span>'
    let graduation_abi_tag = '<span class="bg-pink-100 text-pink-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-pink-900 dark:text-pink-300">Abitur</span>'

    let private_school_tag = '<span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Privatschule</span>'
    let special_needs_school_tag = '<span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Förderschule</span>'
    let elementary_school_tag = '<span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Grundschule</span>'
    let secondary_school_tag = '<span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Gemeinschaftsschule</span>'
    let high_school_tag = '<span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Gymnasium</span>'
    let open_all_day_tag = '<span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Offene Ganztagsschule</span>'
    let compulsory_all_day_tag = '<span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Gebundene Ganztagsschule</span>'

    if (facility !== '') {
        detailOutput += `<li class="py-2 px-2 pt-1 text-xl"><strong>${facility}</strong></li>`
    }

    if (street_name !== '' && house_number !== '' && postal_code !== '' && city !== '') {
        detailOutput += `<li class="last-of-type:pb-2 px-2 py-1">${street_name} ${house_number}<br>${postal_code} ${city}</li>`
    }

    if (prerequisite) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Voraussetzung</strong> ${prerequisite}</li>`
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

    if (grades) {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Jahrgangstufen</strong> ${grades}</li>`
    }

    if (graduation_esa > 0) {
        graduation += graduation_esa_tag
    }

    if (graduation_msa > 0) {
        graduation += graduation_msa_tag
    }

    if (graduation_abi > 0) {
        graduation += graduation_abi_tag
    }

    if (graduation !== '') {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Abschlüsse</strong><br>${graduation}</li>`
    }

    if (private_school > 0) {
        school += private_school_tag
    }

    if (special_needs_school > 0) {
        school += special_needs_school_tag
    }

    if (elementary_school > 0) {
        school += elementary_school_tag
    }

    if (secondary_school > 0) {
        school += secondary_school_tag
    }

    if (high_school > 0) {
        school += high_school_tag
    }

    if (open_all_day > 0) {
        school += open_all_day_tag
    }

    if (compulsory_all_day > 0) {
        school += compulsory_all_day_tag
    }

    if (school !== '') {
        detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Schultyp</strong><br>${school}</li>`
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


function formatAmountOfFacilities(amountOfFacilities) {
    const numberFormat = new Intl.NumberFormat('de-DE')
    const amount = numberFormat.format(amountOfFacilities)

    return amount
}


function renderPromise(data, districtId) {
    document.querySelector('#details').classList.add('hidden')
    document.querySelector('#detailList').innerHTML = ''

    dataObject = data

    if (cluster) {
        map.removeLayer(cluster)
    }

    const geojsonGroup = L.geoJSON(data, {
        filter: function (feature) {
            if (feature.properties.district_id === districtId) {
                return true
            } else if (districtId === 0) {
                return true
            }
  
        },
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

    cluster = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        disableClusteringAtZoom: 19,
        maxClusterRadius: 40
    })

    cluster.on('click', function (a) {
        if (previousSelectedMarker !== null) {
            previousSelectedMarker.setIcon(defaultIcon)
        }

        a.layer.setIcon(selectedIcon)
        previousSelectedMarker = a.layer
    })

    cluster.addLayer(geojsonGroup)

    const lengthFacilities = geojsonGroup.getLayers().length
    const amountOfFacilities = formatAmountOfFacilities(lengthFacilities)
    let hintAmountOfFacilities = 'Keine Treffer gefunden'

    if (amountOfFacilities > 0) {
        hintAmountOfFacilities = `Anzahl angezeigter Schulen ${amountOfFacilities}`
    }

    document.querySelector('#amountFacilities').innerHTML = hintAmountOfFacilities

    map.addLayer(cluster)
    map.fitBounds(cluster.getBounds(), {padding: [0, 0, 0, 0]})
}


const queryform = document.querySelector('#form')

if (queryform.length) {
    queryform.addEventListener('change', (e) => {
        e.preventDefault()

        const data = new FormData(queryform)
        const districtId = parseInt(data.get('district'))

        renderPromise(dataObject, districtId)
    })
}
