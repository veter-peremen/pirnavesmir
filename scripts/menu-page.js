import { localDishes } from "./data/local-dishes.js";

const CATEGORY_ORDER = ["soup", "main-course", "drink"];

const summaryConfig = {
  soup: {
    title: "Суп",
    empty: "Суп не выбран"
  },
  "main-course": {
    title: "Главное блюдо",
    empty: "Блюдо не выбрано"
  },
  drink: {
    title: "Напиток",
    empty: "Напиток не выбран"
  }
};

const selection = {
  soup: null,
  "main-course": null,
  drink: null
};

const dishesByCategory = CATEGORY_ORDER.reduce((acc, category) => {
  acc[category] = localDishes
    .filter((dish) => dish.category === category)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  return acc;
}, {});

document.addEventListener("DOMContentLoaded", () => {
  renderAllCategories();
  bindCardSelection();
  bindFormReset();
  applyDemoPreset();
  updateSummary();
});

function renderAllCategories() {
  CATEGORY_ORDER.forEach((category) => {
    const container = document.querySelector(`[data-category="${category}"]`);

    if (!container) {
      return;
    }

    container.innerHTML = dishesByCategory[category]
      .map(
        (dish) => `
          <div class="dish-card" data-dish="${dish.keyword}" data-category="${dish.category}">
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

function bindCardSelection() {
  document.querySelectorAll(".dish-card__button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const card = event.currentTarget.closest(".dish-card");

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
      updateHighlightedCards();
      updateSummary();
    });
  });
}

function updateHighlightedCards() {
  document.querySelectorAll(".dish-card").forEach((card) => {
    const { dish, category } = card.dataset;
    const selectedDish = selection[category];
    const isSelected = selectedDish?.keyword === dish;

    card.classList.toggle("dish-card--selected", isSelected);
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
      });

      updateHighlightedCards();
      updateSummary();
    }, 0);
  });
}

function applyDemoPreset() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("demo") !== "selected") {
    return;
  }

  CATEGORY_ORDER.forEach((category) => {
    selection[category] = dishesByCategory[category][0] ?? null;
  });

  updateHighlightedCards();
}
