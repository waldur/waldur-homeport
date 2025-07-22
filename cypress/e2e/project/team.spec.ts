const checkActionsInTab = (tab, actions: string[]) => {
  cy.get('.card-table .table-tabs button')
    .contains(tab)
    .should('exist')
    .click();

  cy.get('.card-table .card-toolbar .dropdown-toggle')
    .contains('Actions')
    .should('exist')
    .click();

  cy.get('body > .dropdown-menu').should('be.visible');
  cy.get('body > .dropdown-menu .dropdown-item')
    .should('have.length.at.least', actions.length)
    .then((items) => {
      const texts = items.toArray().map((item) => item.textContent?.trim());
      actions.forEach((label) => {
        expect(texts).to.include(label);
      });
    });
};

describe('Project Team', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/projects/df4193e2bee24a4c8e339474d74c5f8c/', {
        fixture: 'projects/alice_azure.json',
      })
      .intercept(
        'GET',
        '/api/projects/df4193e2bee24a4c8e339474d74c5f8c/list_users/**',
        { fixture: 'projects/project_users.json' },
      )

      .visit('/projects/df4193e2bee24a4c8e339474d74c5f8c/users/')
      .waitForPage();
  });

  it('Assure dropdown toggle works and contains expected items', () => {
    // Active tab
    checkActionsInTab('Active', ['Export', 'Sync members', 'History log']);

    // We don't have Actions dropdown on the Invitations tab, just check History log
    cy.get('.card-table .table-tabs button')
      .contains('Invitations')
      .should('exist')
      .click();

    cy.get('.card-table .card-toolbar')
      .contains('button', 'History log')
      .should('exist');

    // Service accounts tab
    checkActionsInTab('Service accounts', ['Export', 'History log']);
  });
});
