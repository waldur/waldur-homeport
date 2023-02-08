describe('Empty pending confirmations drawer', () => {
  beforeEach(() => {
      cy.intercept('HEAD', '/api/marketplace-order-items/**', {
        headers: {
          'x-result-count': '0',
        },
      })
      .intercept('HEAD', '/api/marketplace-project-update-requests/**', {
        headers: {
          'x-result-count': '0',
        },
      })
      .mockUser()
      .mockChecklists()
      .mockPermissions()
      .mockCustomers()
      .setToken()
      .visit('/profile/')
      .waitForPage();
  });

  it('Assure that there is no blinking dot', () => {
    cy.get('.header .bullet.bullet-dot.bg-success').should('not.exist');
  });

  it('Allows to open the drawer and see No pending confirmations message', () => {
    cy.get('.header #pending-confirmations-toggle')
      .click({ force: true })
      .get('#kt_drawer')
      .contains('h3.card-title', 'Pending confirmations')
      .get('#kt_drawer_body')
      .contains('h6', 'No pending confirmations');
  });
});

describe('Pending confirmations drawer', () => {
  const successApproveOrderItem = 'Order item has been approved';
  const successRejectOrderItem = 'Order item has been rejected';
  const successApproveAllOrderItems = 'All order items has been approved';
  const successRejectAllOrderItems = 'All order items has been rejected';
  const successApproveUpdateRequest = 'Review has been submitted';

  beforeEach(() => {
    cy.intercept('GET', '/api/marketplace-order-items/?**', {
      fixture: 'marketplace/order_items.json',
    })
      .intercept('GET', '/api/marketplace-order-items/**/', {
        fixture: 'marketplace/order_item.json',
      })
      .intercept('GET', '/api/marketplace-project-update-requests/?**', {
        fixture: 'projects/update_requests.json',
      })
      .intercept('POST', '/api/marketplace-order-items/**/approve/', {
        body: true,
      })
      .intercept('HEAD', '/api/marketplace-order-items/**', {
        headers: {
          'x-result-count': '3',
        },
      })
      .intercept('HEAD', '/api/marketplace-project-update-requests/**', {
        headers: {
          'x-result-count': '3',
        },
      })
      .as('approveOrderItem')
      .intercept('POST', '/api/marketplace-order-items/**/reject/', {
        body: true,
      })
      .as('rejectOrderItem')
      .mockUser()
      .mockChecklists()
      .mockPermissions()
      .mockCustomers()
      .setToken()
      .visit('/profile/')
      .waitForPage();
  });

  it('Assure that there is the blinking dot', () => {
    cy.get('.header .bullet.bullet-dot.bg-success').should('be.visible');
  });

  it('Allows to open the drawer and see the data', () => {
    cy.get('.header #pending-confirmations-toggle')
      .click({ force: true })
      .get('#kt_drawer')
      .contains('h3.card-title', 'Pending confirmations');

    // Pending order confirmation
    cy.get('#kt_drawer')
      .contains('h4', 'Pending order confirmation')
      .parent()
      .within(() => {
        cy.get('.table-container tbody tr').should('have.length', 2);
      });

    // Pending provider confirmation
    cy.get('#kt_drawer')
      .contains('h4', 'Pending provider confirmation')
      .parent()
      .within(() => {
        cy.get('.table-container tbody tr').should('have.length', 2);
      });

    // Project update requests
    cy.get('#kt_drawer')
      .contains('h4', 'Project update requests')
      .parent()
      .within(() => {
        cy.get('.table-container tbody tr').should('have.length', 1);
      });
  });

  xit('Allows to approve and reject items', () => {
    cy.get('.header #pending-confirmations-toggle')
      .click({ force: true })
      .get('#kt_drawer')
      .contains('h3.card-title', 'Pending confirmations');

    // Pending order confirmation
    cy.get('#kt_drawer')
      .contains('h4', 'Pending order confirmation')
      .parent()
      .within(() => {
        // Approve
        cy.get('.table-container tbody tr')
          .first()
          .contains('button', 'Approve')
          .click()
          .wait('@approveOrderItem')
          // Reject
          .get('.table-container tbody tr')
          .eq(1)
          .contains('button', 'Reject')
          .click()
          .wait('@rejectOrderItem');

        // Approve all
        cy.get('div[class="is-flex"]')
          .contains('button', 'Approve all')
          .click()
          .wait('@approveOrderItem')
          // Reject all
          .get('div[class="is-flex"]')
          .contains('button', 'Reject all')
          .click()
          .wait('@rejectOrderItem');
      })
      .get("[data-testid='notification']")
      .contains(successApproveOrderItem)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successRejectOrderItem)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successApproveAllOrderItems)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successRejectAllOrderItems)
      .parents('[data-testid="notification"]')
      .invoke('remove');

    // Pending provider confirmation
    cy.get('#kt_drawer')
      .contains('h4', 'Pending provider confirmation')
      .parent()
      .within(() => {
        // Approve
        cy.get('.table-container tbody tr')
          .first()
          .contains('button', 'Approve')
          .click()
          .wait('@approveOrderItem')
          // Reject
          .get('.table-container tbody tr')
          .eq(1)
          .contains('button', 'Reject')
          .click()
          .wait('@rejectOrderItem');

        // Approve all
        cy.get('div[class="is-flex"]')
          .contains('button', 'Approve all')
          .click()
          .wait('@approveOrderItem')
          // Reject all
          .get('div[class="is-flex"]')
          .contains('button', 'Reject all')
          .click()
          .wait('@rejectOrderItem');
      })
      .get("[data-testid='notification']")
      .contains(successApproveOrderItem)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successRejectOrderItem)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successApproveAllOrderItems)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successRejectAllOrderItems)
      .parents('[data-testid="notification"]')
      .invoke('remove');

    // Project update requests (Approve)
    cy.get('#kt_drawer')
      .contains('h4', 'Project update requests')
      .parent()
      .within(() => {
        // Approve
        cy.get('.table-container tbody tr')
          .first()
          .contains('button', 'Approve')
          .click({ force: true });
      })
      .get('.modal-header')
      .contains('Review request')
      .should('be.visible')
      .get('.modal-body textarea[name="review_comment"]')
      .type('test')
      .get('.modal-footer')
      .contains('button', 'Submit')
      .click()
      .get("[data-testid='notification']")
      .contains(successApproveUpdateRequest)
      .parents('[data-testid="notification"]')
      .invoke('remove');

    // Project update requests (Reject)
    cy.get('#kt_drawer')
      .contains('h4', 'Project update requests')
      .parent()
      .within(() => {
        // Approve
        cy.get('.table-container tbody tr')
          .first()
          .contains('button', 'Reject')
          .click({ force: true });
      })
      .get('.modal-header')
      .contains('Review request')
      .should('be.visible')
      .get('.modal-body textarea[name="review_comment"]')
      .type('test')
      .get('.modal-footer')
      .contains('button', 'Submit')
      .click()
      .get("[data-testid='notification']")
      .contains(successApproveUpdateRequest)
      .parents('[data-testid="notification"]')
      .invoke('remove');
  });
});
