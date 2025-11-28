describe('Join organization', () => {
  beforeEach(() => {
    cy.setToken().mockUser();

    cy.intercept(
      'GET',
      '/api/user-group-invitations/?page=1&page_size=10&is_active=true&is_public=true',
      { fixture: 'group-invitations/user-group-invitations.json' },
    )
      .intercept(
        'POST',
        '/api/user-group-invitations/ab999060754043c7b099e85893fdfabf/submit_request/',
        {
          statusCode: 400,
          body: [
            'You are not allowed to accept this invitation. Your email or organization must match the invitation restrictions.',
          ],
        },
      )
      .intercept(
        'POST',
        '/api/user-group-invitations/f7714842783446c8abe1f6b84dd5c9e2/submit_request/',
        {
          statusCode: 400,
          body: ['Request has been created already.'],
        },
      )
      .visit('/join-organization/')
      .waitForPage();
  });

  it('Assure only one error notification is displayed and the message is correct.', () => {
    cy.get('.page .card-table .form-check-box')
      .contains('Already-Joined')
      .click();
    cy.get('button').contains('Request access').click();

    // Only one notification should be shown
    cy.get("[data-testid='notification']")
      .should('have.length', 1)
      .contains('Request has been created already.');
  });

  it('Assure the modal error is displayed for the user who is not allowed, without notification.', () => {
    cy.get('.page .card-table .form-check-box')
      .contains('Allen-Rodriguez')
      .click();
    cy.get('button').contains('Request access').click();

    // Should show a modal with error message without any notifications
    cy.get('.modal')
      .should('be.visible')
      .get('.modal-body')
      .should('exist')
      .contains(
        'You are not allowed to accept this invitation. Your email or organization must match the invitation restrictions.',
      );
    cy.get("[data-testid='notification']").should('not.exist');
  });
});
