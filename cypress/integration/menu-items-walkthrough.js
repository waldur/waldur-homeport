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
      .route(
        'http://localhost:8080/api/marketplace-offerings/**',
        'fixture:marketplace/offerings.json',
      )
      .route(
        'http://localhost:8080/api/customers/bf6d515c9e6e445f9c339021b30fc96b/counters/',
        'fixture:customers/counters.json',
      )
      .route(
        'http://localhost:8080/api/customers/0d5e3e83da724893814cead5de1a641d/',
        'fixture:customers/alice.json',
      )
      .route(
        'http://localhost:8080/api/slurm-allocation/**',
        'fixture:slurm/allocation.json',
      )
      .route(
        'http://localhost:8080/api/slurm-packages/**',
        'fixture:slurm/packages.json',
      )
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

  it('Back to organization', () => {
    cy.get('.nav-label')
      .contains('Back to organization')
      .click()

      .url()
      .should('include', '/organizations/');
  });

  it('Marketplace', () => {
    cy.get('.nav-label')
      .contains('Marketplace')
      .click()
      .wait(500)
      .get('h1')
      .contains('Explore Waldur Marketplace')
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

      .get('h5')
      .contains('Resources')
      .should('be.visible')

      .get('table tbody tr')
      .first()
      .children()
      .first()
      .click();
  });
});
