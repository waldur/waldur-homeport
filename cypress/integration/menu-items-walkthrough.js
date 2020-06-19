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
      .route(
        'http://localhost:8080/api/marketplace-category-component-usages/**',
        [],
      )
      .route('http://localhost:8080/api/marketplace-resources/**', [])
      .route('http://localhost:8080/api/marketplace-cart-items/**', [])
      .login()
      .openWorkspaceSelector()
      .selectFirstProjectOfFirstOrganizationFromWorkspaceSelector();
  });

  it('select the first project of the first available organization', () => {});
});
