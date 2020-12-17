describe('User workspace', function () {
  beforeEach(() => {
    cy.mockUser()
      .intercept('GET', '/api/marketplace-checklists-categories/', [])
      .intercept('HEAD', '/api/marketplace-checklists/', {
        headers: {
          'x-result-count': '0',
        },
      })
      .as('checklist-categories')
      .setToken()
      .visit('/profile/')
      .wait('@checklist-categories')
      .wait(500);
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
