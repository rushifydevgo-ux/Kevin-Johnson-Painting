(function(){
  var banner = document.getElementById('promoBanner');
  var bannerClose = document.getElementById('promoBannerClose');
  if(!banner) return;
  bannerClose.addEventListener('click', function(){
    banner.style.display = 'none';
  });
})();

(function(){
  var overlay = document.getElementById('promoOverlay');
  var closeBtn = document.getElementById('promoClose');
  var cta = document.getElementById('promoCta');
  if(!overlay) return;

  function openPromo(){ overlay.classList.add('is-open'); }
  function closePromo(){
    overlay.classList.remove('is-open');
    document.dispatchEvent(new CustomEvent('promo-closed'));
  }

  setTimeout(openPromo, 1800);

  closeBtn.addEventListener('click', closePromo);
  cta.addEventListener('click', closePromo);
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) closePromo();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closePromo();
  });
})();
