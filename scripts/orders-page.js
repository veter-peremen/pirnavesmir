const app = window.PirApp ??= {};

let dishesByCategory = {};
let orders = [];
let ordersSource = "mock";

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();
  bindInteractions();
  renderOrders();
});

async function initializePage() {
  try {
    const [dishesResult, ordersResult] = await Promise.all([app.loadDishes(), app.loadOrders()]);
    dishesByCategory = app.buildCategoryMap(dishesResult.dishes);
    ordersSource = ordersResult.source;
    orders = ordersResult.orders
      .map((order) => normalizeOrder(order))
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());

    const statusNode = document.querySelector("#orders-data-status");

    if (!statusNode) {
      return;
    }

    const ordersText = ordersSource === "remote"
      ? "История заказов загружена с сервера."
      : "Персональный api_key не задан, поэтому показаны локально сохраненные заказы.";

    statusNode.textContent = dishesResult.source === "remote"
      ? ordersText
      : `${ordersText} Названия блюд сверены с локальным резервным меню.`;

    statusNode.classList.toggle("menu-data-status--fallback", dishesResult.source !== "remote" || ordersSource !== "remote");
  } catch (error) {
    orders = [];
    dishesByCategory = {};
    ordersSource = "fallback";
    updateStatusText(`Не удалось загрузить историю заказов: ${error.message}`);
    document.querySelector("#orders-data-status")?.classList.add("menu-data-status--fallback");
  }
}

function bindInteractions() {
  document.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-order-action]");

    if (actionButton) {
      const orderId = actionButton.dataset.orderId;
      const order = orders.find((item) => String(item.id) === String(orderId));

      if (!order) {
        return;
      }

      if (actionButton.dataset.orderAction === "details") {
        openDetailsModal(order);
        return;
      }

      if (actionButton.dataset.orderAction === "edit") {
        openEditModal(order);
        return;
      }

      if (actionButton.dataset.orderAction === "delete") {
        openDeleteModal(order);
      }
    }

    if (event.target.id === "modal-layer") {
      closeModal();
      return;
    }

    if (event.target.closest("[data-modal-close]")) {
      closeModal();
      return;
    }

    const confirmDelete = event.target.closest("[data-confirm-delete]");

    if (!confirmDelete) {
      return;
    }

    const orderId = confirmDelete.dataset.confirmDelete;

    try {
      await app.deleteOrder(orderId);
      orders = orders.filter((item) => String(item.id) !== String(orderId));
      closeModal();
      updateStatusText("Заказ удален из истории.");
      renderOrders();
    } catch (error) {
      updateStatusText(`Не удалось удалить заказ: ${error.message}`);
    }
  });

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest("#order-edit-form");

    if (!form) {
      return;
    }

    event.preventDefault();

    const orderId = form.dataset.orderId;
    const formData = new FormData(form);
    const patch = {
      full_name: String(formData.get("full_name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      delivery_address: String(formData.get("delivery_address") ?? ""),
      delivery_type: String(formData.get("delivery_type") ?? "asap"),
      delivery_time: String(formData.get("delivery_time") ?? ""),
      comment: String(formData.get("comment") ?? "")
    };

    try {
      const result = await app.updateOrder(orderId, patch);
      orders = orders.map((order) => {
        if (String(order.id) !== String(orderId)) {
          return order;
        }

        return normalizeOrder({ ...order, ...(result.order ?? {}), ...patch });
      });
      closeModal();
      updateStatusText(
        result.source === "remote"
          ? "Данные заказа обновлены на сервере."
          : "Данные заказа обновлены в локальной истории."
      );
      renderOrders();
    } catch (error) {
      updateStatusText(`Не удалось обновить заказ: ${error.message}`);
    }
  });
}

