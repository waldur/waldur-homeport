describe('Project creation dialog', () => {
  beforeEach(() => {
    cy.mockUser()
      .intercept(
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/counters/',
        {},
      )
      .intercept('GET', '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/', {
        fixture: 'customers/alice.json',
      })
      .setToken()
      .intercept('POST', '/api/projects/', {})
      .as('createProject')

      .intercept('GET', '/api/project-types/', {
        fixture: 'projects/types.json',
      })
      .as('getTypes')

      // Go to projects list in organization workspace
      .visit('/organizations/bf6d515c9e6e445f9c339021b30fc96b/createProject/');
  });

  it('Validates required fields', () => {
    cy.wait(['@getTypes']).then(() => {
      cy

        // Ensure that button is disabled as form is empty
        .get('button.btn-primary')
        .should('be.disabled')

        // Enter project name
        .get('input[name="name"]')
        .type('Internal OpenStack project')

        // Enter project description
        .get('textarea[name="description"]')
        .type('Test project')

        // Open dropdown for project type selector
        .get('div[class$="placeholder"]')
        .first()
        .click()
        .selectTheFirstOptionOfDropdown()

        // Submit form
        .get('button')
        .contains('Add project')
        .click()
        .wait('@createProject')
        .its('request.body')
        .should('deep.equal', {
          name: 'Internal OpenStack project',
          description: 'Test project',
          type: '/api/project-types/b4736efa2cc44777b4143463ba8f9bf8/',
        });
    });
  });
});
