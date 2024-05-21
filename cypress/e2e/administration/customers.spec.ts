xdescribe('Customers', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/organization-groups/?name=&page=1&page_size=10&o=name', {
        fixture: 'administration/organization-groups.json',
      })
      .intercept(
        'GET',
        '/api/organization-group-types/?name=&page=1&page_size=10&o=name',
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

      .visit('/administration/organizations/')

      .waitForPage();
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
    cy.get('.card-table button.btn-toggle-filters')
      .should('exist')
      .click();

    cy.contains('#kt_drawer_body button.accordion-button', 'Service provider')
      .should('exist')
      .click();
    cy.get('#kt_drawer_body .accordion-item:nth-child(2) .accordion-collapse .filter-field > *')
      .click()
      .selectTheFirstOptionOfDropdown();

    cy.contains('#kt_drawer_body button.accordion-button', 'Organization group')
      .should('exist')
      .click();
    cy.get('#kt_drawer_body .accordion-item:nth-child(3) .accordion-collapse .filter-field > *')
      .click()
      .selectTheFirstOptionOfDropdown();

    cy.contains('#kt_drawer_body button.accordion-button', 'Organization group type')
      .should('exist')
      .click();
    cy.get('#kt_drawer_body .accordion-item:nth-child(4) .accordion-collapse .filter-field > *')
      .click()
      .selectTheFirstOptionOfDropdown();
  });

  it('Show details modal when click on the row', () => {
    cy.get('div.table-container').find('tbody tr').first().click();

    cy.get('.col-sm-12').contains('Name').should('be.visible');
  });
});
