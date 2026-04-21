import { appConfig } from "./config.js";
import { createMockOrder, deleteMockOrder, loadMockOrders, updateMockOrder } from "./selection-storage.js";

export async function createOrder(payload) {
  if (!appConfig.apiKey) {
    return {
      source: "mock",
      order: createMockOrder(payload)
    };
  }

  const response = await fetch(`${appConfig.ordersApiUrl}?api_key=${encodeURIComponent(appConfig.apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(toRemotePayload(payload))
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return {
    source: "remote",
    order: await response.json()
  };
}

export async function loadOrders() {
  if (!appConfig.apiKey) {
    return {
      source: "mock",
      orders: loadMockOrders()
    };
  }

  const response = await fetch(`${appConfig.ordersApiUrl}?api_key=${encodeURIComponent(appConfig.apiKey)}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return {
    source: "remote",
    orders: await response.json()
  };
}

export async function updateOrder(id, patch) {
  if (!appConfig.apiKey) {
    return {
      source: "mock",
      order: updateMockOrder(id, patch)
    };
  }

  const response = await fetch(`${appConfig.ordersApiUrl}/${id}?api_key=${encodeURIComponent(appConfig.apiKey)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(patch)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return {
    source: "remote",
    order: await response.json()
  };
}

export async function deleteOrder(id) {
  if (!appConfig.apiKey) {
    deleteMockOrder(id);
    return {
      source: "mock"
    };
  }

  const response = await fetch(`${appConfig.ordersApiUrl}/${id}?api_key=${encodeURIComponent(appConfig.apiKey)}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return {
    source: "remote"
  };
}

function toRemotePayload(payload) {
  return {
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    delivery_address: payload.delivery_address,
    delivery_type: payload.delivery_type,
    delivery_time: payload.delivery_time,
    comment: payload.comment,
    subscribe: payload.subscribe,
    soup: payload.selection.soup?.keyword ?? "",
    main_course: payload.selection["main-course"]?.keyword ?? "",
    salad: payload.selection.salad?.keyword ?? "",
    drink: payload.selection.drink?.keyword ?? "",
    dessert: payload.selection.dessert?.keyword ?? ""
  };
}
