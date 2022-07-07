xdescribe('User workspace', function () {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()
      .visit('/profile/')
      .wait(500)
      .get('[data-cy="user-dropdown-menu"]')
      .click();
  });

  it('Should go to audit log', () => {
    cy.get('a').contains('Audit logs').click();
    cy.title().should('contain', 'Audit logs');
  });

  it('Should go to SSH keys list', () => {
    cy.get('a').contains('SSH Keys').click();
    cy.title().should('contain', 'SSH keys');
  });

  it('Should go to notifications list', () => {
    cy.get('a').contains('Notifications').click();
    cy.title().should('contain', 'Notifications');
  });

  it('Should go to manage user tab', () => {
    cy.get('a').contains('Manage').click();
    cy.title().should('contain', 'Manage');
  });
});
