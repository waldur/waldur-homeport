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
      .get('.modal-footer button')
      .contains('Create')
      .click({ force: true })

      // Modal dialog should be displayed
      .get('h4.modal-title', { withinSubject: null })
      .contains('Create organization');
  });

  it('Allows to create customer from workspace selector', () => {
    cy.openWorkspaceSelector()

      // Click on "Add new organization" button
      .get('#add-new-organization')
      .click()

      // Modal dialog should be displayed
      .get('.modal-title')
      .contains('Create organization');
  });
});
