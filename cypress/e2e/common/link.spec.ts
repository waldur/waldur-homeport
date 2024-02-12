describe('Link persistance after login', () => {
  beforeEach(() => {
    cy.mockUser()
      .intercept('GET', '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/', {
        fixture: 'customers/alice.json',
      })
      .intercept('GET', '/api/customers/', {
        fixture: 'customers/alice_bob_web.json',
      })
      .intercept('GET', '/api/projects/df4193e2bee24a4c8e339474d74c5f8c/', {
        fixture: 'projects/alice_azure.json',
      });
  });

  it('should redirect to attempted url after login', () => {
    cy.visit('/profile/keys/')
      .get('.LoginWithLocalAccountText')
      .click()
      .fillAndSubmitLoginForm()
      .location('pathname')
      .should('match', /profile\/keys\//);
  });

  it('should redirect to attempted url with params after login', () => {
    cy.visit('/projects/df4193e2bee24a4c8e339474d74c5f8c/')
      .get('.LoginWithLocalAccountText')
      .click()
      .fillAndSubmitLoginForm()
      .location('pathname')
      .should('match', /projects\/df4193e2bee24a4c8e339474d74c5f8c\//);
  });
});

describe('Expired token redirect', () => {
  // See also: https://github.com/cypress-io/cypress/issues/9302
  it('should redirect to attempted url with params after login', () => {
    cy
      .intercept('GET', '/api/configuration/', {fixture:'configuration.json'})
      .intercept('POST', '/api-auth/password/', { token: 'valid' })
      .intercept('GET', '/api/roles/', {fixture: 'roles.json'})
      .intercept('GET', '/api/events/', [])
      .intercept(
        'GET',
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/',
        {fixture:'customers/alice.json'},
      )
      .intercept('GET', '/api/customers/', {fixture:'customers/alice_bob_web.json'})
      .intercept(
        'GET',
        '/api/projects/df4193e2bee24a4c8e339474d74c5f8c/',
        {fixture:'projects/alice_azure.json'},
      )
      .intercept('/api/users/me/', { status: 401 });

    cy.visit('/projects/df4193e2bee24a4c8e339474d74c5f8c/')
      .intercept('/api/users/me/', {fixture:'users/alice.json'})
      .get('.LoginWithLocalAccountText')
      .click()
      .fillAndSubmitLoginForm()
      .location('pathname')
      .should('match', /projects\/df4193e2bee24a4c8e339474d74c5f8c\//);
  });

  it('should redirect to attempted url with params after login even if 401 error is not raised during transition', () => {
    cy
      .intercept('GET', '/api/configuration/', {fixture:'configuration.json'})
      .intercept('GET', '/api/roles/', {fixture: 'roles.json'})
      .intercept('GET', '/api/users/me/', {fixture:'users/alice.json'})
      .intercept('POST', '/api-auth/password/', { token: 'valid' })
      .intercept('GET', '/api/events/**', [] )
      .as('success')
      .setToken()
      .visit('/profile/events/')
      .wait(['@success']);

    cy.intercept('GET', '/api/events/**',
      {statusCode: 401,
      body: [],
    }).as('error');

    cy.get('button:has(i.fa.fa-refresh)')
      .click()
      .wait(['@error'])
      .intercept('GET', '/api/events/**', []);

    cy.get('.LoginWithLocalAccountText')
      .click()

    cy.fillAndSubmitLoginForm()
      .location('pathname')
      .should('match', /profile\/events\//);
  });
});
