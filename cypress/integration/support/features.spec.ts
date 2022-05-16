describe('Features', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()

      .intercept('GET', '/api/features-description/', {
        fixture: 'support/features-description.json',
      })
      .intercept('POST', '/api/feature-values/', {
        statusCode: 200,
      })
      .as('submit_updated_feature')

      .setToken()

      .visit('/support/features/')
      .waitForSpinner();
  });

  it('renders title', () => {
    cy.get('.page-title h1').contains('Features').should('be.visible');
  });

  it('should yes & no radio button select works correctly', () => {
    cy.get('.custom-checkmark')
      .eq(1)
      .click()
      .get('.custom-checkmark')
      .eq(2)
      .click();

    cy.contains('button', 'Save').click();
    cy.waitFor('@submit_updated_feature');
  });
});
