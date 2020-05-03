describe('Customer creation dialog', () => {
  beforeEach(() => {
    cy.server()
      .mockUser()
      .mockCustomer()
      .route({
        url: 'http://localhost:8080/api/customers/?**',
        method: 'GET',
        response: 'fixture:customers/alice_bob_web.json',
      })
      .route({
        url: 'http://localhost:8080/api/customers/',
        method: 'OPTIONS',
        response: 'fixture:customers/countries.json',
      })
      .route({
        url: 'http://localhost:8080/api/customers/',
        method: 'POST',
        response: 'fixture:customers/alice.json',
      })
      .route({
        url: 'http://localhost:8080/api/marketplace-orders/?**',
        method: 'GET',
        response: [],
      })
      .route({
        url: 'http://localhost:8080/api/daily-quotas/?**',
        method: 'GET',
        response: { nc_user_count: [] },
      })
      .route({
        url: 'http://localhost:8080/api/marketplace-category-component-usages/',
        method: 'GET',
        response: [],
      })
      .route({
        url: 'http://localhost:8080/api/marketplace-resources/?**',
        method: 'GET',
        response: [],
      })
      .login()
      .openCustomerCreateDialog();
  });

  it('Validates required fields', () => {
    cy
      // Try to switch to next step
      .get('button span')
      .contains('Next')
      .click()

      // Error message should be displayed
      .get('p.text-danger')
      .should('have.length', 2)

      // Enter organization name
      .get('input[name="name"]')
      .type('Alice Lebowski')

      // Open dropdown for organization type selector
      .get('.ui-select-container')
      .click()

      // Select first organization type
      .get('.ui-select-choices-row')
      .first()
      .click()

      // Enter organization email
      .get('input[name="email"]')
      .type('contact@abc.com')

      // Enter organization phone
      .get('input[name="phone_number"]')
      .type('+1234567890')

      // Go to the next step
      .get('button span')
      .contains('Next')
      .click()

      // Last step should be active
      .get('.steps li')
      .last()
      .should('have.class', 'current')

      // Enter organization registration code
      .get('input[name="registration_code"]')
      .type('EE1234567')

      // Enter organization address
      .get('input[name="address"]')
      .type('London, UK, Baker street, 10')

      // Enter organization postal code
      .get('input[name="postal"]')
      .type('1234567')

      // Submit form
      .get('button span')
      .contains('Finish')
      .click()

      // Notification should be shown
      .get('.alert.alert-success')
      .contains('Organization has been created.')

      // Workspace selector indicates organization workspace
      .get('.select-workspace-toggle.btn-primary')

      // Workspace selector should indicate new organization name
      .get('h2')
      .contains('Welcome, Alice Lebowski!');
  });
});
