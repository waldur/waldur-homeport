describe('Resources in personal space', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/marketplace-resources/**', {
      fixture: 'marketplace/resources.json',
    });
    cy.intercept('GET', '/api/marketplace-resources/**/offering/**', {
      body: {
        components: [],
      },
    })
      .mockUser()
      .mockChecklists()
      .mockCustomers()
      .setToken()
      .visit('/all-resources/')
      .waitForPage();
  });

  it('Assure the resources list is visible', () => {
    cy.get('h1:contains(Resources)').should('be.visible');

    cy.get('.card-table .card-body tbody tr').should('have.length', 2);
  });

  it('Assure the table expansion is working', () => {
    cy.get('.card-table .card-body tbody tr').first().click();

    cy.get('.card-table .card-body tbody tr')
      .first()
      .should('have.class', 'expanded');

    cy.get('.card-table .card-body tbody tr').should('have.length', 3);
  });
});
