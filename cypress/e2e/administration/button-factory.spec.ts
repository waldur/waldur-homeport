/**
 * Tests for the button factory components (CreateModalButton, EditModalButton, DeleteButton)
 * These tests verify that the migrated button components work correctly.
 */
describe('Button Factory Components', () => {
  describe('Organization Groups - All Button Types', () => {
    beforeEach(() => {
      cy.mockChecklists()
        .setAcceptCookies()

        // Mock configuration and auth
        .intercept('GET', '/api/configuration/', {
          fixture: 'configuration.json',
        })
        .intercept('GET', '/api/events/**', [])
        .intercept('GET', '/api/roles/**', { fixture: 'roles.json' })
        .intercept('GET', '/api/users/me/', {
          fixture: 'users/admin.json',
        })
        .intercept('GET', '/api/marketplace-categories/**', [])
        .intercept('GET', '/api/marketplace-category-groups/**', [])
        .intercept('GET', '/api/marketplace-global-categories/**', [])
        .intercept('GET', '/api/external-links/**', [])
        .intercept('GET', '/api/admin-announcements/**', [])

        // Mock organization groups endpoints
        .intercept('GET', '/api/organization-groups/**', {
          fixture: 'administration/organization-groups.json',
        })
        .intercept('HEAD', '/api/organization-groups/**', {
          headers: { 'x-result-count': '6' },
        })
        .intercept('GET', '/api/organization-group-types/**', {
          fixture: 'administration/division-types.json',
        })
        .intercept('POST', '/api/organization-groups/', {
          statusCode: 201,
          body: { uuid: 'new-group-uuid', name: 'New Group' },
        })
        .as('createGroup')
        .intercept('DELETE', '/api/organization-groups/**', {
          statusCode: 204,
        })
        .as('deleteGroup')

        .setToken()
        .visit('/administration/organization-groups/')
        .waitForPage();
    });

    it('CreateModalButton - Opens create modal when clicking Add button', () => {
      // Click the Add button (CreateModalButton)
      cy.get('.card-toolbar button.btn-primary')
        .contains('Add')
        .click({ force: true });

      // Modal should be visible
      cy.get('.modal').should('be.visible');

      // Modal should have the create title
      cy.get('.modal-header').should('contain', 'Create');

      // Modal should have form fields
      cy.get('.modal-body').should('exist');

      // Close modal by clicking the X button or pressing Escape
      cy.get('.modal-header .btn-close, .modal-header button[aria-label="Close"]')
        .first()
        .click({ force: true });
      cy.get('.modal').should('not.exist');
    });

    it('EditModalButton - Opens edit modal when clicking Edit action', () => {
      // Open the actions dropdown on first row
      cy.get('.card-table td .dropstart')
        .first()
        .find('button.dropdown-toggle')
        .click({ force: true });

      // Click the Edit action (EditModalButton)
      cy.get('body > .dropdown-menu .dropdown-item')
        .contains('Edit')
        .click({ force: true });

      // Modal should be visible
      cy.get('.modal').should('be.visible');

      // Modal should have the edit title
      cy.get('.modal-header').should('contain', 'Edit');

      // Modal should have form fields
      cy.get('.modal-body').should('exist');

      // Close modal by clicking the X button
      cy.get('.modal-header .btn-close, .modal-header button[aria-label="Close"]')
        .first()
        .click({ force: true });
      cy.get('.modal').should('not.exist');
    });

    it('DeleteButton - Shows confirmation dialog when clicking Remove action', () => {
      // Open the actions dropdown on first row
      cy.get('.card-table td .dropstart')
        .first()
        .find('button.dropdown-toggle')
        .click({ force: true });

      // Click the Remove action (DeleteButton)
      cy.get('body > .dropdown-menu .dropdown-item')
        .contains('Remove')
        .click({ force: true });

      // Confirmation dialog should be visible
      cy.get('.modal').should('be.visible');

      // Should show confirmation message
      cy.get('.modal-body').should('contain', 'Are you sure');

      // Cancel button should close the dialog without deleting
      cy.get('.modal-footer button')
        .first()
        .click({ force: true });
      cy.get('.modal').should('not.exist');
    });

    it('DeleteButton - Deletes item when confirming deletion', () => {
      // Open the actions dropdown on first row
      cy.get('.card-table td .dropstart')
        .first()
        .find('button.dropdown-toggle')
        .click({ force: true });

      // Click the Remove action
      cy.get('body > .dropdown-menu .dropdown-item')
        .contains('Remove')
        .click({ force: true });

      // Confirmation dialog should be visible
      cy.get('.modal').should('be.visible');

      // Click the confirm/submit button (last button, usually the action button)
      cy.get('.modal-footer button')
        .last()
        .click({ force: true });

      // Should call the delete API
      cy.wait('@deleteGroup');

      // Modal should close after successful deletion
      cy.get('.modal').should('not.exist');
    });
  });

  describe('Marketplace Categories - EditModalButton', () => {
    beforeEach(() => {
      cy.mockChecklists()
        .setAcceptCookies()

        // Mock configuration and auth
        .intercept('GET', '/api/configuration/', {
          fixture: 'configuration.json',
        })
        .intercept('GET', '/api/events/**', [])
        .intercept('GET', '/api/roles/**', { fixture: 'roles.json' })
        .intercept('GET', '/api/users/me/', {
          fixture: 'users/admin.json',
        })
        .intercept('GET', '/api/marketplace-category-groups/**', [])
        .intercept('GET', '/api/marketplace-global-categories/**', [])
        .intercept('GET', '/api/external-links/**', [])
        .intercept('GET', '/api/admin-announcements/**', [])

        // Mock categories
        .intercept('GET', '/api/marketplace-categories/**', {
          fixture: 'marketplace/categories.json',
        })
        .intercept('HEAD', '/api/marketplace-categories/**', {
          headers: { 'x-result-count': '5' },
        })

        .setToken()
        .visit('/administration/categories/')
        .waitForPage();
    });

    it('Opens edit modal for marketplace category', () => {
      // Open the actions dropdown on first row
      cy.get('.card-table td .dropstart')
        .first()
        .find('button.dropdown-toggle')
        .click({ force: true });

      // Click the Edit action
      cy.get('body > .dropdown-menu .dropdown-item')
        .contains('Edit')
        .click({ force: true });

      // Modal should be visible
      cy.get('.modal').should('be.visible');

      // Modal header should contain Edit
      cy.get('.modal-header').should('contain', 'Edit');

      // Close modal by clicking the X button
      cy.get('.modal-header .btn-close, .modal-header button[aria-label="Close"]')
        .first()
        .click({ force: true });
      cy.get('.modal').should('not.exist');
    });
  });
});
