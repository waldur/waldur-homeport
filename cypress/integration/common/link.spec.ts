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
      .fillAndSubmitLoginForm()
      .location('pathname')
      .should('match', /profile\/keys\//);
  });

  it('should redirect to attempted url with params after login', () => {
    cy.visit('/projects/df4193e2bee24a4c8e339474d74c5f8c/')
      .fillAndSubmitLoginForm()
      .location('pathname')
      .should('match', /projects\/df4193e2bee24a4c8e339474d74c5f8c\//);
  });
});

describe('Expired token redirect', () => {
  // See also: https://github.com/cypress-io/cypress/issues/9302
  it('should redirect to attempted url with params after login', () => {
    cy.server()
      .route('GET', '/api/configuration/', 'fixture:configuration.json')
      .route('POST', '/api-auth/password/', { token: 'valid' })
      .route('GET', '/api/customer-permissions/', [])
      .route('GET', '/api/project-permissions/', [])
      .route(
        'GET',
        '/api/project-permissions/?user=3a836bc76e1b40349ec1a0d8220f374f&project=df4193e2bee24a4c8e339474d74c5f8c',
        [],
      )
      .route('GET', '/api/events/', [])
      .route(
        'GET',
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/',
        'fixture:customers/alice.json',
      )
      .route('GET', '/api/customers/', 'fixture:customers/alice_bob_web.json')
      .route(
        'GET',
        '/api/projects/df4193e2bee24a4c8e339474d74c5f8c/',
        'fixture:projects/alice_azure.json',
      )
      .route('/api/users/?current=', { status: 401 });

    cy.visit('/projects/df4193e2bee24a4c8e339474d74c5f8c/')
      .route('/api/users/?current=', 'fixture:users/alice.json')
      .fillAndSubmitLoginForm()
      .location('pathname')
      .should('match', /projects\/df4193e2bee24a4c8e339474d74c5f8c\//);
  });

  it('should redirect to attempted url with params after login even if 401 error is not raised during transition', () => {
    cy.server()
      .route('GET', '/api/configuration/', 'fixture:configuration.json')
      .route('GET', '/api/users/?current=', 'fixture:users/alice.json')
      .route('POST', '/api-auth/password/', { token: 'valid' })
      .route({ method: 'GET', url: '/api/events/**', response: [] })
      .as('success')
      .setToken()
      .visit('/profile/events/')
      .wait(['@success']);

    cy.route({
      method: 'GET',
      url: '/api/events/**',
      status: 401,
      response: [],
    }).as('error');

    cy.get('.btn')
      .contains('Refresh')
      .click()
      .wait(['@error'])
      .route({ method: 'GET', url: '/api/events/**', response: [] });

    cy.fillAndSubmitLoginForm()
      .location('pathname')
      .should('match', /profile\/events\//);
  });
});
