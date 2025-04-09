import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'

import markerDefault from 'url:../static/marker-icon-default.webp'
import markerSelected from 'url:../static/marker-icon-active.webp'

import { Env } from './env.js'

// Initialize environment
const env = new Env()
env.injectLinkContent('.contact-mail', 'mailto:', '', env.contactMail, 'E-Mail')

// Map configuration
const center = [54.79443515, 9.43205485]
const zoomLevelInitial = 13
const zoomLevelDetail = 19
const addSchoolsByBounds = false

const map = L.map('map', { zoomControl: false }).setView(center, zoomLevelInitial)

const markerClusterGroup = L.markerClusterGroup({
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 19
})

// Marker icons
const defaultIcon = L.icon({
  iconUrl: markerDefault,
  iconSize: [30, 36],
  iconAnchor: [15, 36],
  tooltipAnchor: [0, -37]
})

const selectedIcon = L.icon({
  iconUrl: markerSelected,
  iconSize: [30, 36],
  iconAnchor: [15, 36],
  tooltipAnchor: [0, -37]
})

// State variables
const markerMap = new Map()
let isBoundsSet = false
let previousSelectedMarker = null
let currentLayer = null

// Utility functions
function capitalizeEachWord(str) {
  return str.replace(/-/g, ' ').replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  }
  catch {
    return false
  }
}

function findMarkerById(id) {
  const marker = markerMap.get(id)
  if (marker && typeof marker.setIcon === 'function') {
    return marker
  }
  console.warn(`Marker with ID ${id} is not a valid Leaflet marker.`)
  return null
}

function setSelectedMarker(marker) {
  if (!marker || typeof marker.setIcon !== 'function') {
    console.error('Invalid marker passed to setSelectedMarker:', marker)
    return
  }
  if (previousSelectedMarker) {
    previousSelectedMarker.setIcon(defaultIcon)
  }
  marker.setIcon(selectedIcon)
  previousSelectedMarker = marker
}

function addSchoolsToMap(data, fetchAdditionalSchools, zoomLevel) {
  if (currentLayer) {
    currentLayer.removeLayer(currentLayer)
  }
  else {
    currentLayer = markerClusterGroup
  }

  const geojsonGroup = L.geoJSON(data, {
    onEachFeature(feature, layer) {
      const id = feature.id
      markerMap.set(id, layer)
      layer.on('click', async () => {
        cleanSchoolMeta()
        await fetchSchoolDetailById(id)
        setSelectedMarker(layer)
      })
    },
    pointToLayer(feature, latlng) {
      return L.marker(latlng, { icon: defaultIcon }).bindTooltip(feature.properties.label.split(/, | -/)[0].trim(), {
        permanent: false,
        direction: 'top'
      })
    }
  })

  currentLayer.addLayer(geojsonGroup)
  map.addLayer(currentLayer)

  if (!isBoundsSet) {
    map.fitBounds(currentLayer.getBounds(), { zoom: zoomLevel })
    isBoundsSet = true
  }
}

function handleWindowSize() {
  const innerWidth = window.innerWidth

  // Handle sidebar responsive behavior
  const sidebar = document.querySelector('#sidebar')
  if (!sidebar) {
    return
  }

  // Adjust map padding to accommodate the control panel
  map.invalidateSize()

  // Position the map controls appropriately based on screen size
  const mapControls = document.querySelector('#mapControls')
  if (mapControls) {
    if (innerWidth < 640) {
      // Mobile position (bottom of screen)
      mapControls.style.top = 'auto'
      mapControls.style.bottom = '70px'  // Position above the mobile bottom bar
    }
    else {
      // Desktop position (top of screen)
      mapControls.style.bottom = 'auto'
      mapControls.style.top = '10px'
    }
  }

  if (innerWidth < 640) {
    // If mobile and sidebar is showing
    if (!sidebar.classList.contains('hidden') && !sidebar.classList.contains('bottom-sheet')) {
      sidebar.classList.add('bottom-sheet', 'active')
      sidebar.classList.remove('absolute')
    }
  }
  else if (sidebar.classList.contains('bottom-sheet')) {
    // If desktop and sidebar is showing as bottom sheet
    sidebar.classList.remove('bottom-sheet')
    sidebar.classList.add('absolute')
  }

  // Reset map position when switching from mobile to desktop
  if (innerWidth >= 640) {
    adjustMapForBottomSheet(false)
  }
  else if (sidebar.classList.contains('active')) {
    // Re-apply adjustment if we're in mobile and sidebar is open
    adjustMapForBottomSheet(true)
  }
}

