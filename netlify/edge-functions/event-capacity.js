const FORM_NAME = 'kiki-event-preinschrijving';

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

  // De fietsochtend is handmatig gesloten. Weiger ook rechtstreekse POST-verzoeken
  // naar het oude formulier, ongeacht de eerdere capaciteitsberekening.
  if (isStatus) return json({ closed: true });
  if (isPost) {
    const submitted = await request.clone().formData();
    if (submitted.get('form-name') === FORM_NAME) {
      return json({ closed: true, error: 'Deze fietsochtend is vol. Aanmelden is gesloten.' }, 409);
    }
    return context.next();
  }

};

export const config = { path: '/*' };
