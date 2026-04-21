import { CATEGORY_ORDER } from "./catalog-config.js";

const SELECTION_KEY = "pirnavesmir:selected-dishes";
const MOCK_ORDERS_KEY = "pirnavesmir:mock-orders";

function getDefaultKeywords() {
  return CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = "";
    return acc;
  }, {});
}

export function loadStoredKeywords() {
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

export function saveStoredKeywords(keywords) {
  localStorage.setItem(SELECTION_KEY, JSON.stringify({ ...getDefaultKeywords(), ...keywords }));
}

export function clearStoredKeywords() {
  localStorage.removeItem(SELECTION_KEY);
}

export function loadMockOrders() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_ORDERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveMockOrders(orders) {
  localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
}

export function createMockOrder(payload) {
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

export function updateMockOrder(id, patch) {
  const orders = loadMockOrders();
  const updatedOrders = orders.map((order) => (String(order.id) === String(id) ? { ...order, ...patch } : order));
  saveMockOrders(updatedOrders);
  return updatedOrders.find((order) => String(order.id) === String(id));
}

export function deleteMockOrder(id) {
  const orders = loadMockOrders();
  saveMockOrders(orders.filter((order) => String(order.id) !== String(id)));
}
