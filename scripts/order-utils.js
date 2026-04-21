(() => {
const app = window.PirApp ??= {};

function buildCategoryMap(dishes) {
  return app.CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = dishes
      .filter((dish) => dish.category === category)
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));
    return acc;
  }, {});
}

function buildSelectionFromKeywords(keywords, dishesByCategory) {
  return app.CATEGORY_ORDER.reduce((acc, category) => {
    const keyword = keywords?.[category];
    acc[category] = keyword ? dishesByCategory[category].find((dish) => dish.keyword === keyword) ?? null : null;
    return acc;
  }, {});
}

function selectionToStoredKeywords(selection) {
  return app.CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = selection[category]?.keyword ?? "";
    return acc;
  }, {});
}

function calculateTotal(selection) {
  return app.CATEGORY_ORDER.reduce((total, category) => total + (selection[category]?.price ?? 0), 0);
}

function renderSummaryRows(selection) {
  return app.CATEGORY_ORDER.map((category) => {
    const item = selection[category];
    const config = app.summaryConfig[category];

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

function validateSelection(selection) {
  const selectedCategories = app.CATEGORY_ORDER.filter((category) => category !== "dessert" && selection[category]).sort();

  if (selectedCategories.length === 0) {
    return {
      valid: false,
      message: "Ничего не выбрано. Выберите блюда для заказа"
    };
  }

  const isValidCombo = app.comboVariants.some((variant) => hasSameCategories(variant, selectedCategories));

  if (isValidCombo) {
    return {
      valid: true,
      message: ""
    };
  }

  const possibleCombos = app.comboVariants
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

function getSelectedDishes(selection) {
  return app.CATEGORY_ORDER.filter((category) => Boolean(selection[category])).map((category) => selection[category]);
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

  return `Добавьте ${translated.slice(0, -1).join(", ")} и ${translated[translated.length - 1]}, чтобы собрать допустимое комбо`;
}

app.buildCategoryMap = buildCategoryMap;
app.buildSelectionFromKeywords = buildSelectionFromKeywords;
app.selectionToStoredKeywords = selectionToStoredKeywords;
app.calculateTotal = calculateTotal;
app.renderSummaryRows = renderSummaryRows;
app.validateSelection = validateSelection;
app.getSelectedDishes = getSelectedDishes;
})();
