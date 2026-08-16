(function(){
  var overlay = document.getElementById('aboutModalOverlay');
  var closeBtn = document.getElementById('aboutModalClose');
  var openLink = document.getElementById('navAboutLink');
  var video = document.getElementById('aboutModalVideo');
  if(!overlay || !openLink) return;

  function openAbout(e){
    if(e) e.preventDefault();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if(video){ video.currentTime = 0; video.play().catch(function(){}); }
  }
  function closeAbout(){
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if(video) video.pause();
  }

  openLink.addEventListener('click', openAbout);
  closeBtn.addEventListener('click', closeAbout);
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) closeAbout();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('is-open')) closeAbout();
  });

  document.addEventListener('promo-closed', function(){
    setTimeout(openAbout, 350);
  }, { once: true });
})();
