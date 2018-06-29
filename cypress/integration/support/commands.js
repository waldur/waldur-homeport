Cypress.Commands.add('visitOrganizations', () => {
  cy
    .log('visit /support/organizations/')
    .route('http://localhost:8080/api/customers/?**', 'fixture:customers/alice_bob_web.json')
    .route('http://localhost:8080/api/billing-total-cost/**', 'fixture:customers/billing_total_cost.json')
    .visit('/#/support/organizations/', {log: false});
});
