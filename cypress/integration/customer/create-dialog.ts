describe('Customer creation dialog', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockCustomer()
      .mockChecklists()
      .intercept('OPTIONS', '/api/customers/', {
        fixture: 'customers/countries.json',
      })
      .intercept('POST', '/api/customers/', { fixture: 'customers/alice.json' })
      .intercept('GET', '/api/marketplace-orders/', [])
      .intercept('GET', '/api/daily-quotas/', { nc_user_count: [] })
      .intercept('GET', '/api/marketplace-category-component-usages/', [])
      .intercept('GET', '/api/marketplace-resources/', [])
      .intercept('GET', '/api/marketplace-offerings/', [])
      .setToken()
      .visit('/profile/')
      .waitForSpinner()
      // Click on "Add organization" button
      .get('.modal-footer button')
      .contains('Create')
      .click({ force: true })

      // Modal dialog should be displayed
      .get('h4.modal-title', { withinSubject: null })
      .contains('Create organization');
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
        expect($input[0]['validationMessage']).to.exist;
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
      .should('not.exist')

      // Workspace selector indicates organization workspace
      .get('.select-workspace-toggle.btn-primary')

      // Workspace selector should indicate new organization name
      .get('h2')
      .contains('Welcome, Alice Lebowski!');
  });
});
