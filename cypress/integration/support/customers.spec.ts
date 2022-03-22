describe('Customers', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/divisions/?name=&page=1&page_size=10&o=name', {
        fixture: 'support/divisions.json',
      })
      .intercept(
        'GET',
        '/api/division-types/?name=&page=1&page_size=10&o=name',
        {
          fixture: 'support/division-types.json',
        },
      )
      .intercept('PUT', '/api/customers/895e38d197e748459189f19285119edf/', {
        fixture: 'support/customers.json',
      })

      .intercept('GET', '/api/customers/*', (req) => {
        if (req.url.search('query=') !== -1) {
          req.reply((res) => {
            res.send({
              statusCode: 200,
              fixture: 'support/search_customers.json',
            });
          });
        } else {
          req.reply((res) => {
            res.send({
              statusCode: 200,
              fixture: 'support/customers.json',
            });
          });
        }
      })

      .visit('/support/customers/')

      .waitForSpinner();
  });

  it('Render items correctly', () => {
    cy.get('table tbody tr').should('have.length', '10');
  });

  it('Search should works correctly', () => {
    cy.get('.form-control')
      .type('test')

      .get('table tbody tr')
      .should('have.length', '1');
  });

  it('Select options select works correctly', () => {
    cy.openDropdownByLabel('Service provider').selectTheFirstOptionOfDropdown();
    cy.openDropdownByLabel('Division').selectTheFirstOptionOfDropdown();
    cy.openDropdownByLabel('Division type').selectTheFirstOptionOfDropdown();
  });

  it('Show details modal when click details button', () => {
    cy.contains('button', 'Details')
      .click()
      .get('.modal-title')
      .should('be.visible')
      .get('.modal-footer > .btn')
      .click();
  });

  it('Show Set location modal when click Set location button', () => {
    cy.contains('button', 'Set location')
      .click()
      .get('.modal-title')
      .should('be.visible')
      .get('.modal-footer > .btn-default')
      .click();
  });

  it('Location set works correctly', () => {
    cy.contains('button', 'Set location')
      .click()
      .get('.modal-title')
      .should('be.visible')
      .get('.glass')
      .type('Hulu')
      .get('[data-key="0"]')
      .click()
      .get('.modal-footer > .btn-primary')
      .click()
      .get('.reapop__notification-meta')
      .should('be.visible');
  });
});
