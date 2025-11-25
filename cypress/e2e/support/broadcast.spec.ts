const makeSureFirstStepIsActive = () => {
  cy.get('.modal').within(($$modal) => {
    if ($$modal.find('label:contains(Send message to all users)').length > 0) {
      cy.get('.modal-footer button').contains('Back').click();
    }
  });
};

describe('Broadcast', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()

      .intercept(
        'GET',
        '/api/broadcast-messages/?page=1&page_size=10&field=uuid&field=author_full_name&field=subject&field=state&field=created&field=body&field=query&field=send_at',
        {
          fixture: 'support/notifications.json',
        },
      )
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
      .intercept('GET', '/api/broadcast-messages/recipients/*', {
        statusCode: 200,
        body: [],
      })
      .intercept('POST', '/api/broadcast-messages/dry_run/', {
        statusCode: 200,
        body: [],
      })
      .intercept('POST', '/api/broadcast-messages/', {
        fixture: 'support/notifications-single.json',
      })
      .intercept('GET', '/api/broadcast-messages/templates/*', {
        statusCode: 200,
        body: [],
      })
      .setToken()

      .visit('/support/broadcast/')
      .waitForSpinner();
  });

  it('renders title', () => {
    cy.get('h1').should('contain', 'Broadcast');
  });

  it('should create a broadcast with React Final Form', () => {
    cy.wait('@getNotifications').then(() => {
      // Click the Add button to open the dialog
      cy.get('#kt_content_container button.btn-primary')
        .contains('Add')
        .click();

      // Verify the modal is open
      cy.get('.modal-header').should('contain', 'Create a broadcast');

      // Wait for form to load and find step navigation
      cy.get('.modal-body').should('be.visible');

      // First, make sure we start from step 1 by clicking the step if needed
      makeSureFirstStepIsActive();

      // Fill in required fields on step 1
      cy.get('input[name="subject"]')
        .should('be.visible')
        .type('Test Subject - React Final Form');

      cy.get('textarea[name="body"]')
        .should('be.visible')
        .type('Test Body - React Final Form');

      // Click "Select recipients" to go to step 2
      cy.get('.modal-footer button')
        .contains('Select recipients')
        .should('not.be.disabled')
        .click();

      // Wait for step 2 to load
      cy.wait(500);

      // Verify recipients controls are visible
      cy.get('.form-switch:contains(Send message to all users)').should(
        'be.visible',
      );

      // Check "Send message to all users" option
      cy.get('.form-switch:contains(Send message to all users) input').check({
        force: true,
      });

      // Wait for the recipients to load
      cy.wait(1000);

      // Click "Send now" button
      cy.get('.modal-footer button')
        .contains('Send now')
        .should('not.be.disabled')
        .click();

      // Wait for success message and modal to close
      cy.wait(500);

      // Verify the broadcast was created
      cy.get("[data-testid='notification']").contains(
        'Broadcast has been sent.',
      );
    });
  });

  it('should validate required fields', () => {
    cy.wait('@getNotifications').then(() => {
      // Click the Add button to open the dialog
      cy.get('#kt_content_container button.btn-primary')
        .contains('Add')
        .click();

      // Make sure we're on step 1
      makeSureFirstStepIsActive();

      // Try to click "Select recipients" without filling required fields
      cy.get('.modal-footer button')
        .contains('Select recipients')
        .should('be.disabled');

      // Fill only subject
      cy.get('input[name="subject"]').type('Test Subject');

      // Button should still be disabled
      cy.get('.modal-footer button')
        .contains('Select recipients')
        .should('be.disabled');

      // Fill body as well
      cy.get('textarea[name="body"]').type('Test Body');

      // Now button should be enabled
      cy.get('.modal-footer button')
        .contains('Select recipients')
        .should('not.be.disabled');
    });
  });

  it('should handle template selection', () => {
    cy.wait('@getNotifications').then(() => {
      // Mock template API
      cy.intercept(
        'GET',
        '/api/broadcast-message-templates/?name=&page=1&page_size=10',
        {
          statusCode: 200,
          body: [
            {
              uuid: 'template-1',
              name: 'Maintenance Template',
              subject: 'Scheduled Maintenance',
              body: 'System maintenance is scheduled for tomorrow.',
            },
          ],
        },
      );

      // Click the Add button to open the dialog
      cy.get('#kt_content_container button.btn-primary')
        .contains('Add')
        .click();

      // Make sure we're on step 1
      makeSureFirstStepIsActive();

      // Look for template field - it might be a different type of input
      cy.get('.modal div[class$="placeholder"]')
        .first()
        .click({ force: true })
        .selectTheFirstOptionOfDropdown();
    });
  });

  it('should handle offerings and organizations selection', () => {
    cy.wait('@getNotifications').then(() => {
      // Click the Add button to open the dialog
      cy.get('#kt_content_container button.btn-primary')
        .contains('Add')
        .click();

      // Make sure we're on step 1 and fill required fields
      makeSureFirstStepIsActive();

      cy.get('input[name="subject"]').type('Test Subject');
      cy.get('textarea[name="body"]').type('Test Body');

      // Go to step 2
      cy.get('.modal-footer button').contains('Select recipients').click();

      // Wait for step 2 to load
      cy.wait(500);

      // Verify offerings and customers fields exist
      cy.get('.modal').contains('label', 'Offering').should('be.visible');
      cy.get('.modal').contains('label', 'Organizations').should('be.visible');

      // Just verify the recipients section elements exist
      cy.get('.modal-body').should('be.visible');
    });
  });

  it('should expand items when click on arrow icon', () => {
    cy.wait('@getNotifications').then(() => {
      // Wait for the table to load and check if there are expandable rows
      cy.get('tbody tr').should('have.length.greaterThan', 0);

      // Check if row expander exists before clicking
      cy.get('[data-testid=row-expander]').should('exist');
      cy.get('[data-testid=row-expander]').eq(0).click();

      // Check if expanded content is visible
      cy.get('.col-sm-8').should('be.visible');
    });
  });

  it('should refresh button work correctly', () => {
    cy.wait('@getNotifications').then(() => {
      // Look for any clickable refresh element
      cy.get(
        '[data-cy="loading-spinner"], [title*="refresh"], [aria-label*="refresh"], button[aria-label*="Refresh"]',
      )
        .first()
        .should('exist')
        .click({ force: true });

      // Wait for the refresh to complete
      cy.wait(500);
    });
  });
});
