const openBtn        = document.getElementById('open-modal-btn');
const closeBtn       = document.getElementById('close-modal-btn');
const annullaBtn     = document.getElementById('annulla-btn');
const modal          = document.getElementById('contact-modal');
const form           = document.getElementById('contact-form');
const confermaBox    = document.getElementById('conferma-box');
const chiudiConferma = document.getElementById('chiudi-conferma-btn');

// Apre la modale
openBtn.addEventListener('click', function () {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
});

// Chiude senza salvare: pulsante ✕
closeBtn.addEventListener('click', closeModal);

// Chiude senza salvare: pulsante Annulla
annullaBtn.addEventListener('click', closeModal);

// Chiude senza salvare: clic sull'overlay scuro
modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
});

// Chiude senza salvare: tasto Escape
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

// Conferma: salva e mostra i dati nella pagina
form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const nome   = document.getElementById('nome').value.trim();
    const email  = document.getElementById('email').value.trim();
    const motivo = document.getElementById('motivo').value;
    const data   = document.getElementById('data').value;
    const msg    = document.getElementById('messaggio').value.trim();

    document.getElementById('conf-nome').textContent      = nome;
    document.getElementById('conf-email').textContent     = email;
    document.getElementById('conf-motivo').textContent    = motivo;
    document.getElementById('conf-data').textContent      = data || '—';
    document.getElementById('conf-messaggio').textContent = msg;

    confermaBox.hidden = false;
    confermaBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    closeModal();
    form.reset();
});

// Chiude il box di conferma
chiudiConferma.addEventListener('click', function () {
    confermaBox.hidden = true;
});

function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    openBtn.focus();
}
