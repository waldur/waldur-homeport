describe('Broadcast', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()

      .intercept('GET', '/api/broadcast-messages/?page=1&page_size=10', {
        fixture: 'support/notifications.json',
      })
      .as('getNotifications')
      .intercept(
        'GET',
        '/api/customers/?name=&page_size=10&has_resources=true&field=name&field=uuid&o=name',
        {
          fixture: 'support/customers.json',
        },
      )
      .intercept(
        'GET',
        '/api/projects/?name=&field=name&field=uuid&o=name&page=1&page_size=10',
        {
          fixture: 'support/projects.json',
        },
      )
      .intercept(
        'GET',
        '/api/marketplace-provider-offerings/?field=name&field=uuid&field=url&field=category_title&field=thumbnail&o=name&state=Active&name=&shared=true&page=1&page_size=10',
        {
          fixture: 'support/marketplace-offerings.json',
        },
      )
      .intercept('POST', '/api/broadcast-messages/dry_run/', {
        statusCode: 200,
      })
      .intercept('POST', '/api/broadcast-messages/', {
        fixture: 'support/notifications-single.json',
      })
      .setToken()

      .visit('/support/broadcast/')
      .waitForSpinner();
  });

  it('renders title', () => {
    cy.get('h1').should('contain', 'Broadcast');
  });

  it('Create a broadcast', () => {
    cy.wait('@getNotifications').then(() => {
      cy.get('#kt_content_container button.btn-primary')
        .contains('Create')
        .click()
        .get('input[name="subject"]')
        .type('Test')
        .get('textarea[name="body"]')
        .type('Test')
        .get('.modal-footer > .ms-3.btn.btn-primary')
        .click()
        .get('.modal-footer > .ms-3.btn.btn-primary')
        .contains('Send broadcast')
        .click();
      cy.get('tbody').find('tr').eq(0).should('exist').contains('Test');
    });
  });

  it('should expand items when click on arrow icon', () => {
    cy.get('[data-cy=row-expander]').eq(0).click();
    cy.get('.col-sm-8').contains('Test').should('be.visible');
  });

  it('should refresh button work correctly', () => {
    cy.wait('@getNotifications').then(() => {
      cy.get('[data-cy=loading-spinner').click();
    });
  });
});
