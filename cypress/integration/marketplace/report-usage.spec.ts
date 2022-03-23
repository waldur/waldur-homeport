describe('Public resources (Report usage)', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/marketplace-orders/', [])
      .intercept('GET', '/api/customers/895e38d197e748459189f19285119edf/', {
        fixture: 'marketplace/anderson_and_sons.json',
      })
      .intercept('GET', '/api/customers/', {
        fixture: 'customers/alice_bob_web.json',
      })
      .intercept('GET', '/api/marketplace-offerings/', {
        fixture: 'marketplace/report_usage_offerings.json',
      })
      .intercept('GET', '/api/marketplace-categories/', {
        fixture: 'marketplace/categories.json',
      })
      .intercept(
        'GET',
        '/api/marketplace-resources/d1b3fd4be5cc4d53aee30f569696a36f/plan_periods/',
        {
          fixture: 'marketplace/plan_periods.json',
        },
      )
      .intercept('GET', '/api/marketplace-resources/', {
        fixture: 'marketplace/resources.json',
      })

      .intercept(
        'GET',
        '/api/customer-permissions-reviews/?customer_uuid=**&is_pending=true',
        [],
      )
      .intercept('POST', '/api/marketplace-component-usages/set_usage/', [])
      .log('Visit Marketplace Public Resources view')
      .visit(
        '/organizations/895e38d197e748459189f19285119edf/marketplace-public-resources/',
      )
      .get('#public-resources-list-actions-dropdown-btn')
      .click({ force: true })
      .get('li > a')
      .contains('Report usage')
      .click({ force: true });
  });

  it('should render title', () => {
    cy.get('.modal-title')
      .contains('Resource usage for Test')
      .should('be.visible');
  });

  it('should submit usage report works correctly', () => {
    cy.get('input[name="components.a.amount"]')
      .clear()
      .type('129')
      .get('textarea[name="components.a.description"]')
      .clear()
      .type('Hello, world!')
      .get('#checkbox-1')
      .dblclick()
      .get('input[name="components.b.amount"]')
      .type('135')
      .get('textarea[name="components.b.description"]')
      .type('Test Test Test')
      .get('#checkbox-2')
      .click()
      .get('form > .btn-primary')
      .click()
      .get('.reapop__notification-message')
      .should('be.visible');
  });
});