// Fetch functions
async function fetchJsonData(url) {
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json()
  }
  catch (error) {
    console.error('Fetch error:', error)
    return null
  }
}

function fetchBlob(url, SchoolFunction) {
  if (!url || typeof url !== 'string') {
    return
  }

  const container = document.querySelector('#detailImage')
  container.innerHTML = ''

  const imageElement = document.createElement('img')
  imageElement.src = url

  imageElement.onload = () => {
    imageElement.classList.add('loaded')
  }

  imageElement.setAttribute('alt', SchoolFunction || 'Schulkarte für Schleswig-Holstein')

  const divElement = document.createElement('div')
  divElement.classList.add('px-3', 'py-2', 'w-full', 'text-xs', 'text-gray-100', 'bg-gray-600')
  divElement.innerText = 'Foto © tbd.'

  if (!container) {
    console.error('Element #detailImage not found')
    return
  }

  container.appendChild(imageElement)
  container.appendChild(divElement)
}

async function fetchSchoolPointsByBounds() {
  const bounds = map.getBounds()
  const bbox = {
    xmin: bounds.getWest(),
    ymin: bounds.getSouth(),
    xmax: bounds.getEast(),
    ymax: bounds.getNorth()
  }

  // Check if we have a saved school type filter
  const savedSchoolType = getCookie('selectedSchoolType')

  if (savedSchoolType && savedSchoolType !== '') {
    // If we have a saved filter, use it instead of the default bounds query
    fetchSchoolsByType(savedSchoolType)
  } else {
    // Otherwise proceed with the normal bounds query
    const url = `${process.env.PARCEL_BASE_API_URL}/school/v1/bounds?xmin=${bbox.xmin}&ymin=${bbox.ymin}&xmax=${bbox.xmax}&ymax=${bbox.ymax}`
    const data = await fetchJsonData(url)
    addSchoolsToMap(data, addSchoolsByBounds, zoomLevelInitial)

    if (previousSelectedMarker) {
      const previousMarkerId = previousSelectedMarker.feature.id
      const newSelectedMarker = findMarkerById(previousMarkerId)
      if (newSelectedMarker) {
        setSelectedMarker(newSelectedMarker)
      }
    }
  }
}

async function fetchSchoolPointsByPosition(lat, lng) {
  const url = `${process.env.PARCEL_BASE_API_URL}/school/v1/radius?lat=${lat}&lng=${lng}`
  const data = await fetchJsonData(url)
  addSchoolsToMap(data, addSchoolsByBounds, zoomLevelInitial)

  if (previousSelectedMarker) {
    const previousMarkerId = previousSelectedMarker.feature.id
    const newSelectedMarker = findMarkerById(previousMarkerId)
    if (newSelectedMarker) {
      setSelectedMarker(newSelectedMarker)
    }
  }
}

async function fetchSchoolDetailBySlug(slug) {
  const url = `${process.env.PARCEL_BASE_API_URL}/school/v1/details?slug=${slug}`
  const data = await fetchJsonData(url)

  if (!data || !data[0]) {
    return
  }

  const geoJsonData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: data[0].id,
        geometry: data[0].geojson,
        properties: { label: data[0].name.split(/, | -/)[0].trim(), slug: data[0].slug }
      }
    ]
  }

  if (isValidUrl(data[0].photo_link)) {
    document.querySelector('#detailImage').innerHTML = ''
    fetchBlob(data[0].photo_link, data[0].name)
  }

  renderSchoolMeta(data[0])
  addSchoolsToMap(geoJsonData, true, zoomLevelDetail)

  let matchingMarker = findMarkerById(data[0].id)
  if (!matchingMarker) {
    console.warn('No matching marker found. Loading additional markers...')
    await fetchSchoolPointsByBounds()
    matchingMarker = findMarkerById(data[0].id)
  }
  if (matchingMarker) {
    setSelectedMarker(matchingMarker)
  }
}

