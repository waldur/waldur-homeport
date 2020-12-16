describe('User workspace', function () {
  beforeEach(() => {
    cy.server()
      .mockUser()
      .route('http://localhost:8080/api/marketplace-checklists-categories/', [])
      .route({
        url: 'http://localhost:8080/api/marketplace-checklists/',
        method: 'HEAD',
        response: {
          headers: {
            'x-result-count': 0,
          },
        },
      })
      .as('checklist-categories')
      .login()
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
