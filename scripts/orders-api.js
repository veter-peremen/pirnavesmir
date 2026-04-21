(() => {
const app = window.PirApp ??= {};

async function createOrder(payload) {
  if (!app.appConfig.apiKey) {
    return {
      source: "mock",
      order: app.createMockOrder(payload)
    };
  }

  const response = await fetch(`${app.appConfig.ordersApiUrl}?api_key=${encodeURIComponent(app.appConfig.apiKey)}`, {
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

async function loadOrders() {
  if (!app.appConfig.apiKey) {
    return {
      source: "mock",
      orders: app.loadMockOrders()
    };
  }

  const response = await fetch(`${app.appConfig.ordersApiUrl}?api_key=${encodeURIComponent(app.appConfig.apiKey)}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return {
    source: "remote",
    orders: await response.json()
  };
}

async function updateOrder(id, patch) {
  if (!app.appConfig.apiKey) {
    return {
      source: "mock",
      order: app.updateMockOrder(id, patch)
    };
  }

  const response = await fetch(`${app.appConfig.ordersApiUrl}/${id}?api_key=${encodeURIComponent(app.appConfig.apiKey)}`, {
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

async function deleteOrder(id) {
  if (!app.appConfig.apiKey) {
    app.deleteMockOrder(id);
    return {
      source: "mock"
    };
  }

  const response = await fetch(`${app.appConfig.ordersApiUrl}/${id}?api_key=${encodeURIComponent(app.appConfig.apiKey)}`, {
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

app.createOrder = createOrder;
app.loadOrders = loadOrders;
app.updateOrder = updateOrder;
app.deleteOrder = deleteOrder;
})();
