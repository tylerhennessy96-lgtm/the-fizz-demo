(function () {
  const burgerBtn = document.querySelector('.burger-btn');
  const drawer    = document.querySelector('.drawer');
  const backdrop  = document.querySelector('.drawer-backdrop');
  const closeBtn  = document.querySelector('.drawer-close');
  const logoutBtn = document.querySelector('.drawer-logout');
  const overlay   = document.querySelector('.logout-overlay');

  if (!drawer || !backdrop) return;

  let closingTimer = null;

  function openDrawer() {
    if (closingTimer) { clearTimeout(closingTimer); closingTimer = null; }
    drawer.classList.remove('closing');
    drawer.classList.add('open');
    backdrop.classList.add('open');
    burgerBtn && burgerBtn.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    if (!drawer.classList.contains('open')) return;
    drawer.classList.add('closing');
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    burgerBtn && burgerBtn.setAttribute('aria-expanded', 'false');
    closingTimer = setTimeout(() => {
      drawer.classList.remove('closing');
      closingTimer = null;
    }, 160);
  }
  function toggleDrawer() {
    if (drawer.classList.contains('open')) closeDrawer();
    else openDrawer();
  }

  burgerBtn && burgerBtn.addEventListener('click', toggleDrawer);
  closeBtn  && closeBtn .addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      closeDrawer();
      if (overlay) overlay.classList.add('show');
      setTimeout(() => { window.location.href = 'sso.html'; }, 600);
    });
  }
})();
