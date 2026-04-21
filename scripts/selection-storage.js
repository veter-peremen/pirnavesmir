(() => {
const app = window.PirApp ??= {};
const SELECTION_KEY = "pirnavesmir:selected-dishes";
const MOCK_ORDERS_KEY = "pirnavesmir:mock-orders";

function getDefaultKeywords() {
  return app.CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = "";
    return acc;
  }, {});
}

function loadStoredKeywords() {
  try {
    const raw = localStorage.getItem(SELECTION_KEY);

    if (!raw) {
      return getDefaultKeywords();
    }

    const parsed = JSON.parse(raw);
    return { ...getDefaultKeywords(), ...parsed };
  } catch {
    return getDefaultKeywords();
  }
}

function saveStoredKeywords(keywords) {
  localStorage.setItem(SELECTION_KEY, JSON.stringify({ ...getDefaultKeywords(), ...keywords }));
}

function clearStoredKeywords() {
  localStorage.removeItem(SELECTION_KEY);
}

function loadMockOrders() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_ORDERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveMockOrders(orders) {
  localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
}

function createMockOrder(payload) {
  const orders = loadMockOrders();
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
  const order = {
    id,
    created_at: new Date().toISOString(),
    ...payload
  };
  saveMockOrders([order, ...orders]);
  return order;
}

function updateMockOrder(id, patch) {
  const orders = loadMockOrders();
  const updatedOrders = orders.map((order) => (String(order.id) === String(id) ? { ...order, ...patch } : order));
  saveMockOrders(updatedOrders);
  return updatedOrders.find((order) => String(order.id) === String(id));
}

function deleteMockOrder(id) {
  const orders = loadMockOrders();
  saveMockOrders(orders.filter((order) => String(order.id) !== String(id)));
}

app.loadStoredKeywords = loadStoredKeywords;
app.saveStoredKeywords = saveStoredKeywords;
app.clearStoredKeywords = clearStoredKeywords;
app.loadMockOrders = loadMockOrders;
app.saveMockOrders = saveMockOrders;
app.createMockOrder = createMockOrder;
app.updateMockOrder = updateMockOrder;
app.deleteMockOrder = deleteMockOrder;
})();
