// Booking page: live summary, service search/filter/sort and friendly validation.
(function () {
  var form = document.getElementById('bookingForm');
  if (!form) return;

  var pet = document.getElementById('petId');
  var date = document.getElementById('bookingDate');
  var list = document.getElementById('serviceList');
  var items = Array.prototype.slice.call(list.querySelectorAll('.service-item'));
  var search = document.getElementById('serviceSearch');
  var sort = document.getElementById('serviceSort');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var noServices = document.getElementById('noServices');
  var steps = document.querySelectorAll('#bookingSteps li');
  var activeFilter = 'all';

  function selectedService() { return form.querySelector('input[name="serviceId"]:checked'); }
  function setText(id, text) { var el = document.getElementById(id); el.textContent = text; }
  function setEmpty(id, text) { var el = document.getElementById(id); el.innerHTML = '<span class="empty"></span>'; el.firstChild.textContent = text; }

  function formatDate(value) {
    if (!value) return '';
    var parts = value.split('-');
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function updateSummary() {
    var petOpt = pet.options[pet.selectedIndex];
    if (pet.value) setText('sumPet', petOpt.text.trim()); else setEmpty('sumPet', 'Not chosen yet');
    var svc = selectedService();
    if (svc) { setText('sumService', svc.getAttribute('data-name')); setText('sumPrice', 'S$' + svc.getAttribute('data-price')); }
    else { setEmpty('sumService', 'Not chosen yet'); setEmpty('sumPrice', '–'); }
    if (date.value) setText('sumDate', formatDate(date.value)); else setEmpty('sumDate', 'Not chosen yet');

    var done = [!!pet.value, !!svc && !!date.value, !!pet.value && !!svc && !!date.value];
    steps.forEach(function (li, i) { li.classList.toggle('done', done[i]); });
  }

  function applyFilters() {
    var q = search.value.trim().toLowerCase();
    var visible = items.filter(function (item) {
      var okCat = activeFilter === 'all' || item.getAttribute('data-category') === activeFilter;
      var okText = !q || item.getAttribute('data-name').indexOf(q) !== -1;
      item.classList.toggle('d-none', !(okCat && okText));
      return okCat && okText;
    });
    var mode = sort.value;
    items.slice().sort(function (a, b) {
      if (mode === 'low') return Number(a.getAttribute('data-price')) - Number(b.getAttribute('data-price'));
      if (mode === 'high') return Number(b.getAttribute('data-price')) - Number(a.getAttribute('data-price'));
      return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
    }).forEach(function (item) { list.appendChild(item); });
    noServices.classList.toggle('d-none', visible.length > 0);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      applyFilters();
    });
  });
  search.addEventListener('input', applyFilters);
  sort.addEventListener('change', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', function () {
    search.value = ''; activeFilter = 'all';
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === 'all')); });
    applyFilters();
  });

  form.addEventListener('change', updateSummary);

  // Friendly validation before the form is sent (the server still validates everything)
  form.addEventListener('submit', function (event) {
    var problems = false;
    var today = date.getAttribute('min');
    pet.classList.toggle('is-invalid', !pet.value);
    if (!pet.value) problems = true;
    var noService = !selectedService();
    document.getElementById('serviceError').classList.toggle('d-none', !noService);
    if (noService) problems = true;
    var badDate = !date.value || (today && date.value < today);
    date.classList.toggle('is-invalid', !!badDate);
    if (badDate) problems = true;
    document.getElementById('formError').classList.toggle('d-none', !problems);
    if (problems) {
      event.preventDefault();
      var first = form.querySelector('.is-invalid') || document.getElementById('serviceList');
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  applyFilters();
  updateSummary();
})();
