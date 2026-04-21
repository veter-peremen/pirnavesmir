(() => {
const app = window.PirApp ??= {};

app.fallbackDishes = [
  {
    keyword: "borscht",
    name: "Борщ с пампушками",
    price: 320,
    category: "soup",
    kind: "meat",
    count: "420 г",
    image: "assets/images/menu/borscht.svg"
  },
  {
    keyword: "solyanka",
    name: "Солянка мясная",
    price: 340,
    category: "soup",
    kind: "meat",
    count: "410 г",
    image: "assets/images/menu/borscht.svg"
  },
  {
    keyword: "ukha",
    name: "Уха с судаком и укропом",
    price: 340,
    category: "soup",
    kind: "fish",
    count: "390 г",
    image: "assets/images/menu/ukha.svg"
  },
  {
    keyword: "salmon-soup",
    name: "Рыбный суп с лососем",
    price: 360,
    category: "soup",
    kind: "fish",
    count: "380 г",
    image: "assets/images/menu/ukha.svg"
  },
  {
    keyword: "shchi",
    name: "Щи с белыми грибами",
    price: 290,
    category: "soup",
    kind: "veg",
    count: "400 г",
    image: "assets/images/menu/shchi.svg"
  },
  {
    keyword: "mushroom-stew",
    name: "Грибная похлёбка с перловкой",
    price: 280,
    category: "soup",
    kind: "veg",
    count: "390 г",
    image: "assets/images/menu/shchi.svg"
  },
  {
    keyword: "pozharsky",
    name: "Пожарская котлета с картофелем",
    price: 390,
    category: "main-course",
    kind: "meat",
    count: "310 г",
    image: "assets/images/menu/pozharsky.svg"
  },
  {
    keyword: "golubtsy",
    name: "Голубцы в сметанном соусе",
    price: 370,
    category: "main-course",
    kind: "meat",
    count: "320 г",
    image: "assets/images/menu/pozharsky.svg"
  },
  {
    keyword: "sudak",
    name: "Запечённый судак с овощами",
    price: 410,
    category: "main-course",
    kind: "fish",
    count: "290 г",
    image: "assets/images/menu/pozharsky.svg"
  },
  {
    keyword: "pike-cutlet",
    name: "Котлета из щуки с пюре",
    price: 360,
    category: "main-course",
    kind: "fish",
    count: "300 г",
    image: "assets/images/menu/pozharsky.svg"
  },
  {
    keyword: "vareniki",
    name: "Вареники с картофелем и грибами",
    price: 280,
    category: "main-course",
    kind: "veg",
    count: "280 г",
    image: "assets/images/menu/vareniki.svg"
  },
  {
    keyword: "draniki",
    name: "Драники со сметаной и луком",
    price: 310,
    category: "main-course",
    kind: "veg",
    count: "260 г",
    image: "assets/images/menu/draniki.svg"
  },
  {
    keyword: "vinegret",
    name: "Винегрет с квашеной капустой",
    price: 210,
    category: "salad",
    kind: "veg",
    count: "180 г",
    image: "assets/images/menu/vinegret.svg"
  },
  {
    keyword: "beetroot-walnut",
    name: "Свёкла с орехами и чесноком",
    price: 190,
    category: "salad",
    kind: "veg",
    count: "160 г",
    image: "assets/images/menu/vinegret.svg"
  },
  {
    keyword: "cucumber-salad",
    name: "Салат из огурцов со сметаной",
    price: 170,
    category: "salad",
    kind: "veg",
    count: "170 г",
    image: "assets/images/menu/cucumber-salad.svg"
  },
  {
    keyword: "mushroom-potatoes",
    name: "Картофель с грибами и укропом",
    price: 230,
    category: "salad",
    kind: "veg",
    count: "210 г",
    image: "assets/images/menu/cucumber-salad.svg"
  },
  {
    keyword: "smoked-chicken-salad",
    name: "Салат с копчёной курицей",
    price: 260,
    category: "salad",
    kind: "meat",
    count: "190 г",
    image: "assets/images/menu/herring-starter.svg"
  },
  {
    keyword: "herring-starter",
    name: "Закуска из сельди и картофеля",
    price: 240,
    category: "salad",
    kind: "fish",
    count: "185 г",
    image: "assets/images/menu/herring-starter.svg"
  },
  {
    keyword: "mors",
    name: "Клюквенный морс",
    price: 140,
    category: "drink",
    kind: "cold",
    count: "300 мл",
    image: "assets/images/menu/mors.svg"
  },
  {
    keyword: "kvass",
    name: "Домашний квас",
    price: 120,
    category: "drink",
    kind: "cold",
    count: "300 мл",
    image: "assets/images/menu/mors.svg"
  },
  {
    keyword: "kissel",
    name: "Облепиховый кисель",
    price: 150,
    category: "drink",
    kind: "cold",
    count: "280 мл",
    image: "assets/images/menu/kissel.svg"
  },
  {
    keyword: "vzvar",
    name: "Яблочный взвар",
    price: 130,
    category: "drink",
    kind: "hot",
    count: "300 мл",
    image: "assets/images/menu/vzvar.svg"
  },
  {
    keyword: "ivan-tea",
    name: "Иван-чай",
    price: 110,
    category: "drink",
    kind: "hot",
    count: "300 мл",
    image: "assets/images/menu/kissel.svg"
  },
  {
    keyword: "sbiten",
    name: "Сбитень с мёдом",
    price: 160,
    category: "drink",
    kind: "hot",
    count: "280 мл",
    image: "assets/images/menu/vzvar.svg"
  },
  {
    keyword: "pryanik",
    name: "Медовый пряник",
    price: 130,
    category: "dessert",
    kind: "small",
    count: "90 г",
    image: "assets/images/menu/syrniki.svg"
  },
  {
    keyword: "syrnik",
    name: "Творожный сырник",
    price: 170,
    category: "dessert",
    kind: "small",
    count: "120 г",
    image: "assets/images/menu/syrniki.svg"
  },
  {
    keyword: "apple-pirozhok",
    name: "Яблочный пирожок",
    price: 160,
    category: "dessert",
    kind: "small",
    count: "110 г",
    image: "assets/images/menu/berry-pie.svg"
  },
  {
    keyword: "vatrushka",
    name: "Ватрушка с творогом",
    price: 190,
    category: "dessert",
    kind: "medium",
    count: "180 г",
    image: "assets/images/menu/berry-pie.svg"
  },
  {
    keyword: "berry-pie",
    name: "Пирог с брусникой",
    price: 260,
    category: "dessert",
    kind: "medium",
    count: "260 г",
    image: "assets/images/menu/medovik.svg"
  },
  {
    keyword: "medovik",
    name: "Медовик на компанию",
    price: 420,
    category: "dessert",
    kind: "large",
    count: "560 г",
    image: "assets/images/menu/medovik.svg"
  }
];
})();
