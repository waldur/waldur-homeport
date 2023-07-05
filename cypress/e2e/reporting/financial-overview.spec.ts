describe('Financial overview', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()
      .intercept('GET', '/api/customers/', {
        fixture: 'customers/alice_bob_web.json',
      })
      .intercept('GET', /\/api\/billing-total-cost\/\?.*/, {
        fixture: 'customers/billing_total_cost.json',
      })
      .intercept('GET', /\/api\/invoices\/\?.*/, {
        fixture: 'customers/invoices.json',
      })
      .intercept('GET', /\/api\/financial-reports\/\?.*/, {
        fixture: 'reporting/financial-reports.json'
      })
      .visit('/reporting/organizations/', { log: false });
  });

  it('should render estimated cost columns if current month is selected', () => {
    cy.get('table th')
      .contains('Estimated cost')
      .get('table th')
      .contains('Cost')
      .should('not.exist');
  });

  it('should render cost column if previous month is selected', () => {

    cy.contains('button.filter-toggle', 'Accounting period')
      .should('exist')
      .click();
    cy.get('.filter-toggle:nth-child(1)')
       .click();
    cy.get('.accounting-period-selector')
      .find('input[type="text"]')
      .type('January, 2023')
      .type('{enter}')
      .get('table th')
      .contains('Estimated cost')
      .should('not.exist')
      .get('table th')
      .contains('Cost');
  });

  it('should render total cost of €138.00', () => {
    cy.get('.text-right').should('be.visible').should('contain', '138.00');
  });
});
