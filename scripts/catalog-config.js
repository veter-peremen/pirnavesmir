export const CATEGORY_ORDER = ["soup", "main-course", "salad", "drink", "dessert"];

export const filterConfig = {
  soup: [
    { kind: "fish", label: "рыбный" },
    { kind: "meat", label: "мясной" },
    { kind: "veg", label: "вегетарианский" }
  ],
  "main-course": [
    { kind: "fish", label: "рыбное" },
    { kind: "meat", label: "мясное" },
    { kind: "veg", label: "вегетарианское" }
  ],
  salad: [
    { kind: "fish", label: "рыбный" },
    { kind: "meat", label: "мясной" },
    { kind: "veg", label: "вегетарианский" }
  ],
  drink: [
    { kind: "cold", label: "холодный" },
    { kind: "hot", label: "горячий" }
  ],
  dessert: [
    { kind: "small", label: "маленькая порция" },
    { kind: "medium", label: "средняя порция" },
    { kind: "large", label: "большая порция" }
  ]
};

export const summaryConfig = {
  soup: {
    title: "Суп",
    empty: "Суп не выбран"
  },
  "main-course": {
    title: "Главное блюдо",
    empty: "Не выбрано"
  },
  salad: {
    title: "Салат или стартер",
    empty: "Не выбрано"
  },
  drink: {
    title: "Напиток",
    empty: "Напиток не выбран"
  },
  dessert: {
    title: "Десерт",
    empty: "Десерт не выбран"
  }
};

export const comboVariants = [
  ["soup", "main-course", "salad", "drink"],
  ["soup", "main-course", "drink"],
  ["soup", "salad", "drink"],
  ["main-course", "salad", "drink"],
  ["main-course", "drink"]
];
