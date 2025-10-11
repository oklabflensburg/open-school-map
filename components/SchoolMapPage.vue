<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch, watchEffect } from 'vue'
import type { FeatureCollection, Feature } from 'geojson'

// ============================================================================
// Types & Interfaces
// ============================================================================

type SchoolType = {
  code: string
  name: string
}

type SchoolDetail = {
  id: number
  slug: string
  name: string
  street: string
  house_number: string
  zipcode: string
  city: string
  telephone?: string | null
  fax?: string | null
  email?: string | null
  website?: string | null
  geojson: {
    type: 'Point'
    coordinates: [number, number]
  }
  photo_link?: string | null
  school_types: string[]
}

// ============================================================================
// Composables & Configuration
// ============================================================================

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

// Map configuration constants
const center: [number, number] = [54.79443515, 9.43205485]
const initialZoom = 13
const detailZoom = 19

// Map instance and Leaflet objects
const mapContainer = ref<HTMLDivElement | null>(null)
const mapInstance = shallowRef<any>(null)
let leaflet: any = null
let markerClusterGroup: any = null
let defaultIcon: any = null
let selectedIcon: any = null
const markerById = new Map<number, any>()
let previousSelectedMarker: any = null

// State management
const schoolTypes = ref<SchoolType[]>([])
const selectedSchoolType = ref('')
const selectedSchool = ref<SchoolDetail | null>(null)
const detailImageUrl = ref<string | null>(null)
const detailImageAlt = ref('')
const isLoadingDetails = ref(false)

// UI state
const geolocationEnabled = ref(false)
const viewportWidth = ref(process.client ? window.innerWidth : 1024)
const isMobile = computed(() => viewportWidth.value < 640)
const isSidebarCollapsed = ref(false)
const isHamburgerMenuOpen = ref(false)

// Map state
const hasInitialBounds = ref(false)
const pendingViewRestore = ref<{ lat: number; lng: number; zoom: number } | null>(null)
const isHandlingMapClick = ref(false)

// Runtime config
const baseApiUrl = computed(() => runtimeConfig.public.baseApiUrl?.replace(/\/$/, '') || '')
const baseWebsiteOrigin = computed(() => runtimeConfig.public.websiteOrigin?.replace(/\/$/, '') || '')

const contactMail = computed(() => runtimeConfig.public.contactMail || '')
const contactPhone = computed(() => runtimeConfig.public.contactPhone || '')
const privacyContactPerson = computed(() => runtimeConfig.public.privacyContactPerson || '')
const addressName = computed(() => runtimeConfig.public.addressName || '')
const addressStreet = computed(() => runtimeConfig.public.addressStreet || '')
const addressHouseNumber = computed(() => runtimeConfig.public.addressHouseNumber || '')
const addressPostalCode = computed(() => runtimeConfig.public.addressPostalCode || '')
const addressCity = computed(() => runtimeConfig.public.addressCity || '')

// Computed properties for UI
const sidebarShouldHide = computed(() => isMobile.value && isSidebarCollapsed.value)
const sidebarClasses = computed(() => ({
  'bottom-sheet': isMobile.value,
  active: isMobile.value && !isSidebarCollapsed.value,
  hidden: sidebarShouldHide.value,
  absolute: !isMobile.value
}))

const mapStyles = computed(() => {
  if (!isMobile.value || !mapContainer.value) {
    return { transform: 'translateY(0)', marginBottom: '0px' }
  }

  const sidebarEl = document.getElementById('sidebar') as HTMLElement | null
  if (!sidebarEl) {
    return { transform: 'translateY(0)', marginBottom: '0px' }
  }

  const bottomSheetVisible = !isSidebarCollapsed.value && !sidebarShouldHide.value
  if (!bottomSheetVisible) {
    return { transform: 'translateY(0)', marginBottom: '0px' }
  }

  const sidebarRect = sidebarEl.getBoundingClientRect()
  const mapRect = mapContainer.value.getBoundingClientRect()
  const maxLift = Math.max(mapRect.height - 120, 0)
  const translatePixels = Math.min(sidebarRect.height, maxLift)

  if (translatePixels <= 0) {
    return { transform: 'translateY(0)', marginBottom: '0px' }
  }

  return {
    transform: `translateY(-${translatePixels}px)`,
    marginBottom: `${translatePixels}px`
  }
})

