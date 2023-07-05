describe('Customers', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/divisions/?name=&page=1&page_size=10&o=name', {
        fixture: 'administration/organization-groups.json',
      })
      .intercept(
        'GET',
        '/api/division-types/?name=&page=1&page_size=10&o=name',
        {
          fixture: 'administration/division-types.json',
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
              fixture: 'administration/search_customers.json',
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

      .visit('/administration/customers/')

      .waitForSpinner();
  });

  it('Render items correctly', () => {
    cy.get('table tbody tr').should('have.length', '10');
  });

  it('Search should works correctly', () => {
    cy.get('.form-control.ps-10')
      .type('test')

      .get('table tbody tr')
      .should('have.length', '1');
  });

  it('Select options select works correctly', () => {
    cy.contains('button.filter-toggle', 'Service provider')
      .should('exist')
      .click();
    cy.get('.filter-toggle:nth-child(2)')
      .click()
      .type('{enter}');

    cy.contains('button.filter-toggle', 'Organization group')
      .should('exist')
      .click();
    cy.get('.filter-toggle:nth-child(2)')
      .click()
      .type('{enter}');

    cy.contains('button.filter-toggle', 'Organization group type')
      .should('exist')
      .click();
    cy.get('.filter-toggle:nth-child(2)')
      .click()
      .type('{enter}');
  });

  it('Show details modal when click on the row', () => {
    cy.get('div.table-container')
      .find('tbody tr')
      .first()
      .click()

    cy.get('.col-sm-12')
      .contains('Name')
      .should('be.visible');
  });
});
