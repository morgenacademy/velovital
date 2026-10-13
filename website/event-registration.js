(() => {
  const form = document.getElementById('kikiEventForm');
  const status = document.getElementById('kikiEventStatus');
  const closed = document.getElementById('kikiEventClosed');
  const success = document.getElementById('kikiEventSuccess');
  if (!form || !status || !closed || !success) return;

  const button = form.querySelector('[type="submit"]');
  const showClosed = () => {
    status.hidden = true;
    form.hidden = true;
    closed.hidden = false;
  };
  const showUnavailable = () => {
    form.hidden = true;
    closed.hidden = true;
    status.textContent = 'Aanmelden is tijdelijk niet beschikbaar. Probeer het later opnieuw.';
    status.hidden = false;
  };
  const checkAvailability = async () => {
    const response = await fetch('/_event-registration-status', { cache: 'no-store' });
    if (!response.ok) throw new Error('Beschikbaarheid niet bereikbaar');
    const availability = await response.json();
    if (availability.closed) {
      showClosed();
    } else {
      status.hidden = true;
      form.hidden = false;
    }
  };

  checkAvailability().catch(showUnavailable);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
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
      if (response.status === 409) {
        showClosed();
        return;
      }
      if (!response.ok) throw new Error('Aanmelden mislukt');
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      status.textContent = 'Aanmelden is niet gelukt. Probeer het opnieuw; je gegevens staan nog in het formulier.';
      status.hidden = false;
    } finally {
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
