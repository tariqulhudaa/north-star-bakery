/* ==========================================================
   North Star Bakery - Pre-Order List builder (Touchstone 4)
   Page: products.html

   Customers filter the menu by category and allergen, add
   items with a quantity, and see an estimated total. The list
   and the filter choices are saved in localStorage, so they
   are still there after a reload and are carried over to the
   request form on the Contact page.
   ========================================================== */

// ---------- State (loaded from localStorage) ----------

// Array of { id, qty } objects, for example [{ id: "seeded-rye", qty: 2 }]
let preOrderList = cleanSavedList(loadFromStorage(STORAGE_KEYS.preOrderList, []));

// Object holding the last filter choices
let menuFilters = loadFromStorage(STORAGE_KEYS.menuFilters, {
  category: "all",
  hiddenAllergens: []
});

// ---------- Page elements ----------
const categoryButtons = document.getElementById("category-buttons");
const allergenOptions = document.getElementById("allergen-options");
const menuGrid = document.getElementById("menu-grid");
const menuCount = document.getElementById("menu-count");
const listItems = document.getElementById("list-items");
const listEmpty = document.getElementById("list-empty");
const listTotal = document.getElementById("list-total");
const listCount = document.getElementById("list-count");
const listActions = document.getElementById("list-actions");
const clearListButton = document.getElementById("clear-list");
const statusMessage = document.getElementById("builder-status");

// ---------- Data helpers ----------

// Keep only saved entries that still match a menu item and
// have a sensible quantity (protects against old or edited data).
function cleanSavedList(savedList) {
  if (!Array.isArray(savedList)) {
    return [];
  }
  return savedList.filter(function (entry) {
    return findMenuItem(entry.id) && entry.qty >= 1 && entry.qty <= MAX_QUANTITY;
  });
}

function getQuantity(id) {
  const entry = preOrderList.find(function (listEntry) {
    return listEntry.id === id;
  });
  return entry ? entry.qty : 0;
}

function countItems() {
  return preOrderList.reduce(function (total, entry) {
    return total + entry.qty;
  }, 0);
}

function calculateTotal() {
  return preOrderList.reduce(function (total, entry) {
    return total + findMenuItem(entry.id).price * entry.qty;
  }, 0);
}

// An item is visible if it matches the chosen category and
// contains none of the allergens the user chose to hide.
function getVisibleItems() {
  return MENU_ITEMS.filter(function (item) {
    const categoryMatches = menuFilters.category === "all" || item.category === menuFilters.category;
    const hasHiddenAllergen = item.allergens.some(function (allergen) {
      return menuFilters.hiddenAllergens.includes(allergen);
    });
    return categoryMatches && !hasHiddenAllergen;
  });
}

// ---------- Changing the list ----------

// Add (delta = 1) or remove (delta = -1) one of an item.
function changeQuantity(id, delta) {
  const item = findMenuItem(id);
  const newQty = Math.min(getQuantity(id) + delta, MAX_QUANTITY);

  if (newQty <= 0) {
    removeItem(id);
    return;
  }

  const entry = preOrderList.find(function (listEntry) {
    return listEntry.id === id;
  });
  if (entry) {
    entry.qty = newQty;
  } else {
    preOrderList.push({ id: id, qty: newQty });
  }

  saveList();
  if (newQty === MAX_QUANTITY && delta > 0) {
    announce("You reached the online limit of " + MAX_QUANTITY + " " + item.name + ". Call us for larger orders.");
  } else {
    announce(item.name + ": " + newQty + " in your list.");
  }
}

function removeItem(id) {
  preOrderList = preOrderList.filter(function (entry) {
    return entry.id !== id;
  });
  saveList();
  announce(findMenuItem(id).name + " removed from your list.");
}

function clearList() {
  preOrderList = [];
  saveList();
  announce("Your pre-order list is now empty.");
}

function saveList() {
  saveToStorage(STORAGE_KEYS.preOrderList, preOrderList);
}

function saveFilters() {
  saveToStorage(STORAGE_KEYS.menuFilters, menuFilters);
}

// Screen reader users hear what changed without moving focus.
function announce(message) {
  statusMessage.textContent = message;
}

// ---------- Rendering ----------

function renderCategoryButtons() {
  categoryButtons.innerHTML = "";
  CATEGORIES.forEach(function (category) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.textContent = category.label;
    button.dataset.category = category.value;
    button.setAttribute("aria-pressed", String(category.value === menuFilters.category));
    categoryButtons.appendChild(button);
  });
}

function renderAllergenOptions() {
  allergenOptions.innerHTML = "";
  FILTERABLE_ALLERGENS.forEach(function (allergen) {
    const label = document.createElement("label");
    label.className = "check-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = allergen;
    checkbox.checked = menuFilters.hiddenAllergens.includes(allergen);

    label.appendChild(checkbox);
    label.append(" " + allergen.charAt(0).toUpperCase() + allergen.slice(1));
    allergenOptions.appendChild(label);
  });
}

