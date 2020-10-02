describe('Financial overview', () => {
  beforeEach(() => {
    cy.server()
      .mockUser()
      .route(
        'http://localhost:8080/api/marketplace-checklists-categories/',
        'fixture:marketplace/checklists_categories.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-offerings/**',
        'fixture:marketplace/offerings.json',
      )
      .route(
        'http://localhost:8080/api/customers/?**',
        'fixture:customers/alice_bob_web.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-categories/?**',
        'fixture:marketplace/categories.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-resources/?**',
        'fixture:marketplace/resources.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-service-providers/?**',
        'fixture:marketplace/service_providers.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-plans/usage_stats/?**',
        'fixture:marketplace/plans_usage_stats.json',
      )
      .route(
        'http://localhost:8080/api/invoices/**',
        'fixture:customers/invoices.json',
      )
      .route(
        'http://localhost:8080/api/billing-total-cost/**',
        'fixture:customers/billing_total_cost.json',
      )
      .route(
        'http://localhost:8080/api/invoices/growth/**',
        'fixture:customers/invoices_growth.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-order-items/**',
        'fixture:marketplace/order_items.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-component-usages/**',
        'fixture:marketplace/component_usages.json',
      )
      .route(
        'http://localhost:8080/api/projects/**',
        'fixture:projects/certifications.json',
      )
      .route({
        url: 'http://localhost:8080/api/marketplace-checklists/',
        method: 'HEAD',
        response: {
          headers: {
            'x-result-count': 0,
          },
        },
      })
      .login();
  });

  it('should browse menus in support workspace', () => {
    // Go to support workspace
    cy.get('.container-fluid ul.nav li')
      .first()
      .children('a')
      .click({ force: true })

      // Ensure that "Back to personal dashboard" menu item is present
      .get('.nav-label')
      .contains('Back to personal dashboard')

      // Ensure that "Project checklist" menu item is present
      .get('.nav-label')
      .contains('Project checklist')

      // Check support reporting menu items
      .get('.nav-label')
      .contains('Reporting')
      .click()

      // Reporting => Capacity
      .get('.nav-label')
      .contains('Capacity')
      .click()

      // Reporting => Financial
      .get('.nav-label')
      .contains('Financial')
      .click()

      // Reporting => Growth
      .get('.nav-label')
      .contains('Growth')
      .click()

      // Reporting => Offerings
      .get('.nav-label')
      .contains('Offerings')
      .click()

      // Reporting => Ordering
      .get('.nav-label')
      .contains('Ordering')
      .click()

      // Reporting => Usage reports
      .get('.nav-label')
      .contains('Usage reports')
      .click()

      // Resources
      .get('.nav-label')
      .contains('Resources')
      .click();
  });
});
