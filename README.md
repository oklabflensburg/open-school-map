# Bildungsatlas Flensburg

[![Lint html files](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-html.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-html.yml)
[![Lint javascript files](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-js.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-js.yml)
[![Lighthouse CI](https://github.com/oklabflensburg/open-school-map/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lighthouse.yml)


![Bildungsatlas Flensburg](https://raw.githubusercontent.com/oklabflensburg/open-school-map/main/screenshot_bildungsatlas.jpg)

Der offene Bildungsatlas für Flensburg zeigt auf einer interaktiven Karte regionale Bildungseinrichtungen und eine Vielzahl an Daten an. Die Seite soll Eltern und Institutionen eine einfache und übersichtliche Informationsquelle anbieten.



## Hintergrund

Die Idee, einen offenen Bildungsatlas für Flensburg zu entwickeln, ist aus der eigenen Suche nach einer Grundschule für den Lütten entstanden. Auf der [städtischen Website](https://www.flensburg.de/Leben-Soziales/Kinderbetreuung-Schulen/Grundschulen) finden sich zwar Kontaktdetails zu Schulen, jedoch weder eine übersichtliche, vergleichbare Information zu den einzelnen Schulen noch eine Karte, um den möglichen Schulweg zum Wohnort einzuschätzen. Mit dieser Webseite zeigen wir die Umsetzbarkeit eines solchen Systems.


## Datenquelle

Ein wesentlicher Teil der Informationen stammt von den verlinkten Seiten, wie beispielsweise zur Schulform, dem Schulleiter, dem Träger und der Anschrift. Zusätzlich haben wir Daten aus dem [Verzeichnis der allgemeinbildenden Schulen in Schleswig-Holstein](https://www.statistik-nord.de/fileadmin/Dokumente/Verzeichnisse/Schulverzeichnis_A_22-23.pdf) genutzt und in bestimmten Fällen auf Informationen aus dem [Verzeichnis der berufsbildenden Schulen in Schleswig-Holstein](https://www.statistik-nord.de/fileadmin/Dokumente/Verzeichnisse/Schulverzeichnis_B_22-23.pdf) zurückgegriffen. Die Kartendarstellung wurde von engagierten Eltern und ehrenamtlichen Mitgliedern des [OK Lab Flensburgs](https://oklabflensburg.de) entwickelt.


## Mitmachen

Du kannst jederzeit ein Issue auf GitHub öffnen oder uns über oklabflensburg@grain.one schreiben


## Todos

- Geometrien der Spiel- und Pausenflächen von OpenStreetMap extrahieren
- Anzahl der ausgefallenen Schulstunden pro Schuljahr und Jahrgang anfragen
- Anzahl der Lehrkräfte und Angestellten pro Schule und Schuljahr anfragen