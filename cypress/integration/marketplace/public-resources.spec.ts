xdescribe('Public resources', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/customers/**/counters/', {
        fixture: 'marketplace/counters.json',
      })
      .intercept('GET', '/api/marketplace-orders/', [])
      .intercept('GET', '/api/customers/0b5e658068664999ba7f1de44e20766c/', {
        fixture: 'marketplace/anderson_and_sons.json',
      })
      .intercept('GET', '/api/marketplace-related-customers/**', {
        fixture: 'customers/alice_bob_web.json',
      })
      .intercept('GET', '/api/marketplace-provider-offerings/', {
        fixture: 'marketplace/offerings.json',
      })
      .intercept('GET', '/api/marketplace-categories/', {
        fixture: 'marketplace/categories.json',
      })
      .intercept('GET', '/api/marketplace-resources/', {
        fixture: 'marketplace/resources.json',
      })
      .log('Visit Marketplace Public Resources view')
      .visit(
        '/organizations/0b5e658068664999ba7f1de44e20766c/marketplace-public-resources/',
      );
  });

  it('should render public resources view', () => {
    cy.get('h2').contains('Public resources').should('exist');
  });

  it('should sync filters to url query params', () => {
    cy.openDropdownByLabel('Offering')
      .selectTheFirstOptionOfDropdown()
      .url()
      .should('include', 'offering=')

      .openDropdownByLabel('Client organization')
      .selectTheFirstOptionOfDropdown()
      .url()
      .should('include', 'organization=')

      .openDropdownByLabel('Category')
      .selectTheFirstOptionOfDropdown()
      .url()
      .should('include', 'category=')

      .url()
      .should('include', 'state=');
  });
});