const defaultPageTitle = 'Schulkarte für Schleswig-Holstein – Finde Schulen in deiner Nähe'
const currentTitle = computed(() => {
  if (!selectedSchool.value) {
    return defaultPageTitle
  }
  return `${capitalizeWords(selectedSchool.value.slug || selectedSchool.value.name)} - Schulkarte für Schleswig-Holstein`
})

const currentOgUrl = computed(() => {
  if (!process.client) {
    return baseWebsiteOrigin.value || 'https://schulkarte.oklabflensburg.de'
  }
  const origin = baseWebsiteOrigin.value || window.location.origin
  return selectedSchool.value?.slug ? `${origin}/${selectedSchool.value.slug}` : window.location.href
})

useHead(() => ({
  title: currentTitle.value,
  meta: [
    { property: 'og:title', content: currentTitle.value },
    { property: 'og:url', content: currentOgUrl.value }
  ]
}))

// ============================================================================
// Utility Functions
// ============================================================================

function capitalizeWords(input: string) {
  return input.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
}

function isValidUrl(urlString: string | null | undefined) {
  if (!urlString) {
    return false
  }
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  }
  catch {
    return false
  }
}

async function fetchJson<T>(path: string): Promise<T | null> {
  if (!baseApiUrl.value) {
    console.warn('NUXT_PUBLIC_BASE_API_URL is not set.')
    return null
  }
  try {
    const response = await fetch(`${baseApiUrl.value}${path}`)
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    return (await response.json()) as T
  }
  catch (error) {
    console.error('Fetch error:', error)
    return null
  }
}

