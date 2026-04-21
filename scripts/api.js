(() => {
const app = window.PirApp ??= {};
const DISHES_API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";

async function loadDishes() {
  try {
    const response = await fetch(DISHES_API_URL, { method: "GET" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      dishes: data,
      source: "remote"
    };
  } catch (error) {
    return {
      dishes: app.fallbackDishes,
      source: "fallback",
      error
    };
  }
}

app.loadDishes = loadDishes;
})();