// Builds the controls for one menu card: an "Add" button if
// the item is not in the list yet, otherwise a quantity stepper.
function buildQuantityControls(item) {
  const qty = getQuantity(item.id);
  if (qty === 0) {
    return '<button type="button" class="add-button" data-action="add" data-id="' + item.id + '">' +
      'Add to list<span class="visually-hidden">: ' + item.name + "</span></button>";
  }
  return '<div class="qty-stepper">' +
    '<button type="button" data-action="decrease" data-id="' + item.id + '" aria-label="Remove one ' + item.name + '">&minus;</button>' +
    '<span class="qty-value">' + qty + ' in list</span>' +
    '<button type="button" data-action="increase" data-id="' + item.id + '" aria-label="Add one more ' + item.name + '"' +
    (qty >= MAX_QUANTITY ? " disabled" : "") + ">+</button>" +
    "</div>";
}

function renderMenu() {
  const visibleItems = getVisibleItems();
  menuGrid.innerHTML = "";

  visibleItems.forEach(function (item) {
    const card = document.createElement("li");
    card.className = "menu-item" + (getQuantity(item.id) > 0 ? " in-list" : "");
    card.innerHTML =
      "<h3>" + item.name + "</h3>" +
      '<p class="item-price">' + formatPrice(item.price) + " each</p>" +
      '<p class="item-allergens">Contains: ' + item.allergens.join(", ") + "</p>" +
      buildQuantityControls(item);
    menuGrid.appendChild(card);
  });

  if (visibleItems.length === 0) {
    menuCount.textContent = "No items match these filters. Try showing another category or unchecking an allergen.";
  } else {
    menuCount.textContent = "Showing " + visibleItems.length + " of " + MENU_ITEMS.length + " items.";
  }
}

function renderList() {
  listItems.innerHTML = "";

  preOrderList.forEach(function (entry) {
    const item = findMenuItem(entry.id);
    const row = document.createElement("li");
    row.innerHTML =
      '<span class="list-name">' + entry.qty + " &times; " + item.name + "</span>" +
      '<span class="list-price">' + formatPrice(item.price * entry.qty) + "</span>" +
      '<button type="button" class="link-button" data-action="remove" data-id="' + entry.id + '">' +
      'Remove<span class="visually-hidden"> ' + item.name + "</span></button>";
    listItems.appendChild(row);
  });

  const isEmpty = preOrderList.length === 0;
  listEmpty.hidden = !isEmpty;
  listActions.hidden = isEmpty;
  listCount.textContent = countItems() === 1 ? "1 item" : countItems() + " items";
  listTotal.textContent = formatPrice(calculateTotal());
}

// Redraw everything, then put keyboard focus back on the item
// the user was working with (the old button no longer exists).
function renderAll(focusId) {
  renderMenu();
  renderList();
  if (focusId) {
    restoreFocus(focusId);
  }
}

function restoreFocus(id) {
  const target =
    menuGrid.querySelector('[data-id="' + id + '"][data-action="increase"]:not([disabled])') ||
    menuGrid.querySelector('[data-id="' + id + '"]');
  if (target) {
    target.focus();
  }
}

// ---------- Event handlers ----------

function handleCategoryClick(event) {
  const button = event.target.closest("[data-category]");
  if (!button) {
    return;
  }
  menuFilters.category = button.dataset.category;
  saveFilters();
  renderCategoryButtons();
  renderMenu();
}

function handleAllergenChange(event) {
  const allergen = event.target.value;
  if (event.target.checked) {
    menuFilters.hiddenAllergens.push(allergen);
  } else {
    menuFilters.hiddenAllergens = menuFilters.hiddenAllergens.filter(function (value) {
      return value !== allergen;
    });
  }
  saveFilters();
  renderMenu();
}

function handleMenuClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }
  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "add" || action === "increase") {
    changeQuantity(id, 1);
  } else if (action === "decrease") {
    changeQuantity(id, -1);
  }
  renderAll(id);
}

function handleListClick(event) {
  const button = event.target.closest('[data-action="remove"]');
  if (!button) {
    return;
  }
  removeItem(button.dataset.id);
  renderAll();
  clearListButton.closest("aside").querySelector("h3").focus();
}

function handleClearClick() {
  clearList();
  renderAll();
  clearListButton.closest("aside").querySelector("h3").focus();
}

// ---------- Start ----------

function initPreOrderBuilder() {
  if (!menuGrid) {
    return; // not on the Products page
  }
  document.getElementById("preorder-builder").classList.add("is-ready");

  renderCategoryButtons();
  renderAllergenOptions();
  renderAll();

  categoryButtons.addEventListener("click", handleCategoryClick);
  allergenOptions.addEventListener("change", handleAllergenChange);
  menuGrid.addEventListener("click", handleMenuClick);
  listItems.addEventListener("click", handleListClick);
  clearListButton.addEventListener("click", handleClearClick);
}

initPreOrderBuilder();
