(() => {
  const form = document.getElementById('kikiNextForm');
  const status = document.getElementById('kikiNextStatus');
  const success = document.getElementById('kikiNextSuccess');
  if (!form || !status || !success) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.hidden = true;
    try {
      const body = new URLSearchParams(new FormData(form));
      body.set('form-name', form.name);
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      if (!response.ok) throw new Error('Versturen mislukt');
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      status.textContent = 'Versturen is niet gelukt. Probeer het opnieuw of mail naar info@velovital.nl.';
      status.hidden = false;
    } finally {
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
