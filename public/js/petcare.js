// Shared behaviour: show a loading state on submit buttons so users know the request is being processed.
document.addEventListener('submit', function (event) {
  var form = event.target;
  if (event.defaultPrevented || !form.matches('form')) return;
  var button = form.querySelector('button[type="submit"]');
  if (!button || button.classList.contains('is-loading')) return;
  var text = button.getAttribute('data-loading-text');
  if (!text) return;
  button.classList.add('is-loading');
  button.setAttribute('aria-disabled', 'true');
  button.innerHTML = '<span class="spinner-border" role="status" aria-hidden="true"></span> ' + text;
});
