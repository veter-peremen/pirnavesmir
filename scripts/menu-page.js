import { loadDishes } from "./api.js";
import { CATEGORY_ORDER, filterConfig } from "./catalog-config.js";
import { buildCategoryMap, buildSelectionFromKeywords, calculateTotal, renderSummaryRows, selectionToStoredKeywords, validateSelection } from "./order-utils.js";
import { loadStoredKeywords, saveStoredKeywords } from "./selection-storage.js";

let dishesByCategory = {};
let selection = {};

const activeFilters = {
  soup: null,
  "main-course": null,
  salad: null,
  drink: null,
  dessert: null
};

document.addEventListener("DOMContentLoaded", async () => {
  await initializeDishes();
  renderAllFilters();
  renderAllCategories();
  bindInteractions();
  applyDemoPreset();
  updateCheckoutPanel();
});

async function initializeDishes() {
  const result = await loadDishes();
  dishesByCategory = buildCategoryMap(result.dishes);
  selection = buildSelectionFromKeywords(loadStoredKeywords(), dishesByCategory);

  const statusNode = document.querySelector("#menu-data-status");

  if (statusNode) {
    statusNode.textContent = result.source === "remote"
      ? "Меню загружено с учебного API."
      : "Сервер меню недоступен. Показан локальный резервный набор блюд.";
    statusNode.classList.toggle("menu-data-status--fallback", result.source !== "remote");
  }
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
        (dish) => {
          const isSelected = selection[category]?.keyword === dish.keyword;

          return `
          <div class="dish-card ${isSelected ? "dish-card--selected" : ""}" data-dish="${dish.keyword}" data-category="${dish.category}">
            <img src="${dish.image}" alt="${dish.name}" class="dish-card__image">
            <p class="dish-card__price">${dish.price} ₽</p>
            <p class="dish-card__name">${dish.name}</p>
            <p class="dish-card__meta">${dish.count}</p>
            <button class="dish-card__button" type="button">${isSelected ? "Выбрано" : "Добавить"}</button>
          </div>
        `;
        }
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
      saveStoredKeywords(selectionToStoredKeywords(selection));
      renderAllCategories();
      updateCheckoutPanel();
      return;
    }

    const filterButton = event.target.closest(".filter-bar__button");

    if (filterButton) {
      const category = filterButton.dataset.filterCategory;
      const kind = filterButton.dataset.kind;
      activeFilters[category] = activeFilters[category] === kind ? null : kind;
      renderAllFilters();
      renderAllCategories();
      return;
    }

    const checkoutLink = event.target.closest("#checkout-link");

    if (!checkoutLink || !checkoutLink.classList.contains("checkout-panel__link--disabled")) {
      return;
    }

    event.preventDefault();
    showNotice(validateSelection(selection).message);
  });
}

function updateCheckoutPanel() {
  const panel = document.querySelector("#checkout-panel");
  const summaryNode = document.querySelector("#checkout-panel-summary");
  const totalNode = document.querySelector("#checkout-panel-total");
  const link = document.querySelector("#checkout-link");
  const helper = document.querySelector("#checkout-panel-helper");
  const hasSelection = CATEGORY_ORDER.some((category) => Boolean(selection[category]));

  panel?.classList.toggle("is-hidden", !hasSelection);
  if (summaryNode) {
    summaryNode.innerHTML = renderSummaryRows(selection);
  }

  if (!hasSelection || !totalNode || !link || !helper) {
    return;
  }

  totalNode.textContent = `${calculateTotal(selection)} ₽`;

  const validation = validateSelection(selection);
  const isEnabled = validation.valid;

  link.classList.toggle("checkout-panel__link--disabled", !isEnabled);
  link.setAttribute("aria-disabled", String(!isEnabled));
  helper.textContent = isEnabled
    ? "Состав заказа подходит под одно из доступных комбо."
    : validation.message;
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
  saveStoredKeywords(selectionToStoredKeywords(selection));
  renderAllCategories();
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
