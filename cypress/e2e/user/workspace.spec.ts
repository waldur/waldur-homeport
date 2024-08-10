describe('User workspace', function () {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .mockCustomers()
      .intercept('GET', '/api/marketplace-categories/**', [])
      .intercept(
        'GET',
        `/api/events-stats/?scope=/api/users/bf6d515c9e6e445f9c339021b30fc96b/&page_size=12`,
        {},
      )
      .setToken()
      .visit('/profile/')
      .waitForPage();
  });

  it('Should go to "manage"', () => {
    cy.get('.hero button').contains('Edit').click();
    cy.title().should('contain', 'Settings');
  });

  it('Should go to "audit log"', () => {
    cy.get('.toolbar a').contains('Audit log').click();
    cy.title().should('contain', 'Audit log');
  });

  it('Should go to "SSH keys" list', () => {
    cy.get('.toolbar a').contains('Credentials').trigger('mouseover', { force: true });
    cy.get('.toolbar a').contains('SSH keys').click({ force: true });
    cy.title().should('contain', 'SSH keys');
  });

  it('Should go to "notifications" list', () => {
    cy.get('.toolbar a').contains('Notifications').click();
    cy.title().should('contain', 'Notifications');
  });
});
