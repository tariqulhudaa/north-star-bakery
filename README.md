# North Star Bakery

A four-page website for North Star Bakery, a neighborhood bakery.

- **Touchstone Task 2:** semantic HTML structure for index.html, products.html, about.html, and contact.html.
- **Touchstone 3:** shared external stylesheet (`css/styles.css`) adding a visual design system and a mobile-first responsive layout built with Flexbox and media queries (768px and 1024px).

Colors: Loaf Brown #5C3A2E, Wheat Tan #C49E82, Flour Cream #FBF6F0, Espresso #2E211B.
Fonts: Fraunces (headings) and Nunito Sans (body), self-hosted in the `fonts` folder.
Media files are in the `media` folder.

## Touchstone 4: JavaScript

- **Pre-Order List builder** (`products.html`, `js/preorder-list.js`): filter the menu by category and by allergen, add breads and pastries with quantities, and see an estimated total.
- **Form validation** (`contact.html`, `js/contact-form.js`): required fields, email format, phone pattern, pickup-date rules (closed Mondays, 1 day notice for pre-orders, 3 days for custom cakes), and item-detail length. Messages appear under each field, plus a summary at the top.
- **localStorage** (`js/storage.js`): saves the Pre-Order List, the last filter choices, and (if the user opts in) name, email and phone. The list is filled into the contact form automatically.
- Menu data lives in `js/menu-data.js`.