async function fetchSchoolDetailById(id) {
  const url = `${process.env.PARCEL_BASE_API_URL}/school/v1/details?school_id=${id}`
  const data = await fetchJsonData(url)

  if (!data || !data[0]) {
    return
  }

  if (isValidUrl(data[0].photo_link)) {
    fetchBlob(data[0].photo_link, data[0].name)
  }

  navigateTo(data[0].slug)
  renderSchoolMeta(data[0])
}

async function fetchSchoolTypes() {
  const url = `${process.env.PARCEL_BASE_API_URL}/school/v1/types`
  try {
    const data = await fetchJsonData(url)
    if (data && Array.isArray(data)) {
      return data
    }
    console.warn('Unexpected response format for school types:', data)
    return []
  }
  catch (error) {
    console.error('Error fetching school types:', error)
    return []
  }
}

async function fetchSchoolsByType(schoolType) {
  const url = `${process.env.PARCEL_BASE_API_URL}/school/v1/type?school_type=${schoolType}`
  const data = await fetchJsonData(url)

  if (data) {
    addSchoolsToMap(data, addSchoolsByBounds, zoomLevelInitial)
  }
  else {
    cleanSchoolMeta()
    if (currentLayer) {
      currentLayer.clearLayers()
    }
  }
}

// Cookie utility functions
function setCookie(name, value, days = 30) {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `; expires=${date.toUTCString()}`
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`
}

function getCookie(name) {
  const nameEQ = `${name}=`
  const ca = document.cookie.split(';')
  for (let i = 0;i < ca.length;i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

function hasCookie(name) {
  return getCookie(name) !== null
}

async function createSchoolTypeSelect() {
  const schoolTypes = await fetchSchoolTypes()
  const container = document.querySelector('#schoolTypes')

  if (!container) {
    return
  }

  // Create label for the select element
  const label = document.createElement('label')
  label.htmlFor = 'schoolType'
  label.textContent = 'Schulart filtern:'
  label.classList.add('block', 'text-xs', 'sm:text-sm', 'font-medium', 'text-gray-700', 'mb-1')

  const select = document.createElement('select')
  select.id = 'schoolType'
  select.name = 'schoolType'
  select.classList.add('p-1', 'sm:p-2', 'w-full', 'text-xs', 'sm:text-sm', 'border', 'border-gray-300', 'rounded-md', 'bg-white', 'focus:ring-indigo-500', 'focus:border-indigo-500')

  const defaultOption = document.createElement('option')
  defaultOption.value = ''
  defaultOption.textContent = 'Alle Schularten'
  select.appendChild(defaultOption)

  schoolTypes.forEach((type) => {
    const option = document.createElement('option')
    option.value = type.code
    option.textContent = type.name
    select.appendChild(option)
  })

  container.innerHTML = ''
  container.appendChild(label)
  container.appendChild(select)

  // Check if we have a saved school type
  const savedSchoolType = getCookie('selectedSchoolType')
  if (savedSchoolType) {
    // Set the select value to the saved value
    select.value = savedSchoolType
    // Also trigger the filter immediately if we have a saved type
    if (savedSchoolType !== '') {
      fetchSchoolsByType(savedSchoolType)
    }
  }

  select.addEventListener('change', (event) => {
    const selectedType = event.target.value
    // Save selection to cookie
    setCookie('selectedSchoolType', selectedType)

    if (selectedType && selectedType !== '') {
      fetchSchoolsByType(selectedType)
    }
    else {
      fetchSchoolPointsByBounds()
    }
  })
}

function renderSchoolMeta(data) {
  const { slug, street, house_number, zipcode, city, telephone, school_types, email, name, fax, website } = data

  const title = `${capitalizeEachWord(slug || name)} - Schulkarte für Schleswig-Holstein`
  document.title = title
  document.querySelector('meta[property="og:title"]').setAttribute('content', title)
  document.querySelector('meta[property="og:url"]').setAttribute('content', `${window.location.href}${slug}`)

  const schoolName = name.split(/, | -/)[0].trim()

  let detailOutput = `
    <li class="text-xl lg:text-2xl"><strong>${schoolName}</strong></li>
    <li class="last-of-type:pb-2 py-1 mb-3">${street} ${house_number}<br>${zipcode} ${city}</li>`

  if (email) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>E-Mail</strong><br><a href="mailto:${email}" target="_blank">${email}</a></li>`
  }

  if (website) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Website</strong><br><a href="${website}" target="_blank">${website}</a></li>`
  }

  if (telephone) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Telefon</strong><br>${telephone}</li>`
  }

  if (fax) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Fax</strong><br>${fax}</li>`
  }

  if (school_types.length > 0) {
    const schoolTypeTitle = school_types.length === 1 ? 'Schulart' : 'Schularten'
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${schoolTypeTitle}</strong><br><ul>`

    school_types.forEach((schoolType) => {
      detailOutput += `<li>${schoolType}</li>`
    })

    detailOutput += '</ul></li>'
  }

  document.querySelector('#detailList').innerHTML = detailOutput
  document.querySelector('#about').classList.add('hidden')

  const sidebar = document.querySelector('#sidebar')
  // Check if we're in mobile view (less than 640px)
  if (window.innerWidth < 640) {
    sidebar.classList.remove('hidden')
    sidebar.classList.add('bottom-sheet', 'active')
    sidebar.classList.remove('absolute')

    // Adjust map position for bottom sheet
    adjustMapForBottomSheet(true)
  }
  else {
    sidebar.classList.remove('hidden')
    sidebar.classList.add('absolute')
    sidebar.classList.remove('bottom-sheet', 'active')
  }

  document.querySelector('#sidebarContent').classList.remove('hidden')

  if (sidebar) {
    sidebar.scrollTop = 0
  }
}

