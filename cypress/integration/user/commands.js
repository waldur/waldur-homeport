Cypress.Commands.add('visitManage', () => {
  cy.log('visit /profile/manage/')
    .get('a')
    .contains('Manage')
    .click();
});
