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
      .intercept('GET', '/api/marketplace-public-offerings/', [])
      .setToken()
      .visit('/profile/')
      .waitForSpinner()
      // Click on "Add organization" button
      .get('div.card-toolbar button.btn.btn-primary')
      .contains('Add organization')
      .click({ force: true })

      // Modal dialog should be displayed
      .get('.modal-title', { withinSubject: null })
      .contains('Create organization');
  });

  it('Validates required fields', () => {
    cy
      // Enter organization name
      .get('input[name="name"]')
      .type('Alice Lebowski')

      // Enter home organization domain name
      .get('input[name="name"]')
      .type('Domain name')

      // Enter organization email
      .get('input[name="email"]')
      .type('contact@abc.com')

      // Enter organization phone
      .get('input[name="phone_number"]')
      .type('+1234567890')

      // Enter organization website
      .get('input[name="homepage"]')
      .type('https://example.com')

      // Press next
      .get('div.modal-footer button.btn')
      .contains('Next')
      .click()
      .wait(200)

      // Enter organization registration code
      .get('input[name="registration_code"]')
      .type('Registration code')

      // Enter address
      .get('input[name="address"]')
      .type('Address')

      // Submit form
      .get('div.modal-footer button.btn')
      .contains('Create organization')
      .click()
      .wait(500)

      // Notification should be shown
      .get('p')
      .contains('Organization has been created.')

      // Wait for modal to hide
      .get('.modal-content')
      .should('not.exist')

      // Indicator of selection of created organization
      .get('#kt_aside_toolbar span')
      .contains('Alice Lebowski')

      // Workspace selector should indicate new organization name
      .get('#kt_content_container h2')
      .contains('Alice Lebowski');
  });
});