function cleanSchoolMeta() {
  if (previousSelectedMarker) {
    previousSelectedMarker.setIcon(defaultIcon)
    previousSelectedMarker = null
  }

  document.querySelector('#detailList').innerHTML = ''
  document.querySelector('#detailImage').innerHTML = ''

  // Reset URL to home when closing school details
  navigateTo('home', true)

  const sidebar = document.querySelector('#sidebar')
  if (window.innerWidth < 640 && sidebar.classList.contains('bottom-sheet')) {
    sidebar.classList.remove('active')
    // Reset map position
    adjustMapForBottomSheet(false)

    // Add a short delay before hiding to allow animation to complete
    setTimeout(() => {
      if (!sidebar.classList.contains('active')) {
        sidebar.classList.add('hidden')
      }
    }, 300)
  }
  else {
    sidebar.classList.add('hidden')
    sidebar.classList.remove('absolute')
  }

  document.querySelector('#about').classList.remove('hidden')
  document.querySelector('#sidebarContent').classList.add('hidden')
}

function navigateTo(screen, updateHistory = true) {
  if (updateHistory) {
    history.pushState({ screen }, '', screen === 'home' ? '/' : `/${screen}`)
  }
  updateScreen(screen)
}

function updateScreen(screen) {
  const title = 'Schulkarte für Schleswig-Holstein – Finde Schulen in deiner Nähe'
  document.title = screen === 'home' ? title : `${screen} - ${title}`
  document.querySelector('meta[property="og:title"]').setAttribute('content', document.title)
}

function adjustMapForBottomSheet(isOpen = true) {
  const mapContainer = document.querySelector('#map')
  const sidebar = document.querySelector('#sidebar')

  if (!mapContainer || !sidebar) {
    return
  }

  if (isOpen && window.innerWidth < 640 && sidebar.classList.contains('bottom-sheet')) {
    // Calculate visible bottom sheet height (could be partial or full based on design)
    const bottomSheetHeight = sidebar.offsetHeight * 0.7 // Using 70% as default, adjust as needed

    // Translate the map up
    mapContainer.style.transition = 'transform 0.3s ease'
    mapContainer.style.transform = `translateY(-${bottomSheetHeight}px)`

    // Also invalidate map size after transformation
    setTimeout(() => {
      map.invalidateSize()
    }, 300)
  }
  else {
    // Reset map position
    mapContainer.style.transition = 'transform 0.3s ease'
    mapContainer.style.transform = 'translateY(0)'

    // Invalidate map size after reset
    setTimeout(() => {
      map.invalidateSize()
    }, 300)
  }
}

