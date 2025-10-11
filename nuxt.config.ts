import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  css: [
    '~/assets/css/main.css',
    'leaflet/dist/leaflet.css',
    'leaflet.markercluster/dist/MarkerCluster.css',
    'leaflet.markercluster/dist/MarkerCluster.Default.css'
  ],
  runtimeConfig: {
    public: {
      baseApiUrl: process.env.NUXT_PUBLIC_BASE_API_URL || '',
      contactMail: process.env.NUXT_PUBLIC_CONTACT_MAIL || '',
      contactPhone: process.env.NUXT_PUBLIC_CONTACT_PHONE || '',
      privacyContactPerson: process.env.NUXT_PUBLIC_PRIVACY_CONTACT_PERSON || '',
      addressName: process.env.NUXT_PUBLIC_ADDRESS_NAME || '',
      addressStreet: process.env.NUXT_PUBLIC_ADDRESS_STREET || '',
      addressHouseNumber: process.env.NUXT_PUBLIC_ADDRESS_HOUSE_NUMBER || '',
      addressPostalCode: process.env.NUXT_PUBLIC_ADDRESS_POSTAL_CODE || '',
      addressCity: process.env.NUXT_PUBLIC_ADDRESS_CITY || '',
      websiteOrigin: process.env.NUXT_PUBLIC_WEBSITE_ORIGIN || ''
    }
  },
  app: {
    head: {
      title: 'Schulkarte für Schleswig-Holstein – Finde Schulen in deiner Nähe',
      meta: [
        {
          name: 'description',
          content:
            'Entdecken Sie alle Schulen in Schleswig-Holstein auf einer interaktiven Karte. Finden Sie Standorte, Kontaktdaten und weitere Details zu den Schulen in Ihrer Umgebung.'
        },
        { property: 'og:title', content: 'Schulkarte für Schleswig-Holstein – Alle Schulen auf einer interaktiven Karte' },
        {
          property: 'og:description',
          content:
            'Mit der Schulkarte für Schleswig-Holstein einfach Schulen in Ihrer Nähe finden. Standort, Kontaktdaten und weitere Informationen auf einen Blick.'
        },
        { property: 'og:url', content: 'https://schulkarte.oklabflensburg.de' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Schulkarte für Schleswig-Holstein – Schulen in deiner Nähe finden' },
        {
          name: 'twitter:description',
          content: 'Finde schnell und einfach Schulen in Schleswig-Holstein mit unserer interaktiven Karte.'
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [{ rel: 'shortcut icon', href: '/favicon.ico' }]
    }
  }
})
