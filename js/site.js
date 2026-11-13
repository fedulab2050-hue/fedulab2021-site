// 공통: 헤더 그림자, 모바일 메뉴
(function () {
  var header = document.querySelector('.site-header');
  var fab = document.querySelector('.fab');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (fab) fab.classList.toggle('is-visible', window.scrollY > 240);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var topBtn = document.querySelector('[data-top]');
  if (topBtn) topBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    var logo = document.querySelector('.brand'); if (logo) logo.focus({ preventScroll: true });
  });

  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('site-nav');
  if (!btn || !nav) return;
  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }
  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); } });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080) setOpen(false); });
})();