// Event listeners
window.onload = async () => {
  L.tileLayer('https://tiles.oklabflensburg.de/sgm/{z}/{x}/{y}.png', {
    maxZoom: 20,
    tileSize: 256,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="dc:rights">OpenStreetMap</a> contributors'
  }).addTo(map)

  // Add padding to the map to make room for the controls
  // Fix race condition by moving this assignment before any async operations
  map.paddingTopLeft = [0, 60]

  map.on('moveend', fetchSchoolPointsByBounds)
  map.on('click', cleanSchoolMeta)

  document.querySelector('#sidebarCloseButton')?.addEventListener('click', (e) => {
    e.preventDefault()
    cleanSchoolMeta()
  })

  // Check if we need to add a sidebar toggle
  const sidebarToggle = document.querySelector('#sidebarToggle')
  if (!sidebarToggle) {
    // If no toggle exists, we'll use the sidebar handle for this on mobile
    const sidebar = document.querySelector('#sidebar')
    if (sidebar) {
      const sidebarHandle = document.createElement('div')
      sidebarHandle.id = 'sidebar-handle'
      sidebar.insertBefore(sidebarHandle, sidebar.firstChild)

      sidebarHandle.addEventListener('click', (e) => {
        e.preventDefault()
        if (sidebar.classList.contains('bottom-sheet')) {
          sidebar.classList.toggle('active')
          // Adjust map position when toggling
          adjustMapForBottomSheet(sidebar.classList.contains('active'))
        }
      })
    }
  }
  else {
    sidebarToggle.addEventListener('click', (e) => {
      e.preventDefault()
      const sidebar = document.querySelector('#sidebar')
      if (sidebar.classList.contains('bottom-sheet')) {
        sidebar.classList.toggle('active')
      }
      else {
        sidebar.classList.toggle('translate-y-full')
      }
    })
  }

  document.getElementById('geoLocation').addEventListener('change', function (event) {
    const checkbox = event.target

    if (checkbox.name === 'myLocation' && checkbox.checked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchSchoolPointsByPosition(position.coords.latitude, position.coords.longitude)
            map.setView([position.coords.latitude, position.coords.longitude], 16)
          },
          (error) => {
            console.error('Error obtaining geolocation:', error.message)
            // Reset the checkbox to unchecked when geolocation is denied/fails
            checkbox.checked = false

            // Show appropriate message to user based on error type
            if (error.code === error.PERMISSION_DENIED) {
              alert('Standortfreigabe wurde verweigert. Bitte erlauben Sie den Zugriff auf Ihren Standort in den Browsereinstellungen, um diese Funktion zu nutzen.')
            }
            else if (error.code === error.TIMEOUT) {
              alert('Zeitüberschreitung bei der Standortabfrage. Bitte versuchen Sie es erneut.')
            }
            else {
              alert('Standortbestimmung fehlgeschlagen. Bitte versuchen Sie es später erneut.')
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      }
      else {
        console.error('Geolocation is not supported by this browser.')
        // Reset the checkbox if geolocation is not supported
        checkbox.checked = false
        alert('Ihr Browser unterstützt keine Standortbestimmung.')
      }
    }
  })

  const path = decodeURIComponent(window.location.pathname)
  const screen = path === '/' ? 'home' : path.slice(1)
  if (!history.state) {
    history.replaceState({ screen }, '', path)
  }

  updateScreen(screen)

  if (screen === 'home') {
    map.setView(center, zoomLevelInitial)
    // We'll create school type select first to let it handle initial filter if needed
    await createSchoolTypeSelect()

    // Check if there's a saved school type filter
    const savedSchoolType = getCookie('selectedSchoolType')
    if (savedSchoolType && savedSchoolType !== '') {
      fetchSchoolsByType(savedSchoolType)
    } else {
      fetchSchoolPointsByBounds()
    }
  }
  else {
    const data = await fetchSchoolDetailBySlug(screen)
    if (data && data[0] && data[0].geojson && data[0].geojson.coordinates) {
      const [lng, lat] = data[0].geojson.coordinates
      map.setView([lat, lng], zoomLevelDetail)
    }
    await createSchoolTypeSelect()
  }

  // Initialize window size handling immediately
  handleWindowSize()
}

window.addEventListener('popstate', (event) => {
  const screen = event.state?.screen || 'home'
  if (screen === 'home') {
    cleanSchoolMeta()
    fetchSchoolPointsByBounds()
  }
  else {
    fetchSchoolDetailBySlug(screen)
  }
})

window.addEventListener('resize', handleWindowSize)
handleWindowSize()