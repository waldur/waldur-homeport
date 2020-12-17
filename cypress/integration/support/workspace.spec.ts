describe('Financial overview', () => {
  beforeEach(() => {
    cy.mockUser()
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
      .intercept('GET', '/api/projects/', {
        fixture: 'projects/certifications.json',
      })
      .intercept('HEAD', '/api/marketplace-checklists/', {
        headers: {
          'x-result-count': '1',
        },
      })
      .intercept('GET', '/api/marketplace-checklists-categories/', {
        fixture: 'marketplace/checklists_categories.json',
      })
      .setToken()
      .visit('/profile/')
      .waitForSpinner();
  });

  it('should render menu item for each checklist category', () => {
    cy
      // Ensure that "Project checklist" menu item is present
      .get('.nav-label')
      .contains('Project checklist');
  });

  it('should browse menus in support workspace', () => {
    // Go to support workspace
    cy.get('.container-fluid ul.nav li')
      .first()
      .children('a')
      .click({ force: true })

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
