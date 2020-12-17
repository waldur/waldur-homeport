describe('Issue details view', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()

      .intercept('GET', '/api/marketplace-offerings/', {
        fixture: 'marketplace/offerings.json',
      })

      .intercept('GET', '/api/support-issues/', {
        fixture: 'support/issue.json',
      })
      .as('getIssue')

      .intercept('GET', '/api/support-attachments/', [])
      .as('getAttachments')

      .intercept('GET', '/api/support-comments/', {
        fixture: 'support/comments.json',
      })
      .as('getComments')

      .setToken()

      .visit('/support/issue/c675f0e7738249f5a859037da28fbd2e/')
      .waitForSpinner()
      .wait('@getIssue');
  });

  it('renders attachments section', () => {
    cy.get('h4')
      .contains('Attachments')
      .should('exist')
      .wait('@getAttachments');
  });

  it('renders list of comments', () => {
    cy.get('h4').contains('Comments').should('exist').wait('@getComments');
    cy.get('.comment-item').should('have.length', 1);
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
      .parents('.ibox')
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
