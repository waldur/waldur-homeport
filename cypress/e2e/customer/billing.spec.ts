/// <reference types="cypress"/>

describe('Billing page', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()
      .intercept('GET', '/api/customers/6983ac22f2bb469189311ab21e493359/', {
        fixture: 'customers/alice.json',
      })
      .intercept('GET', /\/api\/invoices\/\?.*/, {
        fixture: 'customers/invoices2.json',
      })

      .visit('/organizations/6983ac22f2bb469189311ab21e493359/billing/')
      .waitForPage();
  });

  it("should show billing page table with header as 'Accounting'", () => {
    cy.get('.header-menu').contains('Accounting').should('be.visible');

    cy.get('.card-title.h5').contains('Accounting').should('be.visible');
  });

  it('should have month overview card', () => {
    cy.get('.card-body').contains('h2', 'July 2023').should('be.visible');
  });
});
