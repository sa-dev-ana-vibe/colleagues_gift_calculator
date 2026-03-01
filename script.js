(function () {
  const MAX_SALARY = 10000000000;

  const form = document.getElementById("calculatorForm");
  const resultBlock = document.getElementById("result");
  const detailedFormula = document.getElementById("detailedFormula");
  let resultFadeTimeout = null;

  const salaryInput = document.getElementById("salary");
  const receivedInput = document.getElementById("received");
  const workSelect = document.getElementById("workClose");
  const personalSelect = document.getElementById("personalClose");

  const decimalFormatter = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  function normalizeRaw(raw, removeSpaces) {
    let value = String(raw).trim();
    if (removeSpaces) {
      value = value.replace(/\s/g, "");
    }
    return value.replace(",", ".");
  }

  function toNumber(raw, removeSpaces) {
    const value = normalizeRaw(raw, removeSpaces);
    if (value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function formatGroupedInteger(value) {
    return Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function formatNumber(value) {
    return decimalFormatter.format(value);
  }

  function clearInvalidState() {
    [salaryInput, receivedInput, workSelect, personalSelect].forEach(function (field) {
      field.setAttribute("aria-invalid", "false");
    });
  }

  function setInvalidState(fields) {
    fields.forEach(function (field) {
      field.setAttribute("aria-invalid", "true");
    });
  }

  function updateDetailedFormula(text) {
    detailedFormula.textContent = text;
  }

  function fadeResult() {
    resultBlock.classList.remove("is-fading");
    void resultBlock.offsetWidth;
    resultBlock.classList.add("is-fading");

    if (resultFadeTimeout !== null) {
      clearTimeout(resultFadeTimeout);
    }

    resultFadeTimeout = setTimeout(function () {
      resultBlock.classList.remove("is-fading");
      resultFadeTimeout = null;
    }, 200);
  }

  function renderNeutral(message) {
    resultBlock.classList.remove("is-error");
    resultBlock.setAttribute("role", "status");
    resultBlock.innerHTML = `<p class="result__hint">${message}</p>`;
    fadeResult();
  }

  function renderError(message, fields) {
    resultBlock.classList.add("is-error");
    resultBlock.setAttribute("role", "alert");
    resultBlock.innerHTML = `<p class="result__hint">${message}</p>`;
    clearInvalidState();
    setInvalidState(fields || []);
    fadeResult();
  }

  function renderResult(data) {
    resultBlock.classList.remove("is-error");
    resultBlock.setAttribute("role", "status");
    resultBlock.innerHTML = `
      <p class="result__sum">Рекомендуемая сумма: ${formatNumber(data.recommended)}</p>
      <p class="result__secondary">Удобно округлить до: <strong>${formatNumber(data.rounded)}</strong></p>
      <p class="result__emotion">Это комфортный вклад с учётом ваших отношений.</p>
    `;
    fadeResult();
  }

  function updateFormulaDetails(data) {
    const salaryPart = data.salary === null ? "X" : formatNumber(data.salary);
    const receivedPart = data.received === null ? "Y" : formatNumber(data.received);
    const totalPart =
      typeof data.recommended === "number" ? formatNumber(data.recommended) : "—";

    updateDetailedFormula(
      `(${salaryPart} / 500 + ${receivedPart} / 100) × ${formatNumber(data.work)} × ${formatNumber(data.personal)} = ${totalPart}`,
    );
  }

  function formatInputOnBlur(input) {
    const value = toNumber(input.value, true);
    if (value === null || Number.isNaN(value) || value < 0) {
      return;
    }
    input.value = formatGroupedInteger(value);
  }

  function recalculate() {
    clearInvalidState();

    const salary = toNumber(salaryInput.value, true);
    const received = toNumber(receivedInput.value, true);
    const work = toNumber(workSelect.value, false);
    const personal = toNumber(personalSelect.value, false);

    if (salary !== null && Number.isNaN(salary)) {
      updateFormulaDetails({ salary: null, received, work, personal });
      renderError("Введите корректное число зарплаты.", [salaryInput]);
      return;
    }

    if (received !== null && Number.isNaN(received)) {
      updateFormulaDetails({ salary, received: null, work, personal });
      renderError("Введите корректное число суммы подарка.", [receivedInput]);
      return;
    }

    if (salary !== null && salary < 0) {
      updateFormulaDetails({ salary, received, work, personal });
      renderError("Зарплата не может быть отрицательной.", [salaryInput]);
      return;
    }

    if (salary !== null && salary > MAX_SALARY) {
      updateFormulaDetails({ salary, received, work, personal });
      renderError("Значение выходит за пределы расчёта. Максимум — 10 000 000 000.", [salaryInput]);
      return;
    }

    if (received !== null && received < 0) {
      updateFormulaDetails({ salary, received, work, personal });
      renderError("Сумма подарка не может быть отрицательной.", [receivedInput]);
      return;
    }

    if (salary === null || received === null) {
      updateFormulaDetails({ salary, received, work, personal });
      renderNeutral("Введите зарплату и сумму подарка — сумма посчитается автоматически.");
      return;
    }

    if (Number.isNaN(work) || Number.isNaN(personal)) {
      renderError("Укажите корректные коэффициенты.", [workSelect, personalSelect]);
      return;
    }

    const recommended = (salary / 500 + received / 100) * work * personal;
    const rounded = Math.ceil(recommended / 50) * 50;

    updateFormulaDetails({ salary, received, work, personal, recommended });

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

  [salaryInput, receivedInput].forEach(function (input) {
    input.addEventListener("focus", function () {
      input.value = input.value.replace(/\s/g, "");
    });

    input.addEventListener("blur", function () {
      formatInputOnBlur(input);
      recalculate();
    });
  });

  [workSelect, personalSelect].forEach(function (select) {
    select.addEventListener("change", recalculate);
  });

  recalculate();
})();
