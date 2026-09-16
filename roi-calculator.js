/**
 * Volo AI — ROI Calculator
 * Updates the ROI card values when the user changes inputs.
 */
(function () {
  var callsInput = document.getElementById('roi-calls');
  var valueInput = document.getElementById('roi-value');
  var perWeekEl = document.getElementById('roi-per-week');
  var perMonthEl = document.getElementById('roi-per-month');
  var breakevenEl = document.getElementById('roi-breakeven');

  function fmt(n) {
    return '£' + Math.round(n).toLocaleString('en-GB');
  }

  function update() {
    var calls = Number(callsInput.value);
    var value = Number(valueInput.value);
    var valid = callsInput.value !== '' && valueInput.value !== ''
      && Number.isFinite(calls) && Number.isFinite(value)
      && Number.isInteger(calls) && calls >= 0 && calls <= 100
      && value >= 1 && value <= 10000;
    callsInput.setAttribute('aria-invalid', String(callsInput.value === '' || !Number.isInteger(calls) || calls < 0 || calls > 100));
    valueInput.setAttribute('aria-invalid', String(valueInput.value === '' || !Number.isFinite(value) || value < 1 || value > 10000));
    if (!valid) {
      perWeekEl.textContent = perMonthEl.textContent = breakevenEl.textContent = '—';
      return;
    }
    var weekly = calls * value;
    var monthly = weekly * 4.33;
    perWeekEl.textContent = fmt(weekly);
    perMonthEl.textContent = fmt(monthly);
    if (value > 0) {
      var be = Math.ceil(29 / value);
      breakevenEl.textContent = be;
    } else {
      breakevenEl.textContent = '—';
    }
  }

  if (callsInput && valueInput && perWeekEl && perMonthEl && breakevenEl) {
    callsInput.addEventListener('input', update);
    valueInput.addEventListener('input', update);
    update();
  }
})();
