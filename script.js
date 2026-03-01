(function () {
  const form = document.getElementById("calculatorForm");
  const resultBlock = document.getElementById("result");

  const salaryInput = document.getElementById("salary");
  const receivedInput = document.getElementById("received");
  const workSelect = document.getElementById("workClose");
  const personalSelect = document.getElementById("personalClose");

  const currencyFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  });

  const decimalFormatter = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  function toNumber(raw) {
    const value = String(raw).trim().replace(",", ".");
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function renderError(message) {
    resultBlock.classList.add("is-error");
    resultBlock.innerHTML = `<p class="result__hint">${message}</p>`;
  }

  function renderResult(data) {
    resultBlock.classList.remove("is-error");
    resultBlock.innerHTML = `
      <p class="result__sum">Рекомендуемая сумма: ${currencyFormatter.format(data.recommended)}</p>
      <p class="result__secondary">Удобно округлить до: <strong>${currencyFormatter.format(data.rounded)}</strong></p>
      <p class="result__formula">
        (${decimalFormatter.format(data.salary)} / 500 + ${decimalFormatter.format(data.received)} / 100) ×
        ${decimalFormatter.format(data.work)} × ${decimalFormatter.format(data.personal)}
        = ${decimalFormatter.format(data.recommended)}
      </p>
    `;
  }

  function calculate(event) {
    event.preventDefault();

    const salary = toNumber(salaryInput.value);
    const received = toNumber(receivedInput.value);
    const work = toNumber(workSelect.value);
    const personal = toNumber(personalSelect.value);

    if (Number.isNaN(salary) || Number.isNaN(received)) {
      renderError("Укажите корректные числа для X и Y.");
      return;
    }

    if (salary < 0 || received < 0) {
      renderError("X и Y не могут быть отрицательными.");
      return;
    }

    const recommended = (salary / 500 + received / 100) * work * personal;
    const rounded = Math.ceil(recommended / 50) * 50;

    renderResult({
      salary,
      received,
      work,
      personal,
      recommended,
      rounded,
    });
  }

  form.addEventListener("submit", calculate);
})();

