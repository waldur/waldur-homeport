describe('Team', () => {
  beforeEach(() => {
    cy.server()
      .mockUser()
      .login()

      .route(
        'http://localhost:8080/api/customers/**/counters/**',
        'fixture:marketplace/counters.json',
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
      .route(
        'http://localhost:8080/api/customers/6983ac22f2bb469189311ab21e493359/',
        'fixture:customers/alice.json',
      )
      .route('http://localhost:8080/api/marketplace-orders/**', [])
      .route(
        'http://localhost:8080/api/customers/**/users/**',
        'fixture:customers/customer_users.json',
      )
      .route({
        url: 'http://localhost:8080/api/customer-permissions/**',
        method: 'DELETE',
        response: [],
      })
      .route({
        url: 'http://localhost:8080/api/project-permissions/**',
        method: 'DELETE',
        response: [],
      })
      .route({
        url: 'http://localhost:8080/api/project-permissions/',
        method: 'POST',
        response: [],
      })

      .log('Visit Team')
      .visit('/organizations/6983ac22f2bb469189311ab21e493359/team/')
      .waitForSpinner();
  });

  it('Covers Team view', () => {
    cy.log('Details button')
      .get('tbody tr:first-child td:last-child button:first-child')
      .click({ force: true })
      .get('.modal-title')
      .contains('User details')
      .get('.modal-footer span')
      .contains('Cancel')
      .click()
      .wait(500)

      .log('Remove button')
      .get('tbody tr:first-child td:last-child button:last-child')
      .contains('Remove')
      .click({ force: true })

      .log('Edit button')
      .get('tbody tr:first-child td:last-child button:nth-child(2)')
      .contains('Edit')
      .click({ force: true })
      .get('.modal-title')
      .contains('Edit team member')

      .get('.checkbox')
      .contains('Organization owner')
      .click()
      // Open Role dropdown
      .get('div[class$="placeholder"]')
      .first()
      .click()
      // Select the first option
      .get('*div[id^="react-select"]')
      .first()
      .click()
      .get('button')
      .contains('Save')
      .click();
  });
});
