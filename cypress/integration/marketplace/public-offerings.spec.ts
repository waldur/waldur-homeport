xdescribe('Public offerings page', () => {

  beforeEach(() => {
    cy.mockConfigs()
      .mockChecklists()

    cy.intercept('GET', '/api/users/me/', {
        statusCode: 401
      })
      .intercept('GET', '/api/marketplace-service-providers/', {
        fixture: 'marketplace/service_providers.json',
      })
      .intercept('GET', '/api/marketplace-service-providers/?customer_uuid=895e38d197e748459189f19285119edf', {
        fixture: 'marketplace/service_providers.json',
      })
      .intercept('GET', '/api/marketplace-categories/06e45986252244218bd062149fc3b5b5/', {
        fixture: 'offerings/offeringCategory.json',
      })
      .intercept('GET', "/api/marketplace-categories/", {
        fixture: 'marketplace/categories.json',
      })
      .intercept('GET', '/api/marketplace-provider-offerings/?page=1&page_size=9', {
        fixture: 'marketplace/offerings.json',
      })

      .intercept('GET', '/api/marketplace-provider-offerings/*/', {
        fixture: 'offerings/publicInstance.json',
      })
      .visit('/service-providers/');
  });

  it('Assure that pages are visible with incorrect token', () => {
    // Set incorrect token
    cy.setToken()

    // Ensure that the selected item is 'Ale'
    cy.get('.detailsCardContainer:contains(Ale)')
      .find('a')
      .click();

    // Wait until page loaded
    cy.get('.serviceProviderHeaderContainer', {timeout: 10000})
      .should('contain', 'Ale');

    // click first offering item
    cy.get('.offeringCard')
      .first()
      .contains('a', 'Details')
      .click();

    // Wait until page loaded
    cy.get('div.publicOfferingDetails', {timeout: 10000})
      .should('be.visible');
  });

  it('Assure that pages are visible without auth token', () => {
    // Ensure that the selected item is 'Ale'
    cy.get('.detailsCardContainer:contains(Ale)')
      .find('a')
      .click();

    // Wait until page loaded
    cy.get('.serviceProviderHeaderContainer', {timeout: 10000})
      .should('contain', 'Ale');

    // click first offering item
    cy.get('.offeringCard')
      .first()
      .contains('a', 'Details')
      .click();

    // Wait until page loaded
    cy.get('div.publicOfferingDetails', {timeout: 10000})
      .should('be.visible');
  });

});
