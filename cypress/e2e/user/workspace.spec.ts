describe('User workspace', function () {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .mockCustomers()
      .intercept('GET', '/api/marketplace-categories/**', [])
      .intercept('GET', `/api/events-stats/?scope=/api/users/bf6d515c9e6e445f9c339021b30fc96b/&page_size=12`, {})
      .wait(3000)
      .setToken()
      .visit('/profile/')
      .wait(2000)
  });


  it('Should go to "manage"', () => {
    cy
      .get('a')
      .contains('Manage')
      .click();
    cy
      .title()
      .should('contain', 'Settings');
  });

  it('Should go to "audit log"', () => {
    cy
      .get('a')
      .contains('Audit logs')
      .click();
    cy
      .title()
      .should('contain', 'Audit logs');
  });

  it('Should go to "SSH keys" list', () => {
    cy.get('a').contains('Credentials').trigger('mouseover', {force: true});
    cy
      .get('a')
      .contains('SSH keys')
      .click({force: true});
    cy
      .title()
      .should('contain', 'SSH keys');
  });

  it('Should go to "notifications" list', () => {
    cy
      .get('a')
      .contains('Notifications')
      .click();
    cy
      .title()
      .should('contain', 'Notifications');
  });
});
