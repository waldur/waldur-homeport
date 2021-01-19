describe('Financial overview', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .intercept('GET', '/api/marketplace-offerings/', {
        fixture: 'marketplace/offerings.json',
      })
      .intercept('GET', '/api/customers/', {
        fixture: 'customers/alice_bob_web.json',
      })
      .intercept('GET', '/api/marketplace-categories/', {
        fixture: 'marketplace/categories.json',
      })
      .intercept('GET', '/api/marketplace-resources/', {
        fixture: 'marketplace/resources.json',
      })
      .intercept('GET', '/api/marketplace-service-providers/', {
        fixture: 'marketplace/service_providers.json',
      })
      .intercept('GET', '/api/marketplace-plans/usage_stats/', {
        fixture: 'marketplace/plans_usage_stats.json',
      })
      .intercept('GET', '/api/invoices/', {
        fixture: 'customers/invoices.json',
      })
      .intercept('GET', '/api/billing-total-cost/', {
        fixture: 'customers/billing_total_cost.json',
      })
      .intercept('GET', '/api/invoices/growth/', {
        fixture: 'customers/invoices_growth.json',
      })
      .intercept('GET', '/api/marketplace-order-items/', {
        fixture: 'marketplace/order_items.json',
      })
      .intercept('GET', '/api/marketplace-component-usages/', {
        fixture: 'marketplace/component_usages.json',
      })
      .setToken()
      .visit('/support/helpdesk/')
      .get('h2')
      .contains('Helpdesk dashboard')
      .waitForSpinner();
  });

  it('should render menu item for each checklist category', () => {
    cy
      // Ensure that "Project checklist" menu item is present
      .get('.nav-label')
      .contains('Project checklist');
  });

  it('should browse menus in support workspace', () => {
    cy.wait(500);
    // Check support reporting menu items
    cy.contains('.nav-label', 'Reporting').click();

    // Reporting => Capacity
    cy.contains('.nav-label', 'Capacity').click();

    // Reporting => Financial
    cy.contains('.nav-label', 'Financial').click();

    // Reporting => Growth
    cy.contains('.nav-label', 'Growth').click();

    // Reporting => Offerings
    cy.contains('.nav-label', 'Offerings').click();

    // Reporting => Ordering
    cy.contains('.nav-label', 'Ordering').click();

    // Reporting => Usage reports
    cy.contains('.nav-label', 'Usage reports').click();

    // Resources
    cy.contains('.nav-label', 'Resources').click();
  });
});
