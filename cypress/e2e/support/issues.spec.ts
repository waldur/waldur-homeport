describe('Issue details view', { testIsolation: false }, () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/marketplace-provider-offerings/', {
        fixture: 'marketplace/offerings.json',
      })
      .intercept(
        'GET',
        '/api/support-issues/c675f0e7738249f5a859037da28fbd2e/',
        {
          fixture: 'support/issue.json',
        },
      )
      .intercept(
        'GET',
        '/api/support-attachments/?issue=https%3A%2F%2Fexample.com%2Fapi%2Fsupport-issues%2Fc675f0e7738249f5a859037da28fbd2e%2F',
        [],
      )
      .as('getAttachments')
      .intercept(
        'GET',
        '/api/support-comments/?issue=https%3A%2F%2Fexample.com%2Fapi%2Fsupport-issues%2Fc675f0e7738249f5a859037da28fbd2e%2F',
        {
          fixture: 'support/comments.json',
        },
      )
      .as('getComments');
  });

  it('renders attachments section', () => {
    cy.visit('/support/issue/c675f0e7738249f5a859037da28fbd2e/');
    cy.get('.card-title.h5')
      .contains('Attachments')
      .should('exist')
      .wait('@getAttachments');
  });

  it('renders list of comments', () => {
    cy.get('h4').contains('Comments').should('exist');
    cy.get('.fw-normal').should('exist').should('have.length', 1);
  });

  it('submits new comment', () => {
    cy.intercept(
      'POST',
      '/api/support-issues/c675f0e7738249f5a859037da28fbd2e/comment/',
      {},
    )
      .as('createComment')
      .get('h4')
      .contains('Comments')
      .parents('.card')
      .within(() => {
        cy.get('button')
          .contains('Add comment')
          .click()
          .get('textarea')
          .type('Pick issue beyond role often account offer.')
          .get('button')
          .contains('Add')
          .click()
          .wait('@createComment');
      });
  });
});
