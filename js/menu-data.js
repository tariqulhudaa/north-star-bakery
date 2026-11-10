/* ==========================================================
   North Star Bakery - Menu data (Touchstone 4)
   Each menu item is an object in the MENU_ITEMS array.
   Prices fall inside the ranges listed on the Products page.
   Allergens match the allergy notice: wheat, milk, eggs,
   tree nuts, peanuts, soy and sesame.
   ========================================================== */

const MENU_ITEMS = [
  { id: "country-sourdough", name: "Country Sourdough", category: "breads", price: 7, allergens: ["wheat"] },
  { id: "whole-wheat-honey", name: "Whole Wheat Honey", category: "breads", price: 6, allergens: ["wheat"] },
  { id: "seeded-rye", name: "Seeded Rye", category: "breads", price: 8, allergens: ["wheat", "sesame"] },
  { id: "rosemary-focaccia", name: "Rosemary Focaccia", category: "breads", price: 9, allergens: ["wheat"] },
  { id: "signature-loaf", name: "Signature Loaf", category: "breads", price: 10, allergens: ["wheat"] },
  { id: "butter-croissant", name: "Butter Croissant", category: "pastries", price: 4, allergens: ["wheat", "milk", "eggs"] },
  { id: "cinnamon-roll", name: "Cinnamon Roll", category: "pastries", price: 5, allergens: ["wheat", "milk", "eggs"] },
  { id: "fruit-danish", name: "Seasonal Fruit Danish", category: "pastries", price: 5, allergens: ["wheat", "milk", "eggs"] },
  { id: "chocolate-chunk-cookie", name: "Chocolate Chunk Cookie", category: "pastries", price: 3, allergens: ["wheat", "milk", "eggs", "soy"] },
  { id: "oatmeal-raisin-cookie", name: "Oatmeal Raisin Cookie", category: "pastries", price: 3, allergens: ["wheat", "milk", "eggs"] },
  { id: "sugar-cookie", name: "Sugar Cookie", category: "pastries", price: 3, allergens: ["wheat", "milk", "eggs"] }
];

// Category buttons shown above the menu. "all" shows everything.
const CATEGORIES = [
  { value: "all", label: "All items" },
  { value: "breads", label: "Breads" },
  { value: "pastries", label: "Pastries" }
];

// Allergens a customer can choose to hide. Wheat is not listed
// because every item on the menu contains it.
const FILTERABLE_ALLERGENS = ["milk", "eggs", "sesame", "soy"];

// Largest quantity of one item per online request.
// Bigger orders are handled as event orders by phone or email.
const MAX_QUANTITY = 24;

// Look up a menu item object by its id.
function findMenuItem(id) {
  return MENU_ITEMS.find(function (item) {
    return item.id === id;
  });
}
