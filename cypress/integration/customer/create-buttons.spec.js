describe('Customer creation toggle', () => {
  beforeEach(() => {
    cy.server()
      .mockUser()
      .route(
        'http://localhost:8080/api/customers/?**',
        'fixture:customers/alice_bob_web.json',
      )
      .login();
  });

  it('Allows to create customer from user dashoard', () => {
    cy.openCustomerCreateDialog();
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
