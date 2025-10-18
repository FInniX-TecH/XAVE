// script.js — shared behavior for all pages
document.addEventListener('DOMContentLoaded', () => {
  // elements
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('primary-nav');
  const yearEls = document.querySelectorAll('[id^="year"]');

  // set year in all pages
  yearEls.forEach(el => el.textContent = new Date().getFullYear());

  // mobile nav toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if (navList) navList.classList.toggle('show');
    });
  }

  // WELCOME modal behavior (appear on every load/refresh, then can be closed)
  const welcome = document.getElementById('welcome-modal');
  const overlay = document.getElementById('overlay');
  const closeBtn = welcome?.querySelector('.modal-close');

  function openWelcome() {
    if (!welcome || !overlay) return;
    welcome.hidden = false;
    overlay.hidden = false;
    // trap focus minimally
    closeBtn?.focus();
  }

  function closeWelcome() {
    if (!welcome || !overlay) return;
    welcome.hidden = true;
    overlay.hidden = true;
  }

  if (welcome) {
    // always show on load/refresh as requested
    openWelcome();
    closeBtn?.addEventListener('click', closeWelcome);
    overlay?.addEventListener('click', closeWelcome);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeWelcome();
    });
  }

  // Contact form (contact.html project enquiry)
  const contactForm = document.getElementById('contact-form-page');
  const contactStatus = document.getElementById('contact-status');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactStatus.hidden = true;
      const fd = new FormData(contactForm);
      const name = (fd.get('name') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();
      if (name.length < 2) return showContact('Please enter a valid name.', true);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showContact('Please enter a valid email.', true);
      if (message.length < 10) return showContact('Please provide project details (10+ chars).', true);
      showContact('Sending…', false);
      setTimeout(() => {
        showContact('Thanks! Your enquiry has been recorded. We will reply within one business day.');
        contactForm.reset();
      }, 800);
    });
  }

  function showContact(text, isError = false) {
    if (!contactStatus) return;
    contactStatus.hidden = false;
    contactStatus.textContent = text;
    contactStatus.style.color = isError ? '#ff6b6b' : '';
  }

  // Complaint form (store locally in localStorage and show in reviews list)
  const complaintForm = document.getElementById('complaint-form');
  const complaintStatus = document.getElementById('complaint-status');
  const reviewsList = document.getElementById('reviews-list');

  function loadReviews() {
    if (!reviewsList) return;
    const data = JSON.parse(localStorage.getItem('xave_reviews') || '[]');
    reviewsList.innerHTML = '';
    if (data.length === 0) {
      reviewsList.innerHTML = '<li class="muted">No complaints or feedback yet.</li>';
      return;
    }
    data.slice().reverse().forEach(item => {
      const li = document.createElement('li');
      li.className = 'review-item';
      li.innerHTML = `<div class="review-meta"><strong>${escapeHtml(item.name)}</strong> • ${escapeHtml(item.email)} • <small>${new Date(item.date).toLocaleString()}</small></div>
                      <div class="review-body">${escapeHtml(item.message)}</div>`;
      reviewsList.appendChild(li);
    });
  }

  if (complaintForm) {
    complaintForm.addEventListener('submit', (e) => {
      e.preventDefault();
      complaintStatus.hidden = true;
      const fd = new FormData(complaintForm);
      const name = (fd.get('cname') || '').toString().trim();
      const email = (fd.get('cemail') || '').toString().trim();
      const message = (fd.get('cmessage') || '').toString().trim();
      if (name.length < 2) return showComplaint('Please enter your name (2+ chars).', true);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showComplaint('Please enter a valid email.', true);
      if (message.length < 6) return showComplaint('Please enter a longer message (6+ chars).', true);

      showComplaint('Submitting…', false);
      // persist locally
      const reviews = JSON.parse(localStorage.getItem('xave_reviews') || '[]');
      reviews.push({ name, email, message, date: new Date().toISOString() });
      localStorage.setItem('xave_reviews', JSON.stringify(reviews));
      setTimeout(() => {
        showComplaint('Thanks! Your feedback has been recorded.');
        complaintForm.reset();
        loadReviews();
      }, 600);
    });
  }

  function showComplaint(text, isError = false) {
    if (!complaintStatus) return;
    complaintStatus.hidden = false;
    complaintStatus.textContent = text;
    complaintStatus.style.color = isError ? '#ff6b6b' : '';
  }

  // Show persisted reviews on contact page
  loadReviews();

  // small helper to avoid XSS when injecting user text
  function escapeHtml(s = '') {
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#39;');
  }

  // Smooth scroll for internal links
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.focus({ preventScroll: true });
        }
      });
    });
  }

  // close mobile nav when clicking a nav link
  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      if (navList && navList.classList.contains('show')) {
        navList.classList.remove('show');
        navToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });
});

