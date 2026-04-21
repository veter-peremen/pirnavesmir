import { loadDishes } from "./api.js";
import { CATEGORY_ORDER } from "./catalog-config.js";
import { createOrder } from "./orders-api.js";
import { buildCategoryMap, buildSelectionFromKeywords, calculateTotal, getSelectedDishes, renderSummaryRows, selectionToStoredKeywords, validateSelection } from "./order-utils.js";
import { clearStoredKeywords, loadStoredKeywords, saveStoredKeywords } from "./selection-storage.js";

let dishesByCategory = {};
let selection = {};

document.addEventListener("DOMContentLoaded", async () => {
  await initializeCheckout();
  bindInteractions();
  applyDemoPreset();
  renderCheckout();
});

async function initializeCheckout() {
  const result = await loadDishes();
  dishesByCategory = buildCategoryMap(result.dishes);
  selection = buildSelectionFromKeywords(loadStoredKeywords(), dishesByCategory);

  const statusNode = document.querySelector("#checkout-data-status");

  if (statusNode) {
    statusNode.textContent = result.source === "remote"
      ? "Позиции заказа сверены с учебным API."
      : "Сервер блюд недоступен. Показан локальный резервный набор.";
    statusNode.classList.toggle("menu-data-status--fallback", result.source !== "remote");
  }
}

function bindInteractions() {
  document.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".checkout-remove");

    if (removeButton) {
      const category = removeButton.dataset.category;
      selection[category] = null;
      saveStoredKeywords(selectionToStoredKeywords(selection));
      renderCheckout();
      return;
    }

    const closeButton = event.target.closest(".notice-card__button");

    if (!closeButton) {
      return;
    }

    const layer = document.querySelector("#notice-layer");
    layer?.classList.remove("notice-layer--visible");
    if (layer) {
      layer.innerHTML = "";
    }

    if (closeButton.dataset.redirect === "orders") {
      window.location.href = "order.html";
    }
  });

  const form = document.querySelector("#checkout-form");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const validation = validateSelection(selection);

    if (!validation.valid) {
      showNotice(validation.message);
      return;
    }

    const formData = new FormData(form);
    const payload = {
      full_name: String(formData.get("full_name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      delivery_address: String(formData.get("delivery_address") ?? ""),
      delivery_type: String(formData.get("delivery_type") ?? "asap"),
      delivery_time: String(formData.get("delivery_time") ?? ""),
      comment: String(formData.get("comment") ?? ""),
      subscribe: formData.get("subscribe") === "yes",
      total: calculateTotal(selection),
      selection: structuredClone(selection)
    };

    try {
      const result = await createOrder(payload);
      clearStoredKeywords();
      selection = CATEGORY_ORDER.reduce((acc, category) => {
        acc[category] = null;
        return acc;
      }, {});
      renderCheckout();
      form.reset();
      showNotice(
        result.source === "remote"
          ? "Заказ успешно отправлен на сервер. Его можно посмотреть в истории заказов."
          : "API key не настроен, поэтому заказ сохранён локально. Его можно посмотреть в истории заказов.",
        { redirect: "orders" }
      );
    } catch (error) {
      showNotice(`Не удалось оформить заказ: ${error.message}`);
    }
  });
}

function renderCheckout() {
  renderSelectedDishes();
  renderSummary();
}

function renderSelectedDishes() {
  const grid = document.querySelector("#checkout-dish-grid");
  const empty = document.querySelector("#checkout-empty");
  const selectedDishes = getSelectedDishes(selection);

  if (!grid || !empty) {
    return;
  }

  empty.classList.toggle("is-hidden", selectedDishes.length > 0);
  grid.innerHTML = selectedDishes
    .map(
      (dish) => `
        <div class="dish-card checkout-dish-card" data-dish="${dish.keyword}">
          <img src="${dish.image}" alt="${dish.name}" class="dish-card__image">
          <p class="dish-card__price">${dish.price} ₽</p>
          <p class="dish-card__name">${dish.name}</p>
          <p class="dish-card__meta">${dish.count}</p>
          <button class="dish-card__button checkout-remove" data-category="${dish.category}" type="button">Удалить</button>
        </div>
      `
    )
    .join("");
}

function renderSummary() {
  const summary = document.querySelector("#checkout-summary");
  const total = document.querySelector("#checkout-total-value");

  if (!summary || !total) {
    return;
  }

  summary.innerHTML = renderSummaryRows(selection);
  total.textContent = `${calculateTotal(selection)} ₽`;
}

function applyDemoPreset() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("demo") !== "selected") {
    return;
  }

  CATEGORY_ORDER.forEach((category) => {
    selection[category] = dishesByCategory[category][0] ?? null;
  });
  saveStoredKeywords(selectionToStoredKeywords(selection));
}

function showNotice(message, options = {}) {
  const layer = document.querySelector("#notice-layer");

  if (!layer) {
    return;
  }

  layer.innerHTML = `
    <div class="notice-card" role="dialog" aria-modal="true">
      <p class="notice-card__text">${message}</p>
      <button class="notice-card__button" type="button" data-redirect="${options.redirect ?? ""}">Окей</button>
    </div>
  `;
  layer.classList.add("notice-layer--visible");
}
