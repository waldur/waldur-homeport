describe('Resources in personal space', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/marketplace-resources/**', {
      fixture: 'marketplace/resources.json',
    })
      .mockUser()
      .mockChecklists()
      .mockCustomers()
      .setToken()
      .visit('/profile/user-resources/')
      .waitForPage();
  });

  it('Assure the resources list is visible', () => {
    cy.get(
      '#kt_content_container .card-toolbar .card-title:contains(Resources)',
    ).should('be.visible');

    cy.get('.card-table .card-body tbody tr').should('have.length', 2);
  });

  it('Assure the table expansion is working', () => {
    cy.get('.card-table .card-body tbody tr').first().click();

    cy.get('.card-table .card-body tbody tr')
      .first()
      .should('have.class', 'expanded');

    cy.get('.card-table .card-body tbody tr').should('have.length', 3);

    cy.fixture('marketplace/resources.json').then((resources) => {
      const firstResource = resources.at(0);
      cy.get('.card-table .card-body tbody tr.expanded')
        .next()
        .contains(firstResource.uuid)
        .should('be.visible');
    });
  });
});
