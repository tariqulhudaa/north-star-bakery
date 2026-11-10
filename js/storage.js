/* ==========================================================
   North Star Bakery - Shared storage helpers (Touchstone 4)
   Used by both the Products page and the Contact page.
   All data is kept in localStorage so it stays on this
   device between visits and across pages.
   ========================================================== */

// One object holds every storage key so names never get mistyped.
const STORAGE_KEYS = {
  preOrderList: "nsb-preorder-list",     // items the user added on the Products page
  menuFilters: "nsb-menu-filters",       // last category and allergen choices
  contactInfo: "nsb-contact-info"        // name, email and phone (only if the user opts in)
};

// Read a value and turn it back from JSON. Returns the fallback
// if nothing is saved, the data is damaged, or storage is blocked.
function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    return fallback;
  }
}

// Turn a value into JSON and save it.
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage can be full or turned off (some private windows).
    // The page still works; the data just is not remembered.
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Nothing to do if storage is unavailable.
  }
}

// Format a number as dollars, for example 7 -> "$7.00".
function formatPrice(amount) {
  return "$" + amount.toFixed(2);
}