function setCookie(name: string, value: string, days = 30) {
  if (!process.client) {
    return
  }
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`
}

function getCookie(name: string) {
  if (!process.client) {
    return null
  }
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.startsWith(nameEQ)) {
      return cookie.substring(nameEQ.length)
    }
  }
  return null
}

// ============================================================================
// Marker Management
// ============================================================================

function findMarkerById(id: number): any | null {
  const marker = markerById.get(id)
  if (marker && typeof marker.setIcon === 'function') {
    return marker
  }
  console.warn(`Marker with ID ${id} is not a valid Leaflet marker.`)
  return null
}

function setSelectedMarker(marker: any) {
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

// ============================================================================
// Selection & UI State Management
// ============================================================================

type ClearSelectionOptions = {
  preserveView?: boolean
  updateRoute?: boolean
}

function clearSelection(options: ClearSelectionOptions = {}) {
  const { preserveView = false, updateRoute = true } = options

  if (preserveView && mapInstance.value) {
    const center = mapInstance.value.getCenter()
    pendingViewRestore.value = { lat: center.lat, lng: center.lng, zoom: mapInstance.value.getZoom() }
    hasInitialBounds.value = true
  }

  if (previousSelectedMarker && defaultIcon) {
    previousSelectedMarker.setIcon(defaultIcon)
    previousSelectedMarker = null
  }

  selectedSchool.value = null
  detailImageUrl.value = null
  detailImageAlt.value = ''

  if (updateRoute) {
    if (process.client) {
      const { state } = window.history
      window.history.replaceState(state, '', '/')
    }
  }

  isHamburgerMenuOpen.value = false

  if (isMobile.value) {
    isSidebarCollapsed.value = true
  }
}

// ============================================================================
// Map & Markers
// ============================================================================

function addSchoolsToMap(collection: FeatureCollection, fitToBounds: boolean, maxZoom: number) {
  if (!markerClusterGroup || !leaflet) {
    return
  }

  markerClusterGroup.clearLayers()
  markerById.clear()

  const layer = leaflet.geoJSON(collection, {
    onEachFeature(feature: Feature, layerInstance: any) {
      const id = feature.id as number | undefined
      if (!id) {
        return
      }
      markerById.set(id, layerInstance)
      layerInstance.on('click', async (e: any) => {
        // Stop propagation to prevent map click event
        leaflet.DomEvent.stopPropagation(e)
        await revealSchoolDetailById(id)
        // View stays exactly where it is - no map movement
      })
    },
    pointToLayer(feature: Feature, latlng: [number, number]) {
      const label = (feature.properties?.label as string | undefined)?.split(/, | -/)[0]?.trim()
      return leaflet.marker(latlng, { icon: defaultIcon }).bindTooltip(label || 'Schule', {
        permanent: false,
        direction: 'top'
      })
    }
  })

  markerClusterGroup.addLayer(layer)
  const map = mapInstance.value
  
  // Only fit bounds on initial load
  if (map && fitToBounds && layer.getBounds().isValid() && !hasInitialBounds.value) {
    map.fitBounds(layer.getBounds(), { maxZoom })
    hasInitialBounds.value = true
  }
  else if (!hasInitialBounds.value) {
    hasInitialBounds.value = true
  }
}

// ============================================================================
// Data Fetching
// ============================================================================

async function fetchSchoolPointsByBounds() {
  // Skip if we're currently handling a map click
  if (isHandlingMapClick.value) {
    return
  }

  if (!mapInstance.value || !leaflet) {
    return
  }

  if (selectedSchoolType.value) {
    return
  }

  const bounds = mapInstance.value.getBounds()
  const params = new URLSearchParams({
    xmin: bounds.getWest().toString(),
    ymin: bounds.getSouth().toString(),
    xmax: bounds.getEast().toString(),
    ymax: bounds.getNorth().toString()
  })
  
  const collection = await fetchJson<FeatureCollection>(`/school/v1/bounds?${params.toString()}`)
  if (!collection) {
    return
  }

  // Never fit bounds after initial load
  addSchoolsToMap(collection, false, initialZoom)
  
  // Re-select marker if there was one selected before
  if (selectedSchool.value) {
    const marker = findMarkerById(selectedSchool.value.id)
    if (marker) {
      setSelectedMarker(marker)
    }
  }
}

async function fetchSchoolPointsByPosition(lat: number, lng: number) {
  const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() })
  const collection = await fetchJson<FeatureCollection>(`/school/v1/radius?${params.toString()}`)
  if (!collection) {
    return
  }
  addSchoolsToMap(collection, false, initialZoom)
}

async function fetchSchoolTypes() {
  const types = await fetchJson<SchoolType[]>('/school/v1/types')
  if (types) {
    schoolTypes.value = types
  }
}

async function fetchSchoolsByType(schoolType: string) {
  const params = new URLSearchParams({ school_type: schoolType })
  const collection = await fetchJson<FeatureCollection>(`/school/v1/type?${params.toString()}`)
  if (!collection) {
    markerClusterGroup?.clearLayers()
    markerById.clear()
    return
  }
  
  // Never fit bounds after initial load
  addSchoolsToMap(collection, false, initialZoom)
  
  if (selectedSchool.value) {
    const marker = findMarkerById(selectedSchool.value.id)
    if (marker) {
      setSelectedMarker(marker)
    }
  }
}

async function revealSchoolDetailById(id: number) {
  isHandlingMapClick.value = true

  isLoadingDetails.value = true
  const params = new URLSearchParams({ school_id: id.toString() })
  const details = await fetchJson<SchoolDetail[]>(`/school/v1/details?${params.toString()}`)
  isLoadingDetails.value = false

  if (!details || !details[0]) {
    isHandlingMapClick.value = false
    return
  }

  if (process.client) {
    const { state } = window.history
    window.history.replaceState(state, '', `/${details[0].slug}`)
  }
  await revealSchool(details[0], { moveView: false, ensureMarkers: false })

  setTimeout(() => {
    isHandlingMapClick.value = false
  }, 100)
}

async function fetchSchoolDetailBySlug(slug: string) {
  isLoadingDetails.value = true
  const params = new URLSearchParams({ slug })
  const details = await fetchJson<SchoolDetail[]>(`/school/v1/details?${params.toString()}`)
  isLoadingDetails.value = false
  
  if (!details || !details[0]) {
    return
  }
  await revealSchool(details[0], { moveView: true, ensureMarkers: true })
}

type RevealOptions = {
  moveView?: boolean
  ensureMarkers?: boolean
}

async function revealSchool(detail: SchoolDetail, options: RevealOptions = {}) {
  const { moveView = false, ensureMarkers = false } = options

  selectedSchool.value = detail
  detailImageUrl.value = detail.photo_link && isValidUrl(detail.photo_link) ? detail.photo_link : null
  detailImageAlt.value = detail.name || 'Schulkarte für Schleswig-Holstein'

  // Only move view if explicitly requested (e.g., from direct URL access)
  if (moveView && detail.geojson?.coordinates) {
    const [lng, lat] = detail.geojson.coordinates
    hasInitialBounds.value = true
    pendingViewRestore.value = { lat, lng, zoom: detailZoom }
    mapInstance.value?.setView([lat, lng], detailZoom)
  }

  // Set marker selection
  const marker = findMarkerById(detail.id)
  if (marker) {
    setSelectedMarker(marker)
  }
  
  isSidebarCollapsed.value = false

  if (ensureMarkers) {
    await fetchSchoolPointsByBounds()
  }
}

// ============================================================================
// Event Handlers
// ============================================================================


function handleResize() {
  if (!process.client) {
    return
  }
  viewportWidth.value = window.innerWidth
  if (!isMobile.value) {
    isHamburgerMenuOpen.value = false
  }
}

async function handleRouteChange() {
  const slugParam = route.params.slug as string | undefined

  // Skip if we're handling a map click to prevent circular calls
  if (isHandlingMapClick.value) {
    return
  }

  if (!slugParam) {
    // Don't clear selection or fetch if we're already at home with no selection
    if (!selectedSchool.value) {
      return
    }
    // If there's still a selection, clear it (this handles browser back button)
    clearSelection({ preserveView: true, updateRoute: false })
    return
  }
  await fetchSchoolDetailBySlug(slugParam)
}

function handleMapClick() {
  // Only clear selection if there's something selected
  if (!selectedSchool.value) {
    return
  }

  // Set flag to prevent route handler from interfering
  isHandlingMapClick.value = true

  clearSelection({ preserveView: true, updateRoute: true })

  // Reset flag after sufficient delay for moveend events to complete
  setTimeout(() => {
    isHandlingMapClick.value = false
  }, 100)
}

function handleHomeClick(event: Event) {
  if (!selectedSchool.value) {
    isHamburgerMenuOpen.value = false
    return
  }

  event.preventDefault()

  isHandlingMapClick.value = true

  clearSelection({ preserveView: true, updateRoute: true })

  setTimeout(() => {
    isHandlingMapClick.value = false
  }, 100)
}

function handleCloseClick() {
  // Set flag to prevent route handler from interfering
  isHandlingMapClick.value = true
  
  clearSelection({ preserveView: true, updateRoute: true })

  // Reset flag after sufficient delay
  setTimeout(() => {
    isHandlingMapClick.value = false
  }, 100)
}

function handleSchoolTypeChange(newType: string) {
  setCookie('selectedSchoolType', newType)
  if (!newType) {
    fetchSchoolPointsByBounds()
    return
  }
  fetchSchoolsByType(newType)
}

function showAboutSection() {
  isHamburgerMenuOpen.value = false
  if (selectedSchool.value) {
    clearSelection({ preserveView: true, updateRoute: true })
  }

  if (isMobile.value) {
    isSidebarCollapsed.value = false
  }

  nextTick(() => {
    const aboutSection = document.getElementById('about')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

function toggleSidebar() {
  if (!isMobile.value) {
    return
  }
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  if (!isSidebarCollapsed.value) {
    nextTickInvalidateMap()
  }
}

function nextTickInvalidateMap() {
  if (!process.client) {
    return
  }
  requestAnimationFrame(() => {
    mapInstance.value?.invalidateSize()
  })
}

function requestGeolocation() {
  if (!process.client || !navigator.geolocation) {
    if (!navigator.geolocation) {
      alert('Ihr Browser unterstützt keine Standortbestimmung.')
    }
    geolocationEnabled.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      hasInitialBounds.value = true
      pendingViewRestore.value = { lat: latitude, lng: longitude, zoom: 16 }
      mapInstance.value?.setView([latitude, longitude], 16)
      fetchSchoolPointsByPosition(latitude, longitude)
    },
    (error) => {
      geolocationEnabled.value = false
      if (error.code === error.PERMISSION_DENIED) {
        alert('Standortfreigabe wurde verweigert. Bitte erlauben Sie den Zugriff auf Ihren Standort in den Browsereinstellungen.')
      }
      else if (error.code === error.TIMEOUT) {
        alert('Zeitüberschreitung bei der Standortabfrage. Bitte versuchen Sie es erneut.')
      }
      else {
        alert('Standortbestimmung fehlgeschlagen. Bitte versuchen Sie es später erneut.')
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

// ============================================================================
// Map Initialization
// ============================================================================


async function initMap() {
  if (!mapContainer.value) {
    return
  }

  console.log('Initializing map...')

  const leafletImport = await import('leaflet')
  await import('leaflet.markercluster')
  leaflet = leafletImport.default ?? leafletImport

  defaultIcon = leaflet.icon({
    iconUrl: '/marker-icon-default.webp',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    tooltipAnchor: [0, -37]
  })

  selectedIcon = leaflet.icon({
    iconUrl: '/marker-icon-active.webp',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    tooltipAnchor: [0, -37]
  })

  mapInstance.value = leaflet
    .map(mapContainer.value, { zoomControl: false, maxZoom: 20, minZoom: 3 })
    .setView(center, initialZoom)

  markerClusterGroup = leaflet.markerClusterGroup({
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: detailZoom
  })
  mapInstance.value.addLayer(markerClusterGroup)

  leaflet
    .tileLayer('https://tiles.oklabflensburg.de/sgm/{z}/{x}/{y}.png', {
      maxZoom: 20,
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="dc:rights">OpenStreetMap</a> contributors'
    })
    .addTo(mapInstance.value)

  ;(mapInstance.value as any).paddingTopLeft = [0, 60]

  // Register map event listeners
  mapInstance.value.on('moveend', fetchSchoolPointsByBounds)
  mapInstance.value.on('click', handleMapClick)

  // Fetch school types and apply saved filter if any
  await fetchSchoolTypes()
  const savedSchoolType = getCookie('selectedSchoolType')
  if (savedSchoolType) {
    selectedSchoolType.value = savedSchoolType
  }

  // Initial data load based on filter or bounds
  if (selectedSchoolType.value) {
    await fetchSchoolsByType(selectedSchoolType.value)
  }
  else {
    await fetchSchoolPointsByBounds()
  }

  // Handle route-based school selection (direct URLs)
  await handleRouteChange()
}

// ============================================================================
// Watchers & Lifecycle
// ============================================================================

watch(
  () => route.params.slug,
  async () => {
    await handleRouteChange()
  }
)

watch(
  () => selectedSchoolType.value,
  (schoolType) => {
    handleSchoolTypeChange(schoolType)
  }
)

watchEffect(() => {
  if (!isMobile.value) {
    isSidebarCollapsed.value = false
  }
})

watch(
  () => isMobile.value,
  () => {
    nextTickInvalidateMap()
  }
)

watch(
  () => isSidebarCollapsed.value,
  () => {
    nextTickInvalidateMap()
  }
)

watch(
  () => [sidebarShouldHide.value, detailImageUrl.value],
  () => {
    nextTickInvalidateMap()
  }
)

watch(
  () => geolocationEnabled.value,
  (enabled) => {
    if (enabled) {
      requestGeolocation()
    }
  }
)

onMounted(async () => {
  if (process.client) {
    window.addEventListener('resize', handleResize)
  }
  await initMap()
})

onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.off('moveend', fetchSchoolPointsByBounds)
    mapInstance.value.off('click', handleMapClick)
  }
  if (process.client) {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<template>
  <div class="relative flex justify-center flex-col h-dvh w-full">
    <div class="relative sm:flex sm:flex-row w-full h-dvh overflow-hidden">
      <div class="h-dvh flex flex-col w-full xs:w-5/12 sm:w-6/12 md:w-7/12 lg:w-8/12 xl:w-9/12">
        <div
          v-if="isMobile"
          class="fixed top-4 right-4 z-[1300] sm:hidden"
        >
          <button
            class="p-2 rounded-md bg-white shadow-md border border-gray-200 text-gray-700"
            type="button"
            @click="isHamburgerMenuOpen = !isHamburgerMenuOpen"
          >
            <span class="sr-only">Menü öffnen</span>
            <svg v-if="!isHamburgerMenuOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            v-if="isHamburgerMenuOpen"
            class="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg border border-gray-200 py-2"
          >
            <NuxtLink
              class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              to="/"
              @click.prevent="handleHomeClick"
            >
              Home
            </NuxtLink>
            <button
              class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              type="button"
              @click="showAboutSection()"
            >
              About
            </button>
          </div>
        </div>

        <div
          id="map"
          ref="mapContainer"
          class="h-[95dvh] w-full transition-transform duration-300 ease-in-out"
          :style="mapStyles"
        />
        <footer class="grow w-full bg-gray-200 border-t md:border-t border-gray-300 text-sm flex justify-center items-center gap-2 flex-wrap">
          <NuxtLink class="inline-block text-gray-700 hover:text-blue-800 focus:text-blue-800" to="/impressum">Impressum</NuxtLink>
          <span class="inline-block text-gray-700 px-3">|</span>
          <NuxtLink class="inline-block text-gray-700 hover:text-blue-800 focus:text-blue-800" to="/impressum#privacy">
            Datenschutzerklärung
          </NuxtLink>
          <span class="inline-block text-gray-700 px-3">|</span>
          <NuxtLink class="inline-block text-gray-700 hover:text-blue-800 focus:text-blue-800" to="/lizenz">Lizenz</NuxtLink>
        </footer>
      </div>

      <div
        id="sidebar"
        class="absolute left-0 bottom-0 max-h-[56dvh] sm:max-h-dvh sm:block sm:relative w-full xs:w-7/12 sm:w-6/12 md:w-5/12 lg:w-4/12 xl:w-3/12 overflow-scroll bg-gray-100 z-[1200]"
        :class="sidebarClasses"
      >
        <div id="sidebar-handle" @click="toggleSidebar" />

        <div id="sidebarCloseWrapper" class="absolute right-3 top-3 z-[1300] sm:hidden" v-if="!sidebarShouldHide">
          <button
            class="flex justify-center items-center relative inline-block shadow-md bg-gray-200 text-sky-900 hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-300 rounded-full w-8 h-8 cursor-pointer font-bold"
            type="button"
            @click.prevent="handleCloseClick"
          >
            <svg class="h-5 w-5 inline" viewBox="0 0 50 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg" stroke-width="0">
              <path
                d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 Z"
              />
            </svg>
          </button>
        </div>

        <div id="sidebarHeader" class="py-2 px-3 mb-4 lg:mb-6">
          <NuxtLink to="/" @click.prevent="handleHomeClick">
            <h1 class="tracking-normal leading-normal font-bold text-2xl md:text-3xl lg:text-4xl mb-1">
              Schulen in Schleswig-Holstein
            </h1>
          </NuxtLink>
        </div>

        <div class="px-3 mb-4">
          <label for="schoolType" class="block text-sm font-medium text-gray-700 mb-1 sm:text-base">Schulart filtern:</label>
          <select
            id="schoolType"
            v-model="selectedSchoolType"
            class="p-2 w-full text-sm border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
          >
            <option value="">Alle Schularten</option>
            <option v-for="type in schoolTypes" :key="type.code" :value="type.code">
              {{ type.name }}
            </option>
          </select>
        </div>

        <div class="px-3 mb-4">
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="geolocationEnabled" type="checkbox" name="myLocation" class="sr-only peer">
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            />
            <span class="ms-3 text-sm font-medium text-gray-900 sm:text-base">Mein Standort verwenden</span>
          </label>
        </div>

        <div v-if="!selectedSchool" id="about" class="my-3 px-3 space-y-4">
          <section>
            <h3 class="font-bold text-lg md:text-xl mb-1">Wie funktioniert die Schulkarte?</h3>
            <p class="font-normal leading-normal lg:text-md mb-3 md:mb-6">
              Klicken Sie auf einen Marker, um Details zur jeweiligen Schule anzuzeigen. Bewegen Sie die Karte, um weitere Schulen zu entdecken –
              die Daten werden dabei automatisch geladen.
            </p>
          </section>
          <section>
            <h3 class="font-bold text-lg md:text-xl mb-1">Wie entstand die Schulkarte?</h3>
            <p class="font-normal leading-normal lg:text-md mb-3 md:mb-6">
              Viele Eltern kennen die Herausforderung, die passende Schule für ihr Kind zu finden. Aus diesem Wunsch heraus haben wir die
              Schulkarte entwickelt: eine interaktive Übersicht der Schulstandorte und Kontaktdaten in Schleswig-Holstein. Unser Ziel ist es, die
              Suche nach einer geeigneten Schule zu erleichtern. Haben Sie Ergänzungen oder Feedback? Schreiben Sie uns gerne eine
              <a
                v-if="contactMail"
                class="text-blue-600 hover:text-blue-400 focus:text-blue-400"
                :href="`mailto:${contactMail}`"
                target="_blank"
                rel="noopener"
              >
                E-Mail
              </a>.
            </p>
          </section>
          <section>
            <h3 class="font-bold text-lg md:text-xl mb-1">Wie aktuell sind die Daten?</h3>
            <p class="font-normal leading-normal lg:text-md mb-3 md:mb-6">
              Unsere Karte basiert auf dem Datensatz
              <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" href="https://opendata.schleswig-holstein.de/collection/schulen" target="_blank" rel="noopener">
                Schulen in Schleswig-Holstein
              </a>
              aus dem Open Data Portal Schleswig-Holstein und wird jährlich aktualisiert.
            </p>
          </section>
          <section>
            <h3 class="font-bold text-lg md:text-xl mb-1">Open Source und frei nutzbar</h3>
            <p class="font-normal leading-normal lg:text-md">
              Der aktuelle Entwicklungsstand ist auf
              <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" href="https://github.com/oklabflensburg/open-school-map" target="_blank" rel="noopener">
                GitHub
              </a>
              einsehbar. Die Software kann von Städten, Kommunen und Ländern kostenfrei und lizenzfrei genutzt und angepasst werden. Die Anwendung
              wurde von ehrenamtlichen Mitgliedern des OK Lab Flensburg entwickelt.
            </p>
          </section>
        </div>

        <div v-else id="sidebarContent" class="relative bg-white border border-slate-300 leading-normal lg:text-lg m-3 rounded text-black text-md">
          <div v-if="detailImageUrl" id="detailImage" class="flex flex-col">
            <img :src="detailImageUrl" :alt="detailImageAlt" class="w-full object-cover">
            <div class="px-3 py-2 w-full text-xs text-gray-100 bg-gray-600">Foto © tbd.</div>
          </div>
          <ul class="p-3 space-y-3" id="detailList">
            <li class="text-xl lg:text-2xl font-bold">
              {{ selectedSchool.name.split(/, | -/)[0].trim() }}
            </li>
            <li class="py-1 mb-3">
              {{ selectedSchool.street }} {{ selectedSchool.house_number }}<br>
              {{ selectedSchool.zipcode }} {{ selectedSchool.city }}
            </li>
            <li v-if="selectedSchool.email" class="pt-2">
              <strong>E-Mail</strong><br>
              <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" :href="`mailto:${selectedSchool.email}`" target="_blank" rel="noopener">
                {{ selectedSchool.email }}
              </a>
            </li>
            <li v-if="selectedSchool.website" class="pt-2">
              <strong>Website</strong><br>
              <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" :href="selectedSchool.website" target="_blank" rel="noopener">
                {{ selectedSchool.website }}
              </a>
            </li>
            <li v-if="selectedSchool.telephone" class="pt-2">
              <strong>Telefon</strong><br>
              {{ selectedSchool.telephone }}
            </li>
            <li v-if="selectedSchool.fax" class="pt-2">
              <strong>Fax</strong><br>
              {{ selectedSchool.fax }}
            </li>
            <li v-if="selectedSchool.school_types?.length" class="pt-2">
              <strong>{{ selectedSchool.school_types.length === 1 ? 'Schulart' : 'Schularten' }}</strong>
              <ul class="list-disc list-inside">
                <li v-for="type in selectedSchool.school_types" :key="type">{{ type }}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
