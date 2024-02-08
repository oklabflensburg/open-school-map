import L from 'leaflet'
import 'leaflet-control-geocoder'
import 'leaflet.markercluster'

import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'

import schools from 'url:../data/schulen_flensburg.geojson'
import districts from 'url:../data/flensburg_stadtteile.geojson'

import markerDefault from 'url:../static/marker-icon-default.webp'
import markerActive from 'url:../static/marker-icon-active.webp'


let dataObject = null
let cluster = null

fetch(schools, {
  method: 'GET'
})
  .then((response) => response.json())
  .then((data) => {
    renderPromise(data, 0)
  })
  .catch(function (error) {
    console.log(error)
  })


fetch(districts, {
  method: 'GET'
})
  .then((response) => response.json())
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
  tileSize: 256,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

let geocoder = L.Control.Geocoder.nominatim()
let previousSelectedMarker = null
let slugUrlActive = null


if (typeof URLSearchParams !== 'undefined' && location.search) {
  // parse /?geocoder=nominatim from URL
  const params = new URLSearchParams(location.search)
  const geocoderString = params.get('geocoder')

  if (geocoderString && L.Control.Geocoder[geocoderString]) {
    console.log('Using geocoder', geocoderString)
    geocoder = L.Control.Geocoder[geocoderString]()
  }
  else if (geocoderString) {
    console.warn('Unsupported geocoder', geocoderString)
  }
}

const osmGeocoder = new L.Control.geocoder({
  query: 'Flensburg',
  position: 'topright',
  placeholder: 'Adresse oder Ort',
  defaultMarkGeocode: false
}).addTo(map)


osmGeocoder.on('markgeocode', (e) => {
  const bounds = L.latLngBounds(e.geocode.bbox._southWest, e.geocode.bbox._northEast)
  map.fitBounds(bounds)
})


function addDistrictsLayer(data) {
  L.geoJson(data, {
    style: layerStyle.standard
  }).addTo(map)
}


function capitalizeEachWord(str) {
  return str.replace(/-/g, ' ').replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}


function renderFeatureDetails(feature) {
  const slug = feature.properties.slug
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

  const title = `${capitalizeEachWord(slug)} - Schulen in Flensburg`

  document.querySelector('title').innerHTML = title
  document.querySelector('meta[property="og:title"]').setAttribute('content', title)
  document.querySelector('meta[property="og:url"]').setAttribute('content', `${window.location.href}${slug}`)

  let detailOutput = ''
  let graduation = ''
  let daycare = ''
  let school = ''

  const graduation_esa_tag = '<a href="#" class="font-sans bg-blue-100 text-blue-800 hover:bg-blue-500 focus:bg-blue-500 hover:text-white focus:text-white text-xs font-medium me-2 px-2.5 py-1 rounded">ESA</a>'
  const graduation_msa_tag = '<a href="#" class="font-sans bg-blue-100 text-blue-800 hover:bg-blue-500 focus:bg-blue-500 hover:text-white focus:text-white text-xs font-medium me-2 px-2.5 py-1 rounded">MSA</a>'
  const graduation_abi_tag = '<a href="#" class="font-sans bg-blue-100 text-blue-800 hover:bg-blue-500 focus:bg-blue-500 hover:text-white focus:text-white text-xs font-medium me-2 px-2.5 py-1 rounded">Abitur</a>'

  const special_needs_school_tag = '<a href="#" class="font-sans bg-blue-100 text-blue-800 hover:bg-blue-500 focus:bg-blue-500 hover:text-white focus:text-white text-xs font-medium me-2 px-2.5 py-1 rounded">Förderschule</a>'
  const elementary_school_tag = '<a href="#" class="font-sans bg-blue-100 text-blue-800 hover:bg-blue-500 focus:bg-blue-500 hover:text-white focus:text-white text-xs font-medium me-2 px-2.5 py-1 rounded">Grundschule</a>'
  const secondary_school_tag = '<a href="#" class="font-sans bg-blue-100 text-blue-800 hover:bg-blue-500 focus:bg-blue-500 hover:text-white focus:text-white text-xs font-medium me-2 px-2.5 py-1 rounded">Gemeinschaftsschule</a>'
  const high_school_tag = '<a href="#" class="font-sans bg-blue-100 text-blue-800 hover:bg-blue-500 focus:bg-blue-500 hover:text-white focus:text-white text-xs font-medium me-2 px-2.5 py-1 rounded">Gymnasium</a>'

  const open_all_day_tag = '<a href="#" class="font-sans bg-blue-100 text-blue-800 hover:bg-blue-500 focus:bg-blue-500 hover:text-white focus:text-white text-xs font-medium me-2 px-2.5 py-1 rounded">Offene Ganztagsschule</a>'
  const compulsory_all_day_tag = '<a href="#" class="font-sans bg-blue-100 text-blue-800 hover:bg-blue-500 focus:bg-blue-500 hover:text-white focus:text-white text-xs font-medium me-2 px-2.5 py-1 rounded">Gebundene Ganztagsschule</a>'

  if (facility !== '') {
    detailOutput += `<li class="pb-2 text-xl lg:text-2xl"><strong>${facility}</strong></li>`
  }

  if (street_name !== '' && house_number !== '' && postal_code !== '' && city !== '') {
    detailOutput += `<li class="last-of-type:pb-2 py-1 mb-3">${street_name} ${house_number}<br>${postal_code} ${city}</li>`
  }

  if (prerequisite) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Voraussetzung</strong><br>${prerequisite}</li>`
  }

  if (employees > 0) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${employees}</strong> Angestellte</li>`
  }

  if (teachers > 0) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${teachers}</strong> Lehrkräfte</li>`
  }

  if (students > 0) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${students}</strong> Schüler:innen</li>`
  }

  if (grades) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Jahrgangstufen</strong> ${grades}</li>`
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
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Abschlüsse</strong><br>${graduation}</li>`
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

  if (school !== '') {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Schulform</strong><br>${school}</li>`
  }

  if (open_all_day > 0) {
    daycare += open_all_day_tag
  }

  if (compulsory_all_day > 0) {
    daycare += compulsory_all_day_tag
  }

  if (school !== '') {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Ganztagsbetreuung</strong><br>${daycare}</li>`
  }

  if (institution) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Träger</strong><br>${institution}</li>`
  }

  if (website) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Website</strong><br><a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" target="_blank" href="${website}">${website}</a></li>`
  }

  if (phone_number) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Telefon</strong><br><a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" href="tel:${phone_number}">${phone_number}</a></li>`
  }

  if (director) {
    detailOutput += `<li class="pt-2"><strong>Schulleitung</strong><br>${director}</li>`
  }

  document.querySelector('#details').classList.remove('hidden')
  document.querySelector('#detailList').innerHTML = detailOutput

  document.querySelector('title').innerHTML = facility
  document.querySelector('meta[property="og:title"]').setAttribute('content', facility)
}


