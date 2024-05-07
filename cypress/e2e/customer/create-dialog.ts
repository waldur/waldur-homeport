xdescribe('Customer creation dialog', () => {
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

      // Enter organization email
      .get('input[name="email"]')
      .type('contact@abc.com')

      // Submit form
      .get('div.modal-body button.btn')
      .contains('Create organization')
      .click()
      .wait(500)

      // Notification should be shown
      .get("[role='alert']")
      .contains('Organization has been created.')

      // Wait for modal to hide
      .get('.modal-content')
      .should('not.exist')

      // Indicator of selection of created organization
      .get('#kt_aside_toolbar span')
      .contains('Alice Lebowski')

      // Form with details edit form should open
      .get('#kt_content_container .card-title.h5')
      .contains('Basic details');
  });
});
