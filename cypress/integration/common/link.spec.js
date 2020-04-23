describe('Link persistance after login', () => {
  beforeEach(() => {
    cy.server()
      .mockUser()
      .route(
        'http://localhost:8080/api/customers/bf6d515c9e6e445f9c339021b30fc96b/?uuid=bf6d515c9e6e445f9c339021b30fc96b',
        'fixture:customers/alice.json',
      )
      .route(
        'http://localhost:8080/api/customers/?**',
        'fixture:customers/alice_bob_web.json',
      )
      .route(
        'http://localhost:8080/api/projects/**',
        'fixture:projects/alice_azure.json',
      )
      .route('http://localhost:8080/api/quotas/**/history/**', []);
  });

  it('should redirect to attempted url after login', () => {
    cy.visit('/#/profile/keys/')
      .fillAndSubmitLoginForm()
      .hash()
      .should('match', /profile\/keys\//);
  });

  it('should redirect to attempted url with params after login', () => {
    cy.visit('/#/projects/df4193e2bee24a4c8e339474d74c5f8c/')
      .fillAndSubmitLoginForm()
      .hash()
      .should('match', /projects\/df4193e2bee24a4c8e339474d74c5f8c\//);
  });
});
