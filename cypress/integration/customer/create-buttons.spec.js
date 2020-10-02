describe('Customer creation toggle', () => {
  beforeEach(() => {
    cy.server()
      .mockUser()
      .route(
        'http://localhost:8080/api/customers/?**',
        'fixture:customers/alice_bob_web.json',
      )
      .route({
        url: 'http://localhost:8080/api/marketplace-checklists/',
        method: 'HEAD',
        response: {
          headers: {
            'x-result-count': 0,
          },
        },
      })
      .route('http://localhost:8080/api/marketplace-categories/', [])
      .login();
  });

  it('Allows to create customer from user dashboard', () => {
    cy.waitForSpinner().openCustomerCreateDialog();
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
