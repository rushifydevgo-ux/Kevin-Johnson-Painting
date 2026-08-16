(function(){
  var form = document.getElementById('quoteForm');
  if(!form) return;
  var btn = document.getElementById('quoteSubmitBtn');
  var status = document.getElementById('quoteFormStatus');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.style.display = 'none';

    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    }).then(function(res){
      if(res.ok){
        form.reset();
        status.style.color = 'var(--sage)';
        status.textContent = "Thanks — your request is in. Kevin will reach out shortly to schedule your free in-person estimate.";
      } else {
        status.style.color = 'var(--clay)';
        status.textContent = "Something went wrong sending that. Please call (510) 396-9998 or email kevinjpainting510@gmail.com directly.";
      }
      status.style.display = 'block';
    }).catch(function(){
      status.style.color = 'var(--clay)';
      status.textContent = "Something went wrong sending that. Please call (510) 396-9998 or email kevinjpainting510@gmail.com directly.";
      status.style.display = 'block';
    }).finally(function(){
      btn.disabled = false;
      btn.textContent = 'Request Free Estimate';
    });
  });
})();
