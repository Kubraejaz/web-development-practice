// Developer Portfolio & Live Resume Builder JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const customizerDrawer = document.getElementById('customizerDrawer');
  const btnToggleDrawer = document.getElementById('btnToggleDrawer');
  const btnCloseDrawer = document.getElementById('btnCloseDrawer');
  const btnToggleTheme = document.getElementById('btnToggleTheme');
  const btnPrintResume = document.getElementById('btnPrintResume');
  const contactForm = document.getElementById('contactForm');
  const toastMsg = document.getElementById('toastMsg');

  // Input Elements
  const inputHeroName = document.getElementById('inputHeroName');
  const inputHeroRole = document.getElementById('inputHeroRole');
  const inputHeroBio = document.getElementById('inputHeroBio');
  const inputAvatarUrl = document.getElementById('inputAvatarUrl');
  const inputGithub = document.getElementById('inputGithub');
  const inputLinkedin = document.getElementById('inputLinkedin');
  const inputEmail = document.getElementById('inputEmail');

  // Load Saved Theme
  const savedTheme = localStorage.getItem('pb_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  // Toggle Dark/Light Theme
  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      localStorage.setItem('pb_theme', isLight ? 'light' : 'dark');
      showToast(isLight ? 'Switched to Light Mode' : 'Switched to Dark Mode');
    });
  }

  // Toggle Customizer Drawer
  if (btnToggleDrawer && customizerDrawer) {
    btnToggleDrawer.addEventListener('click', () => {
      customizerDrawer.classList.toggle('open');
    });
  }

  if (btnCloseDrawer && customizerDrawer) {
    btnCloseDrawer.addEventListener('click', () => {
      customizerDrawer.classList.remove('open');
    });
  }

  // Live Text Binding Function
  function bindInput(input, selector, isAttr = null) {
    if (!input) return;
    input.addEventListener('input', () => {
      const targets = document.querySelectorAll(selector);
      targets.forEach(target => {
        if (isAttr) {
          target.setAttribute(isAttr, input.value);
        } else {
          target.textContent = input.value;
        }
      });
    });
  }

  bindInput(inputHeroName, '.val-hero-name');
  bindInput(inputHeroRole, '.val-hero-role');
  bindInput(inputHeroBio, '.val-hero-bio');
  bindInput(inputAvatarUrl, '.val-hero-avatar', 'src');

  // Social Links Binding
  if (inputGithub) {
    inputGithub.addEventListener('input', () => {
      document.querySelectorAll('.val-github-link').forEach(el => el.href = inputGithub.value);
    });
  }

  if (inputLinkedin) {
    inputLinkedin.addEventListener('input', () => {
      document.querySelectorAll('.val-linkedin-link').forEach(el => el.href = inputLinkedin.value);
    });
  }

  if (inputEmail) {
    inputEmail.addEventListener('input', () => {
      document.querySelectorAll('.val-email-link').forEach(el => el.href = `mailto:${inputEmail.value}`);
      document.querySelectorAll('.val-email-text').forEach(el => el.textContent = inputEmail.value);
    });
  }

  // Project Category Filter Tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Contact Form Submission Simulation
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const msgInput = document.getElementById('contactMsg');

      if (nameInput.value.trim() && emailInput.value.trim()) {
        showToast(`Thank you ${nameInput.value}! Message sent successfully. ✨`);
        contactForm.reset();
      } else {
        showToast('Please fill out all fields before submitting.');
      }
    });
  }

  // Print Resume Trigger
  if (btnPrintResume) {
    btnPrintResume.addEventListener('click', () => {
      window.print();
    });
  }

  // Toast Notification Helper
  function showToast(message) {
    if (!toastMsg) return;
    toastMsg.textContent = message;
    toastMsg.classList.add('show');
    setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 3500);
  }
});
