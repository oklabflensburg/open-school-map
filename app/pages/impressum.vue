<script setup lang="ts">
const publicRuntime = useRuntimeConfig().public

const contactMail = publicRuntime.contactMail || ''
const contactPhone = publicRuntime.contactPhone || ''
const privacyContactPerson = publicRuntime.privacyContactPerson || ''
const addressName = publicRuntime.addressName || ''
const addressStreet = publicRuntime.addressStreet || ''
const addressHouseNumber = publicRuntime.addressHouseNumber || ''
const addressPostalCode = publicRuntime.addressPostalCode || ''
const addressCity = publicRuntime.addressCity || ''
const websiteOrigin = publicRuntime.websiteOrigin || ''

const matomoOptOutUrl = websiteOrigin
  ? `${websiteOrigin}/index.php?module=CoreAdminHome&action=optOut&language=de`
  : ''

useHead({
  title: 'Impressum - Schulen in Flensburg'
})
</script>

<template>
  <div class="h-screen overflow-auto bg-white">
    <header class="bg-gray-700 flex justify-center items-center h-[6vh] md:h-[4vh] mb-4">
      <ul class="sm:container sm:mx-auto">
        <li>
          <NuxtLink class="inline-block text-white" to="/">Home</NuxtLink>
        </li>
      </ul>
    </header>
    <div class="sm:container sm:mx-auto px-3 sm:px-0">
      <h1 class="tracking-normal leading-normal font-bold text-2xl md:text-3xl lg:text-4xl mb:4 lg:mb-8">Impressum</h1>
      <div class="font-normal leading-normal text-md lg:text-lg mb-6 lg:mb-12">
        <dl class="block">
          <dt>Adresse:</dt>
          <dd>
            <template v-if="addressName">
              <span>{{ addressName }}</span><br>
            </template>
            <template v-if="addressStreet || addressHouseNumber">
              <span>{{ addressStreet }}</span>
              <span> {{ addressHouseNumber }}</span><br>
            </template>
            <template v-if="addressPostalCode || addressCity">
              <span>{{ addressPostalCode }}</span>
              <span> {{ addressCity }}</span><br><br>
            </template>
          </dd>
        </dl>
        <dl class="flex" v-if="contactMail">
          <dt class="flex-initial mr-1">E-Mail:</dt>
          <dd class="w-1/2">
            <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" :href="`mailto:${contactMail}`">
              {{ contactMail }}
            </a>
          </dd>
        </dl>
        <dl class="flex" v-if="contactPhone">
          <dt class="flex-initial mr-1">Telefon:</dt>
          <dd class="w-1/2">
            <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" :href="`tel:${contactPhone}`">
              {{ contactPhone }}
            </a>
          </dd>
        </dl>
      </div>
      <div class="mb-12">
        <div class="mb-4">
          <h2 class="tracking-normal leading-normal font-bold text-2xl md:text-3xl lg:text-4xl mb-4 lg:mb-12">Haftungsausschluss</h2>
          <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
            Inhaltlich verantwortlich gemäß § 55 Abs. 2 RStV ist
            <span>{{ privacyContactPerson }}</span>.
          </p>
          <h2 class="font-bold text-xl md:text-2xl mb-1">Haftung für Inhalte</h2>
          <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
            können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Nach § 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
            übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen
            bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
            Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
          <h2 class="font-bold text-xl md:text-2xl mb-1">Haftung für Links</h2>
          <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
            diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
            Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
            überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der
            verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
            Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
          <h2 class="font-bold text-xl md:text-2xl mb-1">Urheberrecht</h2>
          <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht, sofern diese
            nicht unter der CC0 1.0 Universell Lizenz veröffentlicht worden sind. Soweit die Inhalte auf dieser Seite nicht vom Betreiber
            erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.
            Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei
            Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
          </p>
        </div>
      </div>
      <a name="privacy" />
      <h2 class="tracking-normal leading-normal font-bold text-2xl md:text-3xl lg:text-4xl mb:4 lg:mb-8">Datenschutzerklärung</h2>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Das Open Knowledge Lab Flensburg, Am Nordertor 2, 24939 Flensburg, Deutschland (nachfolgend als "OK Lab Flensburg" oder "wir"
        bezeichnet) betreibt die im Internet unter
        <a v-if="websiteOrigin" class="text-blue-600 hover:text-blue-400 focus:text-blue-400" :href="websiteOrigin">
          {{ websiteOrigin }}
        </a>
        und den jeweils dazu gehörenden Unterverzeichnissen abrufbare Internetseite (nachfolgend die "Website" genannt).
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Auf dieser Website können Sie sich über unser Angebot informieren und unseren Dienst nutzen. Wir freuen uns über Ihren Besuch auf
        unserer Website. Damit die Seiten richtig dargestellt werden, müssen wir bestimmte Informationen, auch personenbezogene Daten wie Ihre
        IP-Adresse, verarbeiten. Darüber hinaus verarbeiten wir personenbezogene Daten, wenn Sie bestimmte Funktionen auf der Website
        verwenden oder anderweitig freiwillig Informationen eingeben. Wir möchten Sie darüber informieren, wie wir Ihre personenbezogenen
        Daten verarbeiten. Mit personenbezogenen Daten sind Informationen gemeint, die einer Person zugeordnet werden können.
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Verantwortliche Stelle für die Verarbeitung Ihrer personenbezogenen Daten ist:
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Open Knowledge Lab Flensburg<br>
        Am Nordertor 2<br>
        24939 Flensburg
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6" v-if="contactMail">
        E-Mail:
        <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" :href="`mailto:${contactMail}`">{{ contactMail }}</a>
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6" v-if="contactPhone">
        Telefon:
        <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" :href="`tel:${contactPhone}`">{{ contactPhone }}</a>
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        (nachfolgend: "wir", "uns" oder "unsere"). Weitere Informationen erhalten Sie in unserem Impressum.
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Wir haben nachfolgend die wichtigsten Informationen zur Datenverarbeitung für Sie zusammengestellt. Für Fragen zur Verarbeitung Ihrer
        personenbezogenen Daten stehen wir Ihnen gerne zur Verfügung.
      </p>
      <h2 class="font-bold text-xl md:text-2xl mb-1">I. Umfang und Zweck der Verarbeitung personenbezogener Daten</h2>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Wir verarbeiten personenbezogene Daten zur Bereitstellung, Nutzung und Verbesserung unserer Website. Die nachfolgenden Daten werden
        zu den genannten Zwecken verarbeitet:
      </p>
      <ol class="list-disc font-normal leading-normal text-md lg:text-lg pl-9 mb-3 lg:mb-6">
        <li class="mb-2">
          Zugriffsdaten: Wenn Sie unsere Website nutzen, werden technische Zugriffsdaten protokolliert, insbesondere Ihre IP-Adresse sowie
          Informationen über den verwendeten Browser und das Betriebssystem. Dies ist technisch notwendig, um Ihnen den Besuch auf unserer
          Website zu ermöglichen und die Stabilität und Sicherheit zu gewährleisten.
        </li>
        <li class="mb-2">
          Nutzungsdaten: Weitere Daten, wie z. B. aufgerufene Seiten oder angeklickte Links, erheben wir nur, wenn Sie freiwillig zustimmen oder
          es technisch notwendig ist. Sie können unsere Website grundsätzlich auch ohne Angaben zu Ihrer Person nutzen.
        </li>
        <li class="mb-2">
          Kommunikationsdaten: Wenn Sie uns kontaktieren (z. B. per E-Mail), verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage.
        </li>
      </ol>
      <h2 class="font-bold text-xl md:text-2xl mb-1">II. Rechtsgrundlagen der Datenverarbeitung</h2>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Die Verarbeitung Ihrer personenbezogenen Daten kann auf unterschiedlichen Rechtsgrundlagen beruhen:
      </p>
      <ol class="list-decimal font-normal leading-normal text-md lg:text-lg pl-9 mb-3 lg:mb-6">
        <li class="mb-2">
          Art. 6 Abs. 1 lit. a DSGVO erlaubt uns, personenbezogene Daten zu verarbeiten, wenn Sie uns dazu Ihre Einwilligung erteilt haben.
        </li>
        <li class="mb-2">
          Art. 6 Abs. 1 lit. b DSGVO erlaubt uns personenbezogene Daten zu verarbeiten, wenn diese zum Abschluss oder zur Erfüllung eines Vertrags
          erforderlich sind.
        </li>
        <li class="mb-2">
          Art. 6 Abs. 1 lit. c DSGVO erlaubt uns personenbezogene Daten zu verarbeiten, wenn wir insbesondere gesetzlichen Verpflichtungen nachkommen
          müssen.
        </li>
        <li class="mb-2">
          Art. 6 Abs. 1 lit. f DSGVO erlaubt uns personenbezogene Daten zu verarbeiten, wenn die Verarbeitung zur Wahrung unserer berechtigten
          Interessen oder eines Dritten erforderlich ist, sofern nicht die entgegenstehenden Interessen der betroffenen Person an der
          Nichtverarbeitung überwiegen.
        </li>
      </ol>
      <h2 class="font-bold text-xl md:text-2xl mb-1">III. Kategorien von Empfängern personenbezogener Daten</h2>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Es haben nur diejenigen Personen Zugriff auf Ihre personenbezogenen Daten, die diese zur Erfüllung ihrer Aufgaben benötigen.
        Daneben können andere Empfänger Zugriff haben:
      </p>
      <ol class="list-decimal font-normal leading-normal text-md lg:text-lg pl-9 mb-3 lg:mb-6">
        <li class="mb-2">
          IT-Dienstleister, die uns bei der technischen Bereitstellung unterstützen, z. B. Provider oder Hosting-Unternehmen. Diese Unternehmen
          sind verpflichtet, Ihre Daten nur im Rahmen unserer Weisungen zu verarbeiten.
        </li>
        <li class="mb-2">
          Behörden und Einrichtungen, wenn wir gesetzlich zu einer Herausgabe verpflichtet sind.
        </li>
      </ol>
      <h2 class="font-bold text-xl md:text-2xl mb-1">IV. Drittland</h2>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Eine Übermittlung der Daten in Drittstaaten findet nicht statt und ist nicht geplant. Sollten wir zukünftig Drittstaatenübermittlungen
        vornehmen, informieren wir Sie entsprechend Artikel 13 Absatz 1 lit. f DSGVO darüber.
      </p>
      <h2 class="font-bold text-xl md:text-2xl mb-1">V. Dauer der Verarbeitung</h2>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Sofern nicht anders beschrieben, werden personenbezogene Daten von uns gelöscht, wenn sie für die benannten Verarbeitungszwecke nicht
        mehr benötigt werden und gesetzlichen Aufbewahrungspflichten nicht entgegenstehen.
      </p>
      <h2 class="font-bold text-xl md:text-2xl mb-1">VI. Ihre Rechte als Betroffene</h2>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Sie können jederzeit Ihre Rechte als betroffene Person geltend machen. Hierzu gehören insbesondere:
      </p>
      <ol class="list-decimal font-normal leading-normal text-md lg:text-lg pl-9 mb-3 lg:mb-6">
        <li class="mb-2">Auskunft über die gespeicherten Daten (Art. 15 DSGVO),</li>
        <li class="mb-2">Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
        <li class="mb-2">Löschung Ihrer Daten (Art. 17 DSGVO),</li>
        <li class="mb-2">Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
        <li class="mb-2">Übertragbarkeit Ihrer Daten (Art. 20 DSGVO),</li>
        <li class="mb-2">Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).</li>
      </ol>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Falls Sie eine Einwilligung gegeben haben, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen.
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Außerdem haben Sie das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde, wenn Sie der Ansicht sind, dass wir Ihre Daten nicht
        rechtmäßig verarbeiten.
      </p>
      <h2 class="font-bold text-xl md:text-2xl mb-1">VII. Bestehen von automatisierten Entscheidungsfindungen (einschließlich Profiling)</h2>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Wir verwenden keine automatisierten Entscheidungsfindungen, die Ihnen gegenüber rechtliche Wirkungen entfalten oder Sie beeinträchtigen.
      </p>
      <h2 class="font-bold text-xl md:text-2xl mb-1">VIII. Internetspezifische Datenverarbeitungen</h2>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        1. Matomo: Während der Nutzung unserer Internetseiten werden durch uns automatisch technische Zugriffsdaten aufgezeichnet und ausgewertet.
        Hierfür benutzen wir das Tool "Matomo", ein Open-Source-Programm für Webanalytik, welches statistische Kennwerte zur Nutzung unserer Website
        auswertet. Diese Daten können jedoch nicht einer bestimmten Person zugeordnet werden; der einzelne Benutzer bleibt hierbei anonym. Weitere
        Informationen zu "Matomo" finden Sie auf der Website
        <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" href="https://matomo.org">https://matomo.org</a>.
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">Zu diesen Daten gehören zum Beispiel</p>
      <ol class="list-disc font-normal leading-normal text-md lg:text-lg pl-9 mb-3 lg:mb-6">
        <li class="mb-2">Die um die letzten beiden Oktette gekürzte IP-Adresse,</li>
        <li class="mb-2">Informationen über den verwendeten Internet-Browser und das verwendete Betriebssystem,</li>
        <li class="mb-2">der Domain-Name der Website, von der aus ein Besuch unserer Internet-Seiten erfolgt,</li>
        <li class="mb-2">die durchschnittliche Verweildauer in unserem Angebot und</li>
        <li class="mb-2">die in unserer Web-Site aufgerufenen Seiten.</li>
      </ol>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Durch die Entfernung des folgenden
        <a
          v-if="matomoOptOutUrl"
          class="text-blue-600 hover:text-blue-400 focus:text-blue-400"
          :href="matomoOptOutUrl"
          target="_blank"
          rel="noopener"
        >
          Hakens
        </a>
        können Sie verhindern, dass wir mittels Matomo Ihre Besuche zählen. In diesem Fall wird ein Cookie gesetzt um uns zu signalisieren, dass
        Sie der Nutzung widersprochen haben.
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Bitte beachten Sie, dass die jeweiligen Einstellungen bzgl. Cookies nur für Ihr aktuell benutztes Gerät und Ihren aktuell benutzten
        Browser wirksam sind. Sollten Sie ein anderes Gerät oder einen anderen Browser benutzen, müssen Sie in der Regel die Einstellungen erneut
        vornehmen. Zudem unterstützen wir die "Do not Track" Funktion Ihres Browsers. Hiermit können Sie uns aktiv über Ihre Browsereinstellungen
        mitteilen, ob Sie eine Aufzeichnung Ihrer Aktivitäten wünschen oder nicht. Haben Sie "Do not Track" aktiviert, erfolgt keine Aufzeichnung
        Ihrer Aktivitäten.
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Die Rechtsgrundlage für die Verwendung von Matomo findet sich in Art. 6 Abs. 1 lit. f) DSGVO. Unser berechtigtes Interesse besteht darin,
        dass wir die Nutzung unserer Website zu deren Verbesserung und Optimierung auswerten. Die so erfassten Daten werden für einen Zeitraum von
        24 Monaten gespeichert.
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        2. Einbindung von Youtube Videos: Wir haben YouTube-Videos in unser Online-Angebot eingebunden. YouTube ist ein Broadcasting-Dienst, der uns
        das kostenlose Einstellen und Verlinken von Videoclips zur Darstellung unseres Unternehmens ermöglicht. Der Dienst auf
        <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" href="https://www.youtube.com/?gl=DE">youtube.com</a> wird bereitgestellt
        von der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland ("Google").
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Die Videos in unserem Online-Angebot sind auf
        <a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" href="https://www.youtube.com/?gl=DE">youtube.com</a> gespeichert und von
        unserer Website aus direkt abspielbar. Die Videos sind alle im "erweiterten Datenschutz-Modus" / "Zwei-Klick-Lösung" eingebunden. Das
        bedeutet, dass keine Daten über Sie als Nutzer an YouTube übertragen werden, wenn Sie die Videos nicht abspielen. Erst wenn Sie die Videos
        abspielen, werden personenbezogene Daten gemäß Absatz 2 an Google übertragen und wie dort dargestellt verarbeitet. Auf diese
        Datenübertragung und die weitere Verarbeitung durch Google haben wir keinen Einfluss.
      </p>
      <p class="font-normal leading-normal text-md lg:text-lg mb-3 lg:mb-6">
        Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen. Nutzen Sie dafür die entsprechenden Kontrollmöglichkeiten
        auf unserer Website. Der Widerruf berührt nicht die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung.
      </p>
    </div>
  </div>
  <footer class="bg-gray-200 h-[4vh] border-t md:border-t border-gray-300 text-sm flex justify-center items-center gap-2 flex-wrap">
    <NuxtLink class="inline-block text-gray-700 hover:text-blue-800 focus:text-blue-800" to="/impressum">Impressum</NuxtLink>
    <span class="inline-block text-gray-700 px-3">|</span>
    <NuxtLink class="inline-block text-gray-700 hover:text-blue-800 focus:text-blue-800" to="/impressum#privacy">Datenschutzerklärung</NuxtLink>
    <span class="inline-block text-gray-700 px-3">|</span>
    <NuxtLink class="inline-block text-gray-700 hover:text-blue-800 focus:text-blue-800" to="/lizenz">Lizenz</NuxtLink>
  </footer>
</template>
