describe('Project creation dialog', () => {
  beforeEach(() => {
    cy
    .server()
    .mockUser()
    .mockCustomer()
    .login();
  });

  it('Validates required fields', () => {
    cy
      .route('http://localhost:8080/api/service-certifications/', 'fixture:projects/certifications.json').as('getCerts')

      .route('http://localhost:8080/api/project-types/', 'fixture:projects/types.json').as('getTypes')

      .route({
        url: 'http://localhost:8080/api/projects/',
        method: 'POST',
        response: 'fixture:projects/alice_azure.json',
      }).as('createProject')

      // Go to projects list in organization workspace
      .visit('/#/organizations/bf6d515c9e6e445f9c339021b30fc96b/createProject/')

      .wait(['@getCerts', '@getTypes']).then(() => {
        cy

        // Ensure that button is disabled as form is empty
        .get('button.btn-primary').should('be.disabled')

        // Enter project name
        .get('input[name="name"]').type('Internal OpenStack project')

        // Enter project description
        .get('textarea[name="description"]').type('Test project')

        // Open dropdown for project type selector
        .get('.Select-placeholder').first().click()

        // Select first project type
        .get('.Select-option').first().click()

        // // Open dropdown for project certifications selector
        .get('.Select-placeholder').eq(0).click()

        // // Select first certification
        .get('.Select-option').first().click()

        // Submit form
        .get('button').contains('Add project').click();
      })

    .wait('@createProject').its('request.body').should('deep.equal', {
      name: 'Internal OpenStack project',
      description: 'Test project',
      type: 'http://localhost:8080/api/project-types/b4736efa2cc44777b4143463ba8f9bf8/',
      certifications: [
        {
          url: 'http://localhost:8080/api/service-certifications/71969b205ff943c6b0d89e98f466a2dc/',
        }
      ]
    });
  });
});
