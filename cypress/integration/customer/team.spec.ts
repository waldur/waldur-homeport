describe('Team', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept(
        'GET',
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/counters/',
        {
          fixture: 'marketplace/counters.json',
        },
      )
      .intercept('GET', '/api/customers/6983ac22f2bb469189311ab21e493359/', {
        fixture: 'customers/alice.json',
      })
      .intercept('GET', '/api/marketplace-orders/', [])
      .intercept(
        'GET',
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/users/',
        {
          fixture: 'customers/customer_users.json',
        },
      )
      .intercept('DELETE', '/api/project-permissions/', {})
      .as('deleteProjectPermission')

      .intercept('DELETE', '/api/customer-permissions/', {})
      .as('deleteCustomerPermission')

      .intercept('POST', '/api/project-permissions/', {})
      .as('createProjectPermission')

      .intercept('GET', '/api/users/a37feb500aa0445b8dd45ae43a48b6e5/', {
        fixture: 'users/alice.json',
      })
      .as('getUserDetails')

      .visit('/organizations/6983ac22f2bb469189311ab21e493359/team/')
      .get('.loading-title')
      .should('not.exist')
      .waitForSpinner();
  });

  it('Allows to view permission details', () => {
    cy.get('tbody tr button').contains('Details').click({ force: true });
    cy.get('.modal-title').contains('User details');
    cy.get('.modal-content').within(() => {
      cy.waitForSpinner().get('table').should('be.visible');
    });
    cy.wait('@getUserDetails');
  });

  it('Allows to remove team member', () => {
    cy.get('tbody tr button').contains('Remove').click({ force: true });

    // Notification should be shown
    cy.get('p', { withinSubject: null })
      .contains('Team member has been removed.')
      .wait('@deleteProjectPermission');
  });

  it('Allows to edit permission', () => {
    cy.get('tbody tr button').contains('Edit').click({ force: true });
    cy.get('.modal-title')
      .contains('Edit team member')
      .get('.modal-content')
      .get('.checkbox')
      .contains('Organization owner')
      .click()

      // Open Role dropdown
      .get('div[class$="placeholder"]')
      .first()
      .click({ force: true })
      .selectTheFirstOptionOfDropdown()

      .get('button')
      .contains('Save')
      .click()

      .wait('@deleteCustomerPermission');
  });
});
