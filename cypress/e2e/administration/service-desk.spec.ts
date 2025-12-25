describe('Service Desk Settings', () => {
  beforeEach(() => {
    cy.mockUser('admin')
      .mockChecklists()
      .intercept('GET', '/api/override-settings/', {
        fixture: 'administration/override-settings.json',
      })
      .as('getSettings')
      .intercept('POST', '/api/override-settings/', {
        statusCode: 200,
        body: {},
      })
      .as('updateSettings')
      .setToken()
      .visit('/administration/service-desk-settings/')
      .waitForSpinner();
  });

  it('renders service desk providers', () => {
    cy.contains('h1', 'Atlassian').should('be.visible');
    cy.contains('h1', 'Zammad').should('be.visible');
    cy.contains('h1', 'Smax').should('be.visible');
  });

  it('opens Atlassian configuration dialog', () => {
    cy.contains('.card', 'Atlassian')
      .find('button')
      .contains('Configure')
      .click();

    cy.get('.modal-dialog').should('be.visible');
    cy.get('.modal-title').should('contain', 'Update Atlassian settings');
  });

  it('displays form fields in Atlassian dialog', () => {
    cy.contains('.card', 'Atlassian')
      .find('button')
      .contains('Configure')
      .click();

    cy.get('.modal-dialog').within(() => {
      cy.contains('Atlassian API server URL').should('be.visible');
      cy.contains('Username for access user').should('be.visible');
    });
  });

  it('submits Atlassian configuration form', () => {
    cy.contains('.card', 'Atlassian')
      .find('button')
      .contains('Configure')
      .click();

    cy.get('.modal-dialog').within(() => {
      // Clear and type new value in the API URL field
      cy.get('input')
        .first()
        .clear()
        .type('https://new-atlassian.example.com/');

      cy.contains('button', 'Update').click();
    });

    // Request is sent as multipart/form-data
    cy.wait('@updateSettings')
      .its('request.body')
      .should('include', 'ATLASSIAN_API_URL')
      .and('include', 'new-atlassian.example.com');

    cy.get('.modal-dialog').should('not.exist');
  });

  it('opens Zammad configuration dialog', () => {
    cy.contains('.card', 'Zammad').find('button').contains('Configure').click();

    cy.get('.modal-dialog').should('be.visible');
    cy.get('.modal-title').should('contain', 'Update Zammad settings');
  });

  it('opens Smax configuration dialog', () => {
    cy.contains('.card', 'Smax').find('button').contains('Configure').click();

    cy.get('.modal-dialog').should('be.visible');
    cy.get('.modal-title').should('contain', 'Update Smax settings');
  });

  it('closes dialog with close button', () => {
    cy.contains('.card', 'Atlassian')
      .find('button')
      .contains('Configure')
      .click();

    cy.get('.modal-dialog').should('be.visible');
    cy.get('.modal-dialog').find('button').contains('Cancel').click();
    cy.get('.modal-dialog').should('not.exist');
  });
});