const defaultIcon = L.icon({
  iconUrl: markerDefault,
  iconSize: [30, 36],
  iconAnchor: [15, 36],
  tooltipAnchor: [0, -37]
})


const selectedIcon = L.icon({
  iconUrl: markerActive,
  iconSize: [30, 36],
  iconAnchor: [15, 36],
  tooltipAnchor: [0, -37]
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
    filter(feature) {
      if (feature.properties.district_id === districtId) {
        return true
      }
      else if (districtId === 0) {
        return true
      }

      return false
    },
    onEachFeature(feature, layer) {
      const slug = String(feature.properties.slug)
      const path = decodeURIComponent(window.location.pathname)

      if (slug === path.slice(1)) {
        document.querySelector('#about').classList.add('hidden')
        layer.setIcon(selectedIcon)
        previousSelectedMarker = layer
        renderFeatureDetails(feature)
        map.setView(layer._latlng, 18)
        slugUrlActive = true
      }

      layer.on('click', function (e) {
        document.getElementById('filter').scrollTo({
          top: 0,
          left: 0
        })

        const currentZoom = map.getZoom()

        if (currentZoom < 15) {
          map.setView(e.latlng, 15)
        }

        document.querySelector('#about').classList.add('hidden')
        map.setView(e.latlng, 18)
        renderFeatureDetails(e.target.feature)
        history.pushState({ page: slug }, slug, slug)
      })
    },
    pointToLayer(feature, latlng) {
      const label = String(feature.properties.facility)

      return L.marker(latlng, { icon: defaultIcon }).bindTooltip(label, {
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
  map.addLayer(cluster)

  const lengthFacilities = geojsonGroup.getLayers().length
  const amountOfFacilities = formatAmountOfFacilities(lengthFacilities)
  let hintAmountOfFacilities = 'Keine Treffer gefunden'

  if (amountOfFacilities > 0) {
    hintAmountOfFacilities = `Anzahl angezeigter Schulen ${amountOfFacilities}`
  }

  if (slugUrlActive === null) {
    map.fitBounds(cluster.getBounds(), { padding: [0, 0, 0, 0] })
  }

  document.querySelector('#amountFacilities').innerHTML = hintAmountOfFacilities
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

window.addEventListener('popstate', (event) => {
  console.debug(`location: ${document.location}, state: ${JSON.stringify(event.state)}`)
})