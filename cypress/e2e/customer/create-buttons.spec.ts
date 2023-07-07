describe('Customer creation toggle', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .intercept('GET', '/api/customers/', {
        fixture: 'customers/alice_bob_web.json',
      })
      .setToken()
      .visit('/profile/')
      .get('.loading-title')
      .should('not.exist')
      .waitForSpinner();
  });

  it('Allows to create customer from user dashboard', () => {
    cy
      // Click on "Add organization" button
      .get('div.card-toolbar button.btn.btn-primary')
      .contains('Add organization')
      .click({ force: true })

      // Modal dialog should be displayed
      .get('.modal-title', { withinSubject: null })
      .contains('Create organization');
  });
});
