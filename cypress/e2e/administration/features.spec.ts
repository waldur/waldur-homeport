describe('Features', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()

      .intercept('GET', '/api/features-description/', {
        fixture: 'administration/features-description.json',
      })
      .intercept('POST', '/api/feature-values/', {
        statusCode: 200,
      })
      .as('submit_updated_feature')

      .setToken()

      .visit('/administration/features/')
      .waitForSpinner();
  });

  it('renders title', () => {
    cy.get('.card-title.h5')
      .contains('Organization workspace')
      .should('be.visible');
  });

  it('should yes & no radio button select works correctly', () => {
    cy.get('.form-switch').eq(1).click().get('.form-switch').eq(2).click();

    cy.contains('button', 'Save').click();
    cy.waitFor('@submit_updated_feature');
  });
});
