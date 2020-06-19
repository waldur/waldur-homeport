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
      .route(
        'http://localhost:8080/api/marketplace-resources/**',
        'fixture:marketplace/resources.json',
      )
      .route('http://localhost:8080/api/marketplace-cart-items/**', [])
      .login()
      .openWorkspaceSelector()
      .selectFirstProjectOfFirstOrganizationFromWorkspaceSelector();
  });

  it('Dashboard', () => {
    cy.get('.nav-label')
      .contains('Dashboard')
      .click()

      .get('h2')
      .contains('Welcome')
      .should('be.visible');
  });

  it('My orders', () => {
    cy.get('.nav-label')
      .contains('My orders')
      .click()

      .wait(500)
      .get('h2')
      .contains('My orders')
      .should('be.visible');
  });

  it('Resources', () => {
    cy.get('.nav-label')
      .contains('Resources')
      .click()

      .get('a .nav-label')
      .contains('HPC')
      .click()

      .wait(500)
      .get('h2')
      .contains('HPC resources')
      .should('be.visible');
  });
});
