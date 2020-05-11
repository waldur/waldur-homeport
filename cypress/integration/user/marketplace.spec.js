describe('User Marketplace', () => {
  beforeEach(() => {
    cy.server()
      .mockUser()
      .login()

      .log('Visit Marketplace')
      .route(
        'http://localhost:8080/api/customers/**/counters/**',
        'fixture:marketplace/counters.json',
      )
      .route(
        'http://localhost:8080/api/customers/**',
        'fixture:marketplace/anderson_and_sons.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-offerings/**',
        'fixture:marketplace/offerings.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-categories/?**',
        'fixture:marketplace/categories.json',
      )
      .route('http://localhost:8080/api/marketplace-orders/?**', [])
      .visit('/#/organizations/10a05c2fcab44588a7aa2e16809504cf/marketplace/')
      .waitForSpinner();
  });

  it('Checks Marketplace landing view', () => {
    cy
      // Ensure that categories are displayed
      .get('.category-card')
      .should('be.visible')

      // Ensure that category is a link
      .children('a')
      .should('have.class', 'category-thumb')

      // Ensure that recently added offerings are displayed
      .get('.offering-card')
      .should('be.visible')

      // Ensure that Marketplace link is displayed
      .get('.nav-label')
      .contains('Marketplace')

      // Ensure that search works
      .get('div.Select-control input')
      .first()
      .click({ force: true })
      .get('.Select-option')
      .first()
      .click();
  });
});
