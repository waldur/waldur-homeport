describe('Customer creation dialog', () => {
  beforeEach(() => {
    cy.server()
      .mockUser()
      .mockCustomer()
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
      .route({
        url: 'http://localhost:8080/api/marketplace-offerings/?**',
        method: 'GET',
        response: [],
      })
      .route({
        url: 'http://localhost:8080/api/marketplace-checklists/',
        method: 'HEAD',
        response: {
          headers: {
            'x-result-count': 0,
          },
        },
      })
      .login()
      .waitForSpinner()
      .openCustomerCreateDialog();
  });

  it('Validates required fields', () => {
    cy
      // Try to switch to next step
      .get('button')
      .contains('Next')
      .click()

      // Error message should be displayed
      .get('[name="name"]')
      .then(($input) => {
        expect($input[0].validationMessage).to.exist;
      })

      // Enter organization name
      .get('input[name="name"]')
      .type('Alice Lebowski')

      // Open dropdown for organization type selector
      .openDropdownByLabel('Organization type')
      .selectTheFirstOptionOfDropdown()

      // Enter organization email
      .get('input[name="email"]')
      .type('contact@abc.com')

      // Enter organization phone
      .get('input[name="phone_number"]')
      .type('+1234567890')

      // Go to the next step
      .get('button')
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
      .get('button')
      .contains('Create organization')
      .click()
      .wait(500)

      // Notification should be shown
      .get('p')
      .contains('Organization has been created.')

      // Wait for modal to hide
      .get('.modal-content')
      .should('not.be.visible')

      // Workspace selector indicates organization workspace
      .get('.select-workspace-toggle.btn-primary')

      // Workspace selector should indicate new organization name
      .get('h2')
      .contains('Welcome, Alice Lebowski!');
  });
});
