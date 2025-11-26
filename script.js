// lightweight site behavior: mobile nav, form save to localStorage, stat counter, form validation
document.addEventListener('DOMContentLoaded', function () {
  // header nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if (nav.style.display === 'flex') {
        nav.style.display = '';
      } else {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.gap = '10px';
        nav.style.background = 'white';
        nav.style.padding = '12px';
        nav.style.borderRadius = '10px';
        nav.style.boxShadow = '0 8px 24px rgba(2,6,23,0.06)';
      }
    });
  }

  // set year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // stats animation when visible
  function animateStats() {
    const stats = document.querySelectorAll('.stat-num');
    stats.forEach(el => {
      const target = parseInt(el.dataset.target || '0', 10);
      let current = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const id = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target.toLocaleString();
          clearInterval(id);
        } else {
          el.textContent = current.toLocaleString();
        }
      }, 16);
    });
  }

  // intersection observer to trigger once
  const statSection = document.getElementById('impact');
  if (statSection) {
    let fired = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !fired) {
          fired = true;
          animateStats();
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 });
    obs.observe(statSection);
  }

  // simple form handling: saves to localStorage and shows message
  const form = document.getElementById('signup-form');
  const formMsg = document.getElementById('form-msg');
  const clearBtn = document.getElementById('clear-storage');

  function showMessage(text, ok = true) {
    formMsg.textContent = text;
    formMsg.style.color = ok ? 'var(--accent)' : 'crimson';
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const interest = form.interest.value;

      if (!name || !email) {
        showMessage('Please enter your name and a valid email.', false);
        return;
      }

      // save to localStorage as demo lead capture
      const leads = JSON.parse(localStorage.getItem('edutech_leads') || '[]');
      leads.push({
        name, email, interest, date: new Date().toISOString()
      });
      localStorage.setItem('edutech_leads', JSON.stringify(leads));

      // visual success
      showMessage('Thanks — you are on the list! We saved a test lead locally (replace with your backend).');
      form.reset();

      // for developer testing: log leads count
      console.log('Leads saved (local):', leads.length, leads);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem('edutech_leads');
      showMessage('Saved test leads cleared.');
    });
  }

  // accessible skip for keyboard users: focus outline improvements
  document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
  });
});

// ...existing code...

document.addEventListener('DOMContentLoaded', () => {
  const easeOutQuad = t => t * (2 - t);

  function animateCount(el, start, end, duration = 1500) {
    let startTime = null;
    const suffix = el.dataset.suffix || '';
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = easeOutQuad(progress);
      const current = Math.floor(start + (end - start) * eased);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else {
        el.textContent = end.toLocaleString() + suffix;
        el.dataset.animated = 'true';
      }
    }
    requestAnimationFrame(step);
  }

  // Prepare elements: extract numeric target and suffix (e.g. "2500+")
  const nums = document.querySelectorAll('.impact-numbers .num, .numbers-wrap .num');
  nums.forEach(el => {
    const raw = el.textContent.trim();
    const match = raw.match(/[\d,]+/);
    const target = match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
    const suffix = raw.replace(match ? match[0] : '', '').trim() || '';
    el.dataset.target = target;
    el.dataset.suffix = suffix;
    el.textContent = '0' + suffix;
  });

  // Trigger animation when section/element comes into view
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const container = entry.target;
      // animate all numbers inside the container (or single element)
      const targets = container.querySelectorAll('.num');
      targets.forEach(el => {
        if (el.dataset.animated === 'true') return;
        const end = parseInt(el.dataset.target || '0', 10);
        // small per-item stagger and slightly longer for bigger numbers
        const duration = 1200 + Math.min(2000, end / 2);
        animateCount(el, 0, end, duration);
      });
      obs.unobserve(container);
    });
  }, { threshold: 0.4 });

  // Observe the section or wrapper that contains the numbers
  const wrapper = document.querySelector('.impact-numbers') || document.querySelector('.numbers-wrap');
  if (wrapper) observer.observe(wrapper);
});