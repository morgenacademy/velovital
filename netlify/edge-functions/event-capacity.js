// Inschrijfformulieren sluiten automatisch op hun datum, ook als iemand
// het formulier rechtstreeks probeert te versturen.
// Nieuw event? Voeg hier de form-name toe met het sluitmoment.
// Let op de tijdzone: +02:00 is zomertijd, +01:00 is wintertijd (vanaf eind oktober).
// Zet hetzelfde moment als data-sluit-op op het <form> in de HTML.
const SLUITMOMENTEN = {
  'kiki-event-preinschrijving': '2026-10-18T09:00:00+02:00'
};

function isGesloten(formName) {
  const moment = SLUITMOMENTEN[formName];
  return Boolean(moment) && Date.now() >= new Date(moment).getTime();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export default async (request, context) => {
  const url = new URL(request.url);
  const isStatus = request.method === 'GET' && url.pathname === '/_event-registration-status';
  const contentType = request.headers.get('content-type') || '';
  const isPost = request.method === 'POST' &&
    (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data'));
  if (!isStatus && !isPost) return context.next();

  if (isStatus) {
    const formName = url.searchParams.get('form') || 'kiki-event-preinschrijving';
    return json({ closed: isGesloten(formName) });
  }

  const submitted = await request.clone().formData();
  const formName = submitted.get('form-name');
  if (isGesloten(formName)) {
    return json({ closed: true, error: 'Deze datum is voorbij. Aanmelden is gesloten.' }, 409);
  }
  return context.next();
};

export const config = { path: '/*' };
