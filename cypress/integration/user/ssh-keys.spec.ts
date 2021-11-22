describe('SSH Keys', () => {
  const successKeyCreated = 'The key has been created.';
  const successKeyRemoved = 'SSH key has been removed.';
  const errorInvalidInput = 'Invalid SSH public key.';
  const errorKeyExist = 'Key with same fingerprint already exists.';

  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()
      .intercept(
        'GET',
        `/api/keys/?page=1&page_size=10&user_uuid=${Cypress.env('USER_UUID')}`,
        {
          fixture: 'dashboard/ssh-keys.json',
        },
      );
    cy.visit('/profile/keys/');
  });

  it('Should display error messages for invalid key input', () => {
    cy.intercept('POST', '/api/keys/', {
      statusCode: 400,
      body: {
        public_key: [errorInvalidInput],
      },
    });
    cy.contains('button', 'Add key').click();
    cy.get('input[name="name"]')
      .type('text key cy')
      .get('textarea[name="public_key"]')
      .type('s0mePub1icK6y')
      .get('button[type="submit"]')
      .click();
    cy.get("[data-testid='notification']").contains(errorInvalidInput);
  });

  it('Should display error messages for existing key input', () => {
    cy.intercept('POST', '/api/keys/', {
      statusCode: 400,
      body: {
        public_key: [errorKeyExist],
      },
    });
    cy.contains('button', 'Add key').click();
    cy.fixture('dashboard/ssh-keys').then((keys) => {
      cy.get('input[name="name"]')
        .type('text key cy')
        .get('textarea[name="public_key"]')
        .type(keys[0].public_key)
        .get('button[type="submit"]')
        .click();
    });
    cy.get("[data-testid='notification']").contains(errorKeyExist);
  });

  it('Should add a ssh key with appropriate inputs', () => {
    cy.intercept('POST', '/api/keys/', {
      statusCode: 201,
      fixture: 'dashboard/ssh-key',
    });
    cy.contains('button', 'Add key').click();
    cy.fixture('dashboard/ssh-key').then((sshKey) => {
      cy.get('input[name="name"]')
        .type(sshKey.name)
        .get('textarea[name="public_key"]')
        .type(sshKey.public_key)
        .get('button[type="submit"]')
        .click();
      cy.get("[data-testid='notification']").contains(successKeyCreated);
    });
  });

  it('Should be able to delete a ssh key', () => {
    cy.fixture('dashboard/ssh-keys').then((keys) => {
      cy.intercept('DELETE', `/api/keys/${keys[0].uuid}/`, {});
      cy.get('.table-container tbody tr')
        .should('have.length', 3)
        .contains('tr', keys[0].name)
        .contains('button', 'Remove')
        .click();
      cy.get('.modal-footer').should('be.visible');
      cy.contains('.modal-footer button', 'Yes').click();
    });
    cy.get("[data-testid='notification']").contains(successKeyRemoved);
  });
});
