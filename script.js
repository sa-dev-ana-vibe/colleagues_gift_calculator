(function () {
  const form = document.getElementById("calculatorForm");
  const resultBlock = document.getElementById("result");
  const liveFormula = document.getElementById("liveFormula");

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
    if (value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function formatNumber(value) {
    return decimalFormatter.format(value);
  }

  function renderNeutral(message) {
    resultBlock.classList.remove("is-error");
    resultBlock.innerHTML = `<p class="result__hint">${message}</p>`;
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
        (${formatNumber(data.salary)} / 500 + ${formatNumber(data.received)} / 100) ×
        ${formatNumber(data.work)} × ${formatNumber(data.personal)} = ${formatNumber(data.recommended)}
      </p>
    `;
  }

  function renderLiveFormula(data) {
    const salaryPart = data.salary === null ? "X" : formatNumber(data.salary);
    const receivedPart = data.received === null ? "Y" : formatNumber(data.received);
    const totalPart =
      typeof data.recommended === "number" ? formatNumber(data.recommended) : "—";

    liveFormula.textContent =
      `(${salaryPart} / 500 + ${receivedPart} / 100) × ${formatNumber(data.work)} × ${formatNumber(data.personal)} = ${totalPart}`;
  }

  function recalculate() {
    const salary = toNumber(salaryInput.value);
    const received = toNumber(receivedInput.value);
    const work = toNumber(workSelect.value);
    const personal = toNumber(personalSelect.value);

    if (salary !== null && Number.isNaN(salary)) {
      renderLiveFormula({ salary: null, received, work, personal });
      renderError("Введите корректное число для X.");
      return;
    }

    if (received !== null && Number.isNaN(received)) {
      renderLiveFormula({ salary, received: null, work, personal });
      renderError("Введите корректное число для Y.");
      return;
    }

    if (salary !== null && salary < 0) {
      renderLiveFormula({ salary, received, work, personal });
      renderError("X не может быть отрицательным.");
      return;
    }

    if (received !== null && received < 0) {
      renderLiveFormula({ salary, received, work, personal });
      renderError("Y не может быть отрицательным.");
      return;
    }

    if (salary === null || received === null) {
      renderLiveFormula({ salary, received, work, personal });
      renderNeutral("Введите X и Y — сумма посчитается автоматически.");
      return;
    }

    if (Number.isNaN(work) || Number.isNaN(personal)) {
      renderError("Укажите корректные числа для X и Y.");
      return;
    }

    const recommended = (salary / 500 + received / 100) * work * personal;
    const rounded = Math.ceil(recommended / 50) * 50;

    renderLiveFormula({ salary, received, work, personal, recommended });

    renderResult({
      salary,
      received,
      work,
      personal,
      recommended,
      rounded,
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  [salaryInput, receivedInput].forEach(function (input) {
    input.addEventListener("input", recalculate);
  });

  [workSelect, personalSelect].forEach(function (select) {
    select.addEventListener("change", recalculate);
  });

  recalculate();
})();
