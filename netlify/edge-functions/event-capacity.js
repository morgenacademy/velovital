const FORM_NAME = 'kiki-event-preinschrijving';
const MAX_ADVANCED = 20;
const API = 'https://api.netlify.com/api/v1';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

async function netlifyGet(path, token) {
  const response = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Netlify API: ${response.status}`);
  return response.json();
}

async function advancedCount(siteId, token) {
  const forms = await netlifyGet(`/sites/${encodeURIComponent(siteId)}/forms`, token);
  const form = forms.find((item) => item.name === FORM_NAME);
  if (!form) throw new Error('Aanmeldformulier ontbreekt in Netlify Forms');

  let count = 0;
  for (let page = 1; page <= 100; page += 1) {
    const submissions = await netlifyGet(
      `/forms/${encodeURIComponent(form.id)}/submissions?per_page=100&page=${page}`,
      token
    );
    count += submissions.filter((item) => item.data?.groep === 'gevorderden').length;
    if (count >= MAX_ADVANCED || submissions.length < 100) return count;
  }
  throw new Error('Te veel pagina’s met aanmeldingen');
}

export default async (request, context) => {
  const url = new URL(request.url);
  const isStatus = request.method === 'GET' && url.pathname === '/_event-registration-status';
  const contentType = request.headers.get('content-type') || '';
  const isPost = request.method === 'POST' &&
    (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data'));
  if (!isStatus && !isPost) return context.next();

  if (isPost) {
    const data = await request.clone().formData();
    if (data.get('form-name') !== FORM_NAME) {
      return context.next();
    }
    if (data.get('fiets') !== 'eigen-fiets' || data.get('groep') !== 'gevorderden') {
      return json({ error: 'Aanmelden kan alleen bij de ervaren groep met een eigen fiets.' }, 400);
    }
    const name = data.get('voornaam')?.trim();
    const email = data.get('email')?.trim();
    if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: 'Vul je voornaam en een geldig e-mailadres in.' }, 400);
    }
  }

  const token = Netlify.env.get('EVENT_NETLIFY_API_TOKEN');
  const siteId = context.site?.id;
  if (!token || !siteId) return json({ error: 'Beschikbaarheid tijdelijk niet bereikbaar.' }, 503);

  try {
    const count = await advancedCount(siteId, token);
    if (isStatus) return json({ closed: count >= MAX_ADVANCED });
    if (count >= MAX_ADVANCED) return json({ closed: true }, 409);
    return context.next();
  } catch (error) {
    console.error('Kan aanmeldingen niet tellen:', error);
    return json({ error: 'Beschikbaarheid tijdelijk niet bereikbaar.' }, 503);
  }
};

export const config = { path: '/*' };
