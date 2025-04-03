// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// -- This is a child command --
Cypress.Commands.add("addToCart", { prevSubject: "element" }, (subject) => {
  cy.wrap(subject).find(".add-to-cart-button").click();
});

// -- This is a dual command --
Cypress.Commands.add(
  "dismiss",
  { prevSubject: "optional" },
  (subject, options) => {
    if (subject) {
      cy.wrap(subject).find(".dismiss-button").click();
    } else {
      cy.get(".dismiss-button").click();
    }
  }
);

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
