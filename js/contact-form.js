/* ==========================================================
   North Star Bakery - Contact form (Touchstone 4)
   Page: contact.html

   1. Validates the pre-order form with JavaScript and shows
      a clear message under each field that needs fixing.
   2. Fills in Item details from the Pre-Order List the user
      built on the Products page (saved in localStorage).
   3. Remembers name, email and phone on this device if the
      user checks "Remember my name, email, and phone".
   ========================================================== */

// ---------- Settings and data ----------

// Days of notice the bakery needs for each request type.
const NOTICE_DAYS = {
  "pre-order": 1,
  "custom-cake": 3,
  "general-question": 1
};

const MAX_DAYS_AHEAD = 90;  // requests can be made up to 90 days out
const CLOSED_DAY = 1;       // getDay() value for Monday

// Validation rules for each field. Each rule is an object with a
// test function and the message shown when the test fails.
// Rules run in order, and the first one that fails is shown.
const VALIDATION_RULES = {
  "full-name": [
    { test: isFilled, message: "Please enter your full name." },
    { test: function (value) { return value.length >= 2; }, message: "Your name must be at least 2 characters long." },
    { test: function (value) { return /^[\p{L} .'-]+$/u.test(value); }, message: "Use letters, spaces, hyphens (-), or apostrophes (') only." }
  ],
  "email": [
    { test: isFilled, message: "Please enter your email address so we can confirm your order." },
    { test: function (value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value); }, message: "Enter an email address like name@example.com." }
  ],
  "phone": [
    { test: function (value) { return value === "" || /^\d{3}-\d{3}-\d{4}$/.test(value); }, message: "Use the format 555-555-5555, or leave this field blank." }
  ],
  "pickup-date": [
    { test: isFilled, message: "Please choose a pickup date." },
    { test: isOpenDay, message: "We are closed on Mondays. Please choose Tuesday through Sunday." },
    { test: hasEnoughNotice, message: noticeMessage },
    { test: isWithinBookingWindow, message: "We accept requests up to " + MAX_DAYS_AHEAD + " days ahead. Please choose an earlier date." }
  ],
  "item-details": [
    { test: isFilled, message: "Please tell us which items you would like." },
    { test: function (value) { return value.length >= 5; }, message: "Please add a little more detail (at least 5 characters)." },
    { test: function (value) { return value.length <= 500; }, message: "Please shorten your details to 500 characters or fewer." }
  ]
};

// ---------- Page elements ----------
const form = document.getElementById("request-form");
const summaryBox = document.getElementById("form-summary");
const successBox = document.getElementById("form-success");
const listNotice = document.getElementById("list-notice");
const rememberMe = document.getElementById("remember-me");
const pickupDate = document.getElementById("pickup-date");
const itemDetails = document.getElementById("item-details");
const itemCount = document.getElementById("item-details-count");

// ---------- Date helpers ----------

// "2026-11-17" -> a Date at local midnight on Nov 17.
// (new Date("2026-11-17") would be read as UTC midnight, which is
// the evening of Nov 16 in U.S. time zones and gives the wrong weekday.)
function parseLocalDate(value) {
  const parts = value.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function todayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Date -> "2026-11-17" for the date input's min and max attributes.
function toInputValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

function formatLongDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function getRequestType() {
  return form.querySelector('input[name="request-type"]:checked').value;
}

function getEarliestDate() {
  return addDays(todayAtMidnight(), NOTICE_DAYS[getRequestType()]);
}

// ---------- Rule tests ----------

function isFilled(value) {
  return value !== "";
}

function isOpenDay(value) {
  return parseLocalDate(value).getDay() !== CLOSED_DAY;
}

function hasEnoughNotice(value) {
  return parseLocalDate(value) >= getEarliestDate();
}

function isWithinBookingWindow(value) {
  return parseLocalDate(value) <= addDays(todayAtMidnight(), MAX_DAYS_AHEAD);
}

// This message changes with the request type, so it is a function.
function noticeMessage() {
  const days = NOTICE_DAYS[getRequestType()];
  const kind = getRequestType() === "custom-cake" ? "Custom cakes" : "Pre-orders";
  return kind + " need at least " + days + (days === 1 ? " day" : " days") +
    " of notice. Please choose " + formatLongDate(getEarliestDate()) + " or later.";
}

// ---------- Showing and clearing errors ----------

function showError(field, message) {
  field.setAttribute("aria-invalid", "true");
  document.getElementById(field.id + "-error").textContent = message;
}

function clearError(field) {
  field.removeAttribute("aria-invalid");
  document.getElementById(field.id + "-error").textContent = "";
}

// Checks one field against its rules. Returns true if valid.
function validateField(fieldId) {
  const field = document.getElementById(fieldId);
  const value = field.value.trim();
  const failedRule = VALIDATION_RULES[fieldId].find(function (rule) {
    return !rule.test(value);
  });

  if (failedRule) {
    const message = typeof failedRule.message === "function" ? failedRule.message() : failedRule.message;
    showError(field, message);
    return false;
  }
  clearError(field);
  return true;
}

// Checks every field and returns an array of the ids that failed.
function validateForm() {
  return Object.keys(VALIDATION_RULES).filter(function (fieldId) {
    return !validateField(fieldId);
  });
}

function showSummary(invalidIds) {
  const fieldNames = invalidIds.map(function (fieldId) {
    const labelText = form.querySelector('label[for="' + fieldId + '"]').textContent;
    return '<li><a href="#' + fieldId + '">' + labelText.replace(/\s*\(.*\)|\s*\*/g, "") + "</a></li>";
  });
  summaryBox.innerHTML =
    "<p><strong>Please fix " + invalidIds.length + (invalidIds.length === 1 ? " field" : " fields") +
    " before sending.</strong> Everything you typed is still here.</p><ul>" + fieldNames.join("") + "</ul>";
  summaryBox.hidden = false;
}

function hideSummary() {
  summaryBox.hidden = true;
  summaryBox.innerHTML = "";
}

// ---------- Character counter ----------

function updateCharCount() {
  const used = itemDetails.value.length;
  itemCount.textContent = used + " of 500 characters used";
}

// ---------- localStorage: pre-order list ----------

// Turns the saved list into lines of text, for example
// "2 x Country Sourdough ($14.00)". Returns "" if the list is empty.
function buildListText(savedList) {
  const lines = [];
  let total = 0;

  savedList.forEach(function (entry) {
    const item = findMenuItem(entry.id);
    if (item && entry.qty > 0) {
      const lineTotal = item.price * entry.qty;
      total += lineTotal;
      lines.push(entry.qty + " x " + item.name + " (" + formatPrice(lineTotal) + ")");
    }
  });

  if (lines.length === 0) {
    return "";
  }
  return lines.join("\n") + "\nEstimated total: " + formatPrice(total);
}

function prefillFromList() {
  const savedList = loadFromStorage(STORAGE_KEYS.preOrderList, []);
  const listText = Array.isArray(savedList) ? buildListText(savedList) : "";

  // Never overwrite something the user already typed.
  if (listText === "" || itemDetails.value.trim() !== "") {
    return;
  }

  itemDetails.value = listText;
  form.querySelector("#type-preorder").checked = true;
  const count = savedList.reduce(function (sum, entry) { return sum + entry.qty; }, 0);
  listNotice.innerHTML = "We added the " + count + (count === 1 ? " item" : " items") +
    ' from your Pre-Order List to <a href="#item-details">Item details</a>. You can edit them there, or ' +
    '<a href="products.html#preorder-builder">change your list</a> on the Products page.';
  listNotice.hidden = false;
  updateCharCount();
}

// ---------- localStorage: remembered contact info ----------

const CONTACT_FIELDS = ["full-name", "email", "phone"];

function prefillContactInfo() {
  const saved = loadFromStorage(STORAGE_KEYS.contactInfo, null);
  if (!saved) {
    return;
  }
  CONTACT_FIELDS.forEach(function (fieldId) {
    if (saved[fieldId]) {
      document.getElementById(fieldId).value = saved[fieldId];
    }
  });
  rememberMe.checked = true;
}

function saveContactInfo() {
  const info = {};
  CONTACT_FIELDS.forEach(function (fieldId) {
    info[fieldId] = document.getElementById(fieldId).value.trim();
  });
  saveToStorage(STORAGE_KEYS.contactInfo, info);
}

// ---------- Date input limits ----------

function setDateLimits() {
  pickupDate.min = toInputValue(getEarliestDate());
  pickupDate.max = toInputValue(addDays(todayAtMidnight(), MAX_DAYS_AHEAD));
}

// ---------- Event handlers ----------

function handleSubmit(event) {
  event.preventDefault();
  successBox.hidden = true;

  const invalidIds = validateForm();
  if (invalidIds.length > 0) {
    showSummary(invalidIds);
    document.getElementById(invalidIds[0]).focus();
    return;
  }

  hideSummary();
  if (rememberMe.checked) {
    saveContactInfo();
  } else {
    removeFromStorage(STORAGE_KEYS.contactInfo);
  }
  showSuccess();
}

// This class project has no server, so a valid request ends here:
// thank the customer, clear the sent list, and reset the form.
function showSuccess() {
  const firstName = document.getElementById("full-name").value.trim().split(" ")[0];
  const email = document.getElementById("email").value.trim();
  const date = formatLongDate(parseLocalDate(pickupDate.value));

  successBox.innerHTML = "<p><strong>Thank you, " + firstName + "!</strong> Your request for " + date +
    " is ready for our team. We will reply to " + email + " within one business day.</p>";
  successBox.hidden = false;

  removeFromStorage(STORAGE_KEYS.preOrderList);
  form.reset();
  resetPageState();
  prefillContactInfo();
  successBox.focus();
}

// Once a field has shown an error, check it again as the user types
// so the message disappears as soon as the entry is fixed.
function handleInput(event) {
  const fieldId = event.target.id;
  if (fieldId === "item-details") {
    updateCharCount();
  }
  if (VALIDATION_RULES[fieldId] && event.target.getAttribute("aria-invalid") === "true") {
    validateField(fieldId);
  }
}

// Check a field when the user leaves it, but only if they typed something,
// so tabbing through an empty form does not fill it with errors.
function handleBlur(event) {
  const fieldId = event.target.id;
  if (VALIDATION_RULES[fieldId] && event.target.value.trim() !== "") {
    validateField(fieldId);
  }
}

function handleRequestTypeChange() {
  setDateLimits();
  if (pickupDate.value !== "") {
    validateField("pickup-date");
  }
}

function handleRememberChange() {
  // Unchecking the box forgets the saved details right away.
  if (!rememberMe.checked) {
    removeFromStorage(STORAGE_KEYS.contactInfo);
  }
}

function resetPageState() {
  Object.keys(VALIDATION_RULES).forEach(function (fieldId) {
    clearError(document.getElementById(fieldId));
  });
  hideSummary();
  listNotice.hidden = true;
  setDateLimits();
  updateCharCount();
}

function handleReset() {
  successBox.hidden = true;
  // The reset event fires before the browser clears the fields,
  // so wait one moment before updating the counter and limits.
  setTimeout(resetPageState, 0);
}

// ---------- Start ----------

function initContactForm() {
  if (!form) {
    return;
  }
  form.noValidate = true;   // JavaScript shows its own messages instead of browser pop-ups

  setDateLimits();
  prefillContactInfo();
  prefillFromList();
  updateCharCount();

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("input", handleInput);
  form.addEventListener("focusout", handleBlur);
  form.addEventListener("reset", handleReset);
  rememberMe.addEventListener("change", handleRememberChange);
  form.querySelectorAll('input[name="request-type"]').forEach(function (radio) {
    radio.addEventListener("change", handleRequestTypeChange);
  });
}

initContactForm();
