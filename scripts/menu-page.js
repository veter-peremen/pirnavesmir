import { loadDishes } from "./api.js";

const CATEGORY_ORDER = ["soup", "main-course", "salad", "drink", "dessert"];

const filterConfig = {
  soup: [
    { kind: "fish", label: "рыбный" },
    { kind: "meat", label: "мясной" },
    { kind: "veg", label: "вегетарианский" }
  ],
  "main-course": [
    { kind: "fish", label: "рыбное" },
    { kind: "meat", label: "мясное" },
    { kind: "veg", label: "вегетарианское" }
  ],
  salad: [
    { kind: "fish", label: "рыбный" },
    { kind: "meat", label: "мясной" },
    { kind: "veg", label: "вегетарианский" }
  ],
  drink: [
    { kind: "cold", label: "холодный" },
    { kind: "hot", label: "горячий" }
  ],
  dessert: [
    { kind: "small", label: "маленькая порция" },
    { kind: "medium", label: "средняя порция" },
    { kind: "large", label: "большая порция" }
  ]
};

const summaryConfig = {
  soup: {
    title: "Суп",
    empty: "Суп не выбран"
  },
  "main-course": {
    title: "Главное блюдо",
    empty: "Блюдо не выбрано"
  },
  salad: {
    title: "Салат или стартер",
    empty: "Блюдо не выбрано"
  },
  drink: {
    title: "Напиток",
    empty: "Напиток не выбран"
  },
  dessert: {
    title: "Десерт",
    empty: "Десерт не выбран"
  }
};

const selection = {
  soup: null,
  "main-course": null,
  salad: null,
  drink: null,
  dessert: null
};

const activeFilters = {
  soup: null,
  "main-course": null,
  salad: null,
  drink: null,
  dessert: null
};

const comboVariants = [
  ["soup", "main-course", "salad", "drink"],
  ["soup", "main-course", "drink"],
  ["soup", "salad", "drink"],
  ["main-course", "salad", "drink"],
  ["main-course", "drink"]
];

let dishesByCategory = {};

document.addEventListener("DOMContentLoaded", async () => {
  await initializeDishes();
  renderAllFilters();
  renderAllCategories();
  bindInteractions();
  bindFormReset();
  bindFormValidation();
  applyDemoPreset();
  updateSummary();
});

async function initializeDishes() {
  const result = await loadDishes();

  dishesByCategory = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = result.dishes
      .filter((dish) => dish.category === category)
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));
    return acc;
  }, {});

  const statusNode = document.querySelector("#menu-data-status");

  if (!statusNode) {
    return;
  }

  statusNode.textContent = result.source === "remote"
    ? "Меню загружено с учебного API."
    : "Сервер меню недоступен. Показан локальный резервный набор блюд.";
  statusNode.classList.toggle("menu-data-status--fallback", result.source !== "remote");
}

function renderAllFilters() {
  CATEGORY_ORDER.forEach((category) => {
    const container = document.querySelector(`.filter-bar[data-category="${category}"]`);

    if (!container) {
      return;
    }

    container.innerHTML = filterConfig[category]
      .map(
        (filter) => `
          <button
            class="filter-bar__button ${activeFilters[category] === filter.kind ? "active" : ""}"
            type="button"
            data-kind="${filter.kind}"
            data-filter-category="${category}"
          >
            ${filter.label}
          </button>
        `
      )
      .join("");
  });
}

function renderAllCategories() {
  CATEGORY_ORDER.forEach((category) => {
    const container = document.querySelector(`.dish-grid[data-category="${category}"]`);

    if (!container) {
      return;
    }

    const filterKind = activeFilters[category];
    const visibleDishes = dishesByCategory[category].filter((dish) => !filterKind || dish.kind === filterKind);

    container.innerHTML = visibleDishes
      .map(
        (dish) => `
          <div class="dish-card ${selection[category]?.keyword === dish.keyword ? "dish-card--selected" : ""}" data-dish="${dish.keyword}" data-category="${dish.category}">
            <img src="${dish.image}" alt="${dish.name}" class="dish-card__image">
            <p class="dish-card__price">${dish.price} ₽</p>
            <p class="dish-card__name">${dish.name}</p>
            <p class="dish-card__meta">${dish.count}</p>
            <button class="dish-card__button" type="button">Добавить</button>
          </div>
        `
      )
      .join("");
  });
}

function bindInteractions() {
  document.addEventListener("click", (event) => {
    const cardButton = event.target.closest(".dish-card__button");

    if (cardButton) {
      const card = cardButton.closest(".dish-card");

      if (!card) {
        return;
      }

      const keyword = card.dataset.dish;
      const category = card.dataset.category;
      const dish = dishesByCategory[category].find((item) => item.keyword === keyword);

      if (!dish) {
        return;
      }

      selection[category] = dish;
      renderAllCategories();
      updateSummary();
      return;
    }

    const filterButton = event.target.closest(".filter-bar__button");

    if (!filterButton) {
      return;
    }

    const category = filterButton.dataset.filterCategory;
    const kind = filterButton.dataset.kind;
    activeFilters[category] = activeFilters[category] === kind ? null : kind;
    renderAllFilters();
    renderAllCategories();
  });
}

