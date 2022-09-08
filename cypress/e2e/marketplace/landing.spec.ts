xdescribe('Marketplace landing view', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .log('Visit Marketplace')
      .intercept('GET', '/api/customers/**/counters/', {
        fixture: 'marketplace/counters.json',
      })
      .intercept('GET', '/api/customers/', {
        fixture: 'marketplace/anderson_and_sons.json',
      })
      .intercept('GET', '/api/marketplace-offerings/', {
        fixture: 'marketplace/offerings.json',
      })
      .intercept('GET', '/api/marketplace-categories/', {
        fixture: 'marketplace/categories.json',
      })
      .intercept('GET', '/api/marketplace-orders/', [])
      .visit('/organizations/10a05c2fcab44588a7aa2e16809504cf/marketplace/')
      .waitForSpinner();
  });

  it('shows list of offerings', () => {
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
      .get('div[class$="control"]')
      .parent()
      .click()
      .get('*div[id^="react-select"]')
      .first()
      .contains('HPC / Another offering');
  });
});
