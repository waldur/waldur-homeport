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
