(function () {
  const MAX_AMOUNT = 100000000000000;
  const I18N = {
    ru: {
      pageTitle: "Калькулятор подарка коллеге",
      title: "Калькулятор подарка на день рождения",
      subtitle:
        "Чем выше зарплата и чем ближе отношения — тем больше рекомендуемый вклад.",
      salaryLabel: "Ваша зарплата в месяц",
      salaryPlaceholder: "Например, 300 000",
      receivedLabel: "Подарок от коллег на прошлый ДР (всего)",
      receivedPlaceholder: "Например, 15 000",
      workLabel: "Рабочая близость",
      personalLabel: "Личная близость",
      workOptions: [
        "Работаете в разных отделах",
        "Коллеги по отделу",
        "Работаете в одной команде",
        "Руководитель или подчиненный",
      ],
      personalOptions: [
        "Видитесь реже раза в неделю",
        "Вместе обедаете",
        "Иногда выпиваете вместе",
        "Ходите друг к другу в гости",
      ],
      resultInitial:
        "Введите зарплату и сумму подарка — рекомендация обновится автоматически.",
      resultRecommended: "Рекомендуемый вклад",
      resultRound: "Можно округлить до",
      resultEmotion: "Комфортный вклад с учётом ваших отношений.",
      errorInvalidSalary: "Введите корректное значение зарплаты.",
      errorInvalidGift: "Введите корректное значение суммы подарка.",
      errorNegative: "Сумма не может быть отрицательной.",
      errorTooLarge:
        "Значение выходит за пределы расчёта. Максимум — {max}.",
      errorInvalidCoefficients: "Выберите корректные варианты отношений.",
      detailsSummary: "Показать расчёт",
      detailsInitial: "Заполните значения, чтобы увидеть расчёт.",
      footerPrivacy:
        "Введённые значения не отправляются на сервер и не сохраняются. Расчёт выполняется локально в вашем браузере.",
      footerDisclaimer:
        "Калькулятор носит рекомендательный характер и не является финансовой рекомендацией.",
      footerBasedOn: "Основано на посте",
      footerBasedOnLink: "Антона Лугинина",
    },
    en: {
      pageTitle: "Birthday Gift Calculator",
      title: "Birthday Gift Calculator",
      subtitle:
        "The higher the salary and the closer the relationship — the larger the recommended contribution.",
      salaryLabel: "Your monthly salary",
      salaryPlaceholder: "e.g. 3 000",
      receivedLabel: "How much your colleagues gave you last time (total)",
      receivedPlaceholder: "e.g. 1 500",
      workLabel: "Work relationship",
      personalLabel: "Personal relationship",
      workOptions: [
        "Work in different departments",
        "Colleagues in the same department",
        "Work closely in the same team",
        "Direct manager or direct report",
      ],
      personalOptions: [
        "Rarely see each other outside meetings",
        "Have lunch together",
        "Occasionally go out together",
        "Visit each other outside of work",
      ],
      resultInitial:
        "Enter your salary and the previous gift amount — the recommendation will update automatically.",
      resultRecommended: "Recommended contribution",
      resultRound: "You may round it to",
      resultEmotion: "A comfortable contribution based on your relationship.",
      errorInvalidSalary: "Please enter a valid salary amount.",
      errorInvalidGift: "Please enter a valid gift amount.",
      errorNegative: "The amount cannot be negative.",
      errorTooLarge:
        "The value exceeds the calculation range. Maximum allowed is {max}.",
      errorInvalidCoefficients:
        "Please select valid relationship options.",
      detailsSummary: "Show calculation details",
      detailsInitial: "Fill in the values to see the calculation breakdown.",
      footerPrivacy:
        "Entered values are not sent to any server and are not stored. All calculations are performed locally in your browser.",
      footerDisclaimer:
        "This calculator provides a recommendation and is not financial advice.",
      footerBasedOn: "Based on a post by",
      footerBasedOnLink: "Anton Luginin",
    },
  };

  const form = document.getElementById("calculatorForm");
  const resultBlock = document.getElementById("result");
  const detailedFormula = document.getElementById("detailedFormula");
  const langButtons = Array.from(document.querySelectorAll(".lang-switch__btn"));
  let resultFadeTimeout = null;
  let currentLang = document.documentElement.lang === "en" ? "en" : "ru";

  const salaryInput = document.getElementById("salary");
  const receivedInput = document.getElementById("received");
  const workSelect = document.getElementById("workClose");
  const personalSelect = document.getElementById("personalClose");
  const decimalFormatterCache = {};
  const integerFormatterCache = {};

  function getLocale() {
    return currentLang === "en" ? "en-US" : "ru-RU";
  }

  function getDecimalFormatter() {
    const locale = getLocale();
    if (!decimalFormatterCache[locale]) {
      decimalFormatterCache[locale] = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
    return decimalFormatterCache[locale];
  }

  function getIntegerFormatter() {
    const locale = getLocale();
    if (!integerFormatterCache[locale]) {
      integerFormatterCache[locale] = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return integerFormatterCache[locale];
  }

  function t(key, params) {
    const value = I18N[currentLang][key];
    if (typeof value !== "string") {
      return "";
    }
    if (!params) {
      return value;
    }
    return value.replace(/\{(\w+)\}/g, function (_, token) {
      return Object.prototype.hasOwnProperty.call(params, token)
        ? params[token]
        : "";
    });
  }

  function setSelectOptions(select, optionTexts) {
    optionTexts.forEach(function (text, index) {
      if (select.options[index]) {
        select.options[index].textContent = text;
      }
    });
  }

  function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.title = t("pageTitle");

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      const key = element.getAttribute("data-i18n");
      if (key && Object.prototype.hasOwnProperty.call(I18N[currentLang], key)) {
        element.textContent = t(key);
      }
    });

    document
      .querySelectorAll("[data-i18n-placeholder]")
      .forEach(function (element) {
        const key = element.getAttribute("data-i18n-placeholder");
        if (key && Object.prototype.hasOwnProperty.call(I18N[currentLang], key)) {
          element.setAttribute("placeholder", t(key));
        }
      });

    setSelectOptions(workSelect, I18N[currentLang].workOptions);
    setSelectOptions(personalSelect, I18N[currentLang].personalOptions);

    langButtons.forEach(function (button) {
      const isCurrent = button.getAttribute("data-lang") === currentLang;
      button.classList.toggle("is-active", isCurrent);
      button.setAttribute("aria-pressed", isCurrent ? "true" : "false");
    });
  }

  function normalizeRaw(raw, removeSpaces) {
    let value = String(raw).trim();
    if (removeSpaces) {
      value = value.replace(/\s/g, "");
    }
    if (value === "") {
      return value;
    }

    const hasComma = value.includes(",");
    const hasDot = value.includes(".");

    if (hasComma && hasDot) {
      if (value.lastIndexOf(",") > value.lastIndexOf(".")) {
        return value.replace(/\./g, "").replace(",", ".");
      }
      return value.replace(/,/g, "");
    }

    if (hasComma) {
      const commaParts = value.split(",");
      if (
        commaParts.length === 2 &&
        commaParts[1].length > 0 &&
        commaParts[1].length <= 2
      ) {
        return commaParts[0] + "." + commaParts[1];
      }
      return value.replace(/,/g, "");
    }

    if (hasDot) {
      const dotParts = value.split(".");
      if (dotParts.length > 2) {
        return value.replace(/\./g, "");
      }
      if (dotParts.length === 2 && dotParts[1].length === 3) {
        return value.replace(/\./g, "");
      }
    }

    return value;
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
    return getIntegerFormatter().format(Math.round(value));
  }

  function formatNumber(value) {
    return getDecimalFormatter().format(value);
  }

  function formatLimit() {
    return getIntegerFormatter().format(MAX_AMOUNT);
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
      <p class="result__sum">${t("resultRecommended")}: ${formatNumber(data.recommended)}</p>
      <p class="result__secondary">${t("resultRound")}: <strong>${formatNumber(data.rounded)}</strong></p>
      <p class="result__emotion">${t("resultEmotion")}</p>
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
      renderError(t("errorInvalidSalary"), [salaryInput]);
      return;
    }

    if (received !== null && Number.isNaN(received)) {
      updateFormulaDetails({ salary, received: null, work, personal });
      renderError(t("errorInvalidGift"), [receivedInput]);
      return;
    }

    if (salary !== null && salary < 0) {
      updateFormulaDetails({ salary, received, work, personal });
      renderError(t("errorNegative"), [salaryInput]);
      return;
    }

    if (salary !== null && salary > MAX_AMOUNT) {
      updateFormulaDetails({ salary, received, work, personal });
      renderError(t("errorTooLarge", { max: formatLimit() }), [salaryInput]);
      return;
    }

    if (received !== null && received < 0) {
      updateFormulaDetails({ salary, received, work, personal });
      renderError(t("errorNegative"), [receivedInput]);
      return;
    }

    if (received !== null && received > MAX_AMOUNT) {
      updateFormulaDetails({ salary, received, work, personal });
      renderError(t("errorTooLarge", { max: formatLimit() }), [receivedInput]);
      return;
    }

    if (salary === null || received === null) {
      updateFormulaDetails({ salary, received, work, personal });
      renderNeutral(t("resultInitial"));
      return;
    }

    if (Number.isNaN(work) || Number.isNaN(personal)) {
      renderError(t("errorInvalidCoefficients"), [workSelect, personalSelect]);
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

  langButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const nextLang = button.getAttribute("data-lang");
      if (!Object.prototype.hasOwnProperty.call(I18N, nextLang)) {
        return;
      }
      if (nextLang === currentLang) {
        return;
      }
      currentLang = nextLang;
      applyLanguage();
      recalculate();
    });
  });

  applyLanguage();
  recalculate();
})();
