// Assignment 4: JavaScript features for H&M Bakery.
// All features run in the browser; no information is sent to a server.
document.addEventListener('DOMContentLoaded', () => {
  // Task 1: Validate the registration form.
  const form = document.querySelector('#register-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = {
        name: document.querySelector('#register-name'),
        email: document.querySelector('#register-email'),
        password: document.querySelector('#register-password'),
        confirm: document.querySelector('#register-confirm')
      };
      const values = Object.fromEntries(Object.entries(fields).map(([key, el]) => [key, el.value.trim()]));
      const errors = {
        name: values.name ? '' : 'Please enter your name.',
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? '' : 'Please enter a valid email.',
        password: values.password.length >= 8 ? '' : 'Password must be at least 8 characters.',
        confirm: values.confirm && values.confirm === values.password ? '' : 'Passwords must match.'
      };
      for (const [key, message] of Object.entries(errors)) {
        document.querySelector(`#register-${key}-error`).textContent = message;
        fields[key].classList.toggle('is-invalid', Boolean(message));
        fields[key].setAttribute('aria-invalid', String(Boolean(message)));
      }
      document.querySelector('#register-success').textContent = Object.values(errors).some(Boolean)
        ? '' : 'All fields are valid! This is a demo; no account was created.';
    });
  }

  // Task 2: FAQ accordion; one click opens, another click closes.
  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const opening = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(opening));
      button.querySelector('span').textContent = opening ? '−' : '+';
      if (opening) {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add('expanded'));
      } else {
        panel.classList.remove('expanded');
        // Wait for the CSS transition before hiding.
        setTimeout(() => { if (button.getAttribute('aria-expanded') === 'false') panel.hidden = true; }, 260);
      }
    });
  });

  // Task 3: Subscription modal; close with X, backdrop, or Escape.
  const modal = document.querySelector('#subscribe-modal');
  const closeButton = document.querySelector('#close-subscribe');
  let previousFocus = null;
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (previousFocus) previousFocus.focus();
  }
  document.querySelectorAll('#open-subscribe').forEach((button) => button.addEventListener('click', () => {
    previousFocus = button;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.querySelector('#subscribe-email').focus();
  }));
  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button, input')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.querySelector('#subscribe-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.querySelector('#subscribe-email').value.trim();
    document.querySelector('#subscribe-feedback').textContent = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Email format is valid! Demo only — no subscription was saved.' : 'Please enter a valid email address.';
  });

  // Task 4: Cycle through four soft bakery-themed background colors.
  const colors = ['#fffaf5', '#f2f7ec', '#f0f3fc', '#fff0f5'];
  let colorIndex = 0;
  document.querySelectorAll('#change-color').forEach((button) => button.addEventListener('click', () => {
    colorIndex = (colorIndex + 1) % colors.length;
    document.body.style.backgroundColor = colors[colorIndex];
  }));

  // Task 5: Display local date and time and update once per second.
  function updateClock() {
    const text = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium' });
    document.querySelectorAll('#live-clock').forEach((clock) => { clock.textContent = text; });
  }
  updateClock();
  setInterval(updateClock, 1000);
});
