(function(){
  var slider = document.getElementById('baaSlider');
  var wrap = document.getElementById('baaBeforeWrap');
  var handle = document.getElementById('baaHandle');
  var brush = document.getElementById('baaBrush');
  var beforeImg = document.getElementById('baaBeforeImg');
  var labelBefore = document.getElementById('baaLabelBefore');
  var labelAfter = document.getElementById('baaLabelAfter');
  if(!slider) return;

  function syncWidth(){
    var w = slider.getBoundingClientRect().width;
    beforeImg.style.width = w + 'px';
  }
  function setPosition(percent){
    percent = Math.max(0, Math.min(100, percent));
    wrap.style.width = percent + '%';
    handle.style.left = percent + '%';
    brush.style.left = percent + '%';
    labelAfter.style.opacity = percent > 96 ? '0' : '1';
    labelBefore.style.opacity = percent < 4 ? '0' : '1';
  }
  function moveHandler(clientX){
    var rect = slider.getBoundingClientRect();
    var percent = ((clientX - rect.left) / rect.width) * 100;
    setPosition(percent);
  }

  syncWidth();
  setPosition(50);
  window.addEventListener('resize', syncWidth);

  var dragging = false;
  slider.addEventListener('mousedown', function(e){ dragging = true; moveHandler(e.clientX); });
  window.addEventListener('mousemove', function(e){ if(dragging) moveHandler(e.clientX); });
  window.addEventListener('mouseup', function(){ dragging = false; });

  slider.addEventListener('touchstart', function(e){ dragging = true; moveHandler(e.touches[0].clientX); }, {passive:true});
  slider.addEventListener('touchmove', function(e){ if(dragging) moveHandler(e.touches[0].clientX); }, {passive:true});
  window.addEventListener('touchend', function(){ dragging = false; });
})();
