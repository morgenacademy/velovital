/* ===== VELO VITAL — ritten en events =====
   Nieuwe rit? Voeg een regel toe. Zet open op false als hij vol of gesloten is.
   Op /welkom verschijnen alleen ritten met open: true en een datum vanaf vandaag.

   Bevestigingspagina na aanmelden voor een event (velovital.nl/aangemeld):
   het formulier op de eventpagina krijgt een verborgen veld
     <input type="hidden" name="eventcode" value="<id>">
   en stuurt dan vanzelf door naar /aangemeld?event=<id>. Die pagina én de bevestigingsmail
   (Apps Script) halen alles hieronder op aan de hand van die id.
   Velden die je weglaat, worden gewoon niet getoond.
     id        unieke korte naam, bijv. 'kiki-2026-10-18'
     eind      eindtijd voor de agenda-uitnodiging, bijv. '12:30'
     locatie   naam van de plek
     adres     straat en plaats (wordt ook een link naar Google Maps)
     bijdrage  bijv. '€10 per deelnemer'
     bereik    hoe je er komt (trein, parkeren)
     meenemen  lijstje wat ze mee moeten nemen
     stappen   eigen 'zo werkt het'-stappen [{ titel, tekst }]; zonder deze komt er een standaardversie */
window.VV_RIDES = [
  {
    id: 'kiki-2026-10-18',
    titel: 'Fiets mee met Kiki van fietsenisleven',
    datum: '2026-10-18',          // jjjj-mm-dd
    tijd: '09:00u',
    eind: '12:30',
    label: 'Volgeboekt',
    tekst: 'Verzamelen bij The Happiness Cafe in Den Bosch. Daarna twee begeleide fietsrondes van 33 en 60 kilometer.',
    link: '/fietsenisleven',
    open: false,
    locatie: 'The Happiness Cafe',
    adres: 'Orthenstraat, Den Bosch',
    bijdrage: '€10 per deelnemer, volledig voor Velo Vital',
    bereik: 'Vlak bij station Den Bosch. In het weekend mag je fiets de hele dag mee in de trein.',
    meenemen: [
      'Je fiets met opgepompte banden (geen e-bike, we trappen op eigen kracht)',
      'Een bidon of flesje water',
      'Laagjes kleding en een regenjasje',
      'Je goede humeur, de koffie staat klaar'
    ],
    stappen: [
      { titel: 'Koffie en kennismaken', tekst: 'Vanaf 09:00 uur verzamelen we bij The Happiness Cafe. Kiki is er bij de aftrap.' },
      { titel: 'Korte fietscheck', tekst: 'We kijken samen of je fiets goed is afgesteld en verdelen ons over de twee groepen.' },
      { titel: 'Samen op pad', tekst: 'Karen en Merel begeleiden de rondes van 33 en 60 kilometer. Niemand wordt achtergelaten.' },
      { titel: 'Terug bij het cafe', tekst: 'Beide routes eindigen bij The Happiness Cafe. Daarna ga je opgeladen naar huis.' }
    ]
  }
];