function renderOrders() {
  const emptyNode = document.querySelector("#orders-empty");
  const listNode = document.querySelector("#orders-list");

  if (!emptyNode || !listNode) {
    return;
  }

  emptyNode.classList.toggle("is-hidden", orders.length > 0);
  listNode.innerHTML = orders
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-card__top">
            <div>
              <p class="order-card__eyebrow">Заказ № ${escapeHtml(formatOrderId(order.id))}</p>
              <h2 class="order-card__title">${escapeHtml(order.full_name || "Без имени")}</h2>
            </div>
            <div class="order-card__total">
              <strong>${escapeHtml(`${order.total} ₽`)}</strong>
              <span class="order-card__date">${escapeHtml(formatDate(order.created_at))}</span>
            </div>
          </div>

          <div class="order-card__meta">
            <p><strong>Доставка:</strong> ${escapeHtml(formatDelivery(order))}</p>
            <p><strong>Адрес:</strong> ${escapeHtml(order.delivery_address || "Не указан")}</p>
            <p><strong>Телефон:</strong> ${escapeHtml(order.phone || "Не указан")}</p>
          </div>

          <ul class="order-card__dishes">
            ${renderDishTags(order)}
          </ul>

          <div class="order-card__actions">
            <button class="order-card__button" type="button" data-order-action="details" data-order-id="${escapeHtml(String(order.id))}">Подробнее</button>
            <button class="order-card__button" type="button" data-order-action="edit" data-order-id="${escapeHtml(String(order.id))}">Редактировать</button>
            <button class="order-card__button order-card__button--danger" type="button" data-order-action="delete" data-order-id="${escapeHtml(String(order.id))}">Удалить</button>
          </div>
        </article>
      `
    )
    .join("");
}

function openDetailsModal(order) {
  openModal(`
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="details-title">
      <div class="modal-card__header">
        <div>
          <p class="order-card__eyebrow">Детали заказа</p>
          <h2 class="modal-card__title" id="details-title">Заказ № ${escapeHtml(formatOrderId(order.id))}</h2>
        </div>
        <button class="modal-card__close" type="button" data-modal-close aria-label="Закрыть">×</button>
      </div>
      <p class="modal-card__lead">Состав заказа, данные получателя и параметры доставки.</p>
      <div class="modal-details">
        <div class="modal-details__row">
          <span class="modal-details__label">Дата оформления</span>
          <p class="modal-details__value">${escapeHtml(formatDate(order.created_at))}</p>
        </div>
        <div class="modal-details__row">
          <span class="modal-details__label">Состав заказа</span>
          <ul class="modal-dishes">${renderDishItems(order)}</ul>
        </div>
        <div class="modal-details__row">
          <span class="modal-details__label">Стоимость</span>
          <p class="modal-details__value">${escapeHtml(`${order.total} ₽`)}</p>
        </div>
        <div class="modal-details__row">
          <span class="modal-details__label">Доставка</span>
          <p class="modal-details__value">${escapeHtml(formatDelivery(order))}</p>
        </div>
        <div class="modal-details__row">
          <span class="modal-details__label">Адрес</span>
          <p class="modal-details__value">${escapeHtml(order.delivery_address || "Не указан")}</p>
        </div>
        <div class="modal-details__row">
          <span class="modal-details__label">Комментарий</span>
          <p class="modal-details__value">${escapeHtml(order.comment || "Без комментария")}</p>
        </div>
      </div>
    </div>
  `);
}

function openEditModal(order) {
  openModal(`
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <div class="modal-card__header">
        <div>
          <p class="order-card__eyebrow">Редактирование</p>
          <h2 class="modal-card__title" id="edit-title">Изменить заказ № ${escapeHtml(formatOrderId(order.id))}</h2>
        </div>
        <button class="modal-card__close" type="button" data-modal-close aria-label="Закрыть">×</button>
      </div>
      <p class="modal-card__lead">Доступно редактирование контактных данных, адреса и параметров доставки.</p>
      <form class="order-form" id="order-edit-form" data-order-id="${escapeHtml(String(order.id))}">
        <div class="order-form__group">
          <div class="order-form__panel">
            <label class="field">
              <span class="field__label">Имя</span>
              <input class="field__control" type="text" name="full_name" value="${escapeHtml(order.full_name)}" required>
            </label>

            <label class="field">
              <span class="field__label">Email</span>
              <input class="field__control" type="email" name="email" value="${escapeHtml(order.email)}" required>
            </label>

            <label class="field">
              <span class="field__label">Номер телефона</span>
              <input class="field__control" type="tel" name="phone" value="${escapeHtml(order.phone)}" required>
            </label>

            <label class="field">
              <span class="field__label">Адрес доставки</span>
              <input class="field__control" type="text" name="delivery_address" value="${escapeHtml(order.delivery_address)}" required>
            </label>
          </div>

          <div class="order-form__panel">
            <fieldset class="field field--radio">
              <legend class="field__label">Время доставки</legend>
              <label class="field__choice">
                <input type="radio" name="delivery_type" value="asap" ${order.delivery_type !== "time" ? "checked" : ""}>
                <span>Как можно скорее</span>
              </label>
              <label class="field__choice">
                <input type="radio" name="delivery_type" value="time" ${order.delivery_type === "time" ? "checked" : ""}>
                <span>К указанному времени</span>
              </label>
            </fieldset>

            <label class="field">
              <span class="field__label">Укажите время доставки</span>
              <input class="field__control" type="time" name="delivery_time" value="${escapeHtml(order.delivery_time)}">
            </label>

            <label class="field">
              <span class="field__label">Комментарий</span>
              <textarea class="field__control field__control--textarea" name="comment">${escapeHtml(order.comment)}</textarea>
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="order-form__button order-form__button--ghost" type="button" data-modal-close>Отмена</button>
          <button class="order-form__button" type="submit">Сохранить</button>
        </div>
      </form>
    </div>
  `);
}

function openDeleteModal(order) {
  openModal(`
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <div class="modal-card__header">
        <div>
          <p class="order-card__eyebrow">Удаление</p>
          <h2 class="modal-card__title" id="delete-title">Удалить заказ № ${escapeHtml(formatOrderId(order.id))}</h2>
        </div>
        <button class="modal-card__close" type="button" data-modal-close aria-label="Закрыть">×</button>
      </div>
      <p class="modal-card__lead">
        Заказ ${escapeHtml(order.full_name || formatOrderId(order.id))} будет удален из истории без возможности восстановления.
      </p>
      <div class="modal-actions">
        <button class="order-form__button order-form__button--ghost" type="button" data-modal-close>Отмена</button>
        <button class="order-form__button" type="button" data-confirm-delete="${escapeHtml(String(order.id))}">Удалить заказ</button>
      </div>
    </div>
  `);
}

function openModal(content) {
  const layer = document.querySelector("#modal-layer");

  if (!layer) {
    return;
  }

  layer.innerHTML = content;
  layer.classList.add("modal-layer--visible");
}

function closeModal() {
  const layer = document.querySelector("#modal-layer");

  if (!layer) {
    return;
  }

  layer.classList.remove("modal-layer--visible");
  layer.innerHTML = "";
}

function normalizeOrder(order) {
  const selection = app.CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = resolveDish(order, category);
    return acc;
  }, {});

  return {
    ...order,
    id: order.id ?? order.order_id ?? `${Date.now()}`,
    created_at: order.created_at ?? order.createdAt ?? new Date().toISOString(),
    full_name: order.full_name ?? order.fullName ?? "",
    email: order.email ?? "",
    phone: order.phone ?? "",
    delivery_address: order.delivery_address ?? order.deliveryAddress ?? "",
    delivery_type: order.delivery_type ?? order.deliveryType ?? "asap",
    delivery_time: order.delivery_time ?? order.deliveryTime ?? "",
    comment: order.comment ?? "",
    total: Number(order.total) || app.calculateTotal(selection),
    selection
  };
}

function resolveDish(order, category) {
  const selectionValue = order.selection?.[category];

  if (selectionValue?.keyword) {
    return selectionValue;
  }

  const keyword = typeof selectionValue === "string" ? selectionValue : readOrderKeyword(order, category);

  if (!keyword) {
    return null;
  }

  const foundDish = dishesByCategory[category]?.find((dish) => dish.keyword === keyword);

  if (foundDish) {
    return foundDish;
  }

  return {
    keyword,
    name: formatKeyword(keyword),
    price: 0,
    category,
    count: ""
  };
}

function readOrderKeyword(order, category) {
  const keyMap = {
    soup: ["soup"],
    "main-course": ["main-course", "main_course", "mainCourse"],
    salad: ["salad"],
    drink: ["drink"],
    dessert: ["dessert"]
  };

  return keyMap[category].map((key) => order[key]).find(Boolean) ?? "";
}

function renderDishTags(order) {
  const dishes = app.getSelectedDishes(order.selection);

  if (dishes.length === 0) {
    return '<li class="order-card__dish">Состав заказа не указан</li>';
  }

  return dishes
    .map((dish) => `<li class="order-card__dish">${escapeHtml(dish.name)}</li>`)
    .join("");
}

function renderDishItems(order) {
  const dishes = app.getSelectedDishes(order.selection);

  if (dishes.length === 0) {
    return "<li>Состав заказа не указан</li>";
  }

  return dishes
    .map((dish) => `<li>${escapeHtml(dish.name)}${dish.price ? `, ${escapeHtml(`${dish.price} ₽`)}` : ""}</li>`)
    .join("");
}

function formatDelivery(order) {
  if (order.delivery_type === "time" && order.delivery_time) {
    return `к ${order.delivery_time}`;
  }

  return "как можно скорее";
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatOrderId(id) {
  return String(id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() || "00000000";
}

function formatKeyword(keyword) {
  const firstLetter = keyword.replace(/-/g, " ");
  return firstLetter.charAt(0).toUpperCase() + firstLetter.slice(1);
}

function updateStatusText(message) {
  const statusNode = document.querySelector("#orders-data-status");

  if (statusNode) {
    statusNode.textContent = message;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