function updateSummary() {
  const summaryNode = document.querySelector("#order-summary");
  const totalNode = document.querySelector("#order-total");
  const totalValueNode = document.querySelector("#order-total-value");
  const hasSelection = CATEGORY_ORDER.some((category) => Boolean(selection[category]));

  summaryNode.innerHTML = hasSelection ? renderSummaryRows() : `<p class="order-summary__empty">Ничего не выбрано</p>`;
  totalNode.classList.toggle("is-hidden", !hasSelection);
  totalValueNode.textContent = `${getTotal()} ₽`;

  CATEGORY_ORDER.forEach((category) => {
    const field = document.querySelector(`#order-field-${category}`);

    if (field) {
      field.value = selection[category]?.keyword ?? "";
    }
  });
}

function renderSummaryRows() {
  return CATEGORY_ORDER.map((category) => {
    const item = selection[category];
    const config = summaryConfig[category];

    if (!item) {
      return `
        <div class="order-summary__row">
          <span class="order-summary__label">${config.title}</span>
          <div class="order-summary__value">
            <strong>${config.empty}</strong>
          </div>
        </div>
      `;
    }

    return `
      <div class="order-summary__row">
        <span class="order-summary__label">${config.title}</span>
        <div class="order-summary__value">
          <strong>${item.name}</strong>
          <span>${item.price} ₽</span>
        </div>
      </div>
    `;
  }).join("");
}

function getTotal() {
  return CATEGORY_ORDER.reduce((total, category) => total + (selection[category]?.price ?? 0), 0);
}

function bindFormReset() {
  const form = document.querySelector("#lunch-order-form");

  if (!form) {
    return;
  }

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      CATEGORY_ORDER.forEach((category) => {
        selection[category] = null;
        activeFilters[category] = null;
      });

      renderAllFilters();
      renderAllCategories();
      updateSummary();
    }, 0);
  });
}

function bindFormValidation() {
  const form = document.querySelector("#lunch-order-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    const validation = validateSelection();

    if (validation.valid) {
      return;
    }

    event.preventDefault();
    showNotice(validation.message);
  });
}

function validateSelection() {
  const selectedCategories = CATEGORY_ORDER.filter((category) => category !== "dessert" && selection[category]).sort();

  if (selectedCategories.length === 0) {
    return {
      valid: false,
      message: "Ничего не выбрано. Выберите блюда для заказа"
    };
  }

  const isValidCombo = comboVariants.some((variant) => hasSameCategories(variant, selectedCategories));

  if (isValidCombo) {
    return {
      valid: true,
      message: ""
    };
  }

  const possibleCombos = comboVariants
    .filter((variant) => selectedCategories.every((category) => variant.includes(category)))
    .sort((a, b) => a.length - b.length);

  const closestCombo = possibleCombos[0];

  if (!closestCombo) {
    return {
      valid: false,
      message: "Состав заказа не подходит под доступные комбо. Измените набор блюд"
    };
  }

  const missingCategories = closestCombo.filter((category) => !selectedCategories.includes(category));

  return {
    valid: false,
    message: formatMissingMessage(missingCategories)
  };
}

function hasSameCategories(combo, selectedCategories) {
  return combo.length === selectedCategories.length && combo.every((category) => selectedCategories.includes(category));
}

function formatMissingMessage(missingCategories) {
  const labels = {
    soup: "суп",
    "main-course": "главное блюдо",
    salad: "салат или стартер",
    drink: "напиток"
  };

  const translated = missingCategories.map((category) => labels[category]);

  if (translated.length === 1) {
    return `Добавьте ${translated[0]}, чтобы оформить заказ`;
  }

  if (translated.length === 2) {
    return `Добавьте ${translated[0]} и ${translated[1]}, чтобы собрать допустимое комбо`;
  }

  return `Добавьте ${translated.slice(0, -1).join(", ")} и ${translated.at(-1)}, чтобы собрать допустимое комбо`;
}

function showNotice(message) {
  const layer = document.querySelector("#notice-layer");

  if (!layer) {
    return;
  }

  layer.innerHTML = `
    <div class="notice-card" role="dialog" aria-modal="true">
      <p class="notice-card__text">${message}</p>
      <button class="notice-card__button" type="button">Окей</button>
    </div>
  `;
  layer.classList.add("notice-layer--visible");

  const closeButton = layer.querySelector(".notice-card__button");
  closeButton?.addEventListener("click", () => {
    layer.classList.remove("notice-layer--visible");
    layer.innerHTML = "";
  }, { once: true });
}

function applyDemoPreset() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("demo") === "notice") {
    showNotice("Ничего не выбрано. Выберите блюда для заказа");
    return;
  }

  if (params.get("demo") !== "selected") {
    return;
  }

  CATEGORY_ORDER.forEach((category) => {
    selection[category] = dishesByCategory[category][0] ?? null;
  });
  renderAllCategories();
}
