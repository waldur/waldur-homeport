Cypress.Commands.add('openSelectDialog', (selectId, option) => {
  cy.get(`a#${selectId}`)
    .click()
    .get('td')
    .contains(option)
    .click()
    .get('.modal-footer .btn-primary')
    .contains('Select')
    .click();
});

Cypress.Commands.add('buttonShouldBeDisabled', (btnClass) =>
  cy.get(btnClass).should('have.attr', 'disabled'),
);
