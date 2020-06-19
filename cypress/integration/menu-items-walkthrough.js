describe('Browse menus', () => {
  beforeEach(() => {
    cy.server()
      .route(
        'http://localhost:8080/api/customers/?**',
        'fixture:customers/alice_bob_web.json',
      )
      .mockUser()
      .mockCustomer()
      .route(
        'http://localhost:8080/api/projects/**',
        'fixture:projects/alice_azure.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-categories/**',
        'fixture:marketplace/categories.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-checklists-categories/**',
        'fixture:marketplace/checklists_categories.json',
      )
      .login()
      .openWorkspaceSelector();
  });

  it('select the first project of the first available organization', () => {
    cy
      // Select first available organization
      .get('.list-group-item')
      .first()
      .click()

      // Click on first available project
      .get('.list-group')
      .last()
      .find('.list-group-item a')
      .contains('Select')
      .click()

      // Workspace selector indicates project workspace
      .get('.select-workspace-toggle.btn-success');
  });
});
