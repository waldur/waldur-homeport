describe('Empty pending confirmations drawer', () => {
  beforeEach(() => {
      cy.intercept('HEAD', '/api/marketplace-orders/**', {
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
  const successApproveOrder = 'Order has been approved';
  const successRejectOrder = 'Order has been rejected';
  const successApproveAllOrders = 'All orders have been approved';
  const successRejectAllOrders = 'All orders have been rejected';
  const successApproveUpdateRequest = 'Review has been submitted';

  beforeEach(() => {
      cy.intercept('GET', '/api/marketplace-orders/**/', {
        fixture: 'marketplace/order.json',
      })
      .intercept('GET', '/api/marketplace-orders/?**', {
        fixture: 'marketplace/orders.json',
      })
      .intercept('GET', '/api/marketplace-project-update-requests/?**', {
        fixture: 'projects/update_requests.json',
      })
      .intercept('POST', '/api/marketplace-orders/**/approve_by_provider/', {
        body: true,
      })
      .intercept('HEAD', '/api/marketplace-orders/**', {
        headers: {
          'x-result-count': '2',
        },
      })
      .intercept('HEAD', '/api/marketplace-project-update-requests/**', {
        headers: {
          'x-result-count': '3',
        },
      })
      .as('approveOrder')
      .intercept('POST', '/api/marketplace-orders/**/reject_by_provider/', {
        body: true,
      })
      .as('rejectOrder')
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

    // Pending consumer orders
    cy.get('#kt_drawer')
      .contains('h4', 'Pending consumer orders')
      .parent()
      .within(() => {
        cy.get('.table-container tbody tr').should('have.length', 2);
      });

    // Pending provider orders
    cy.get('#kt_drawer')
      .contains('h4', 'Pending provider orders')
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

    // Pending consumer orders
    cy.get('#kt_drawer')
      .contains('h4', 'Pending consumer orders')
      .parent()
      .within(() => {
        // Approve
        cy.get('.table-container tbody tr')
          .first()
          .contains('button', 'Approve')
          .click()
          .wait('@approveOrder')
          // Reject
          .get('.table-container tbody tr')
          .eq(1)
          .contains('button', 'Reject')
          .click()
          .wait('@rejectOrder');

        // Approve all
        cy.get('div[class="is-flex"]')
          .contains('button', 'Approve all')
          .click()
          .wait('@approveOrder')
          // Reject all
          .get('div[class="is-flex"]')
          .contains('button', 'Reject all')
          .click()
          .wait('@rejectOrder');
      })
      .get("[data-testid='notification']")
      .contains(successApproveOrder)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successRejectOrder)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successApproveAllOrders)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successRejectAllOrders)
      .parents('[data-testid="notification"]')
      .invoke('remove');

    // Pending provider orders
    cy.get('#kt_drawer')
      .contains('h4', 'Pending provider orders')
      .parent()
      .within(() => {
        // Approve
        cy.get('.table-container tbody tr')
          .first()
          .contains('button', 'Approve')
          .click()
          .wait('@approveOrder')
          // Reject
          .get('.table-container tbody tr')
          .eq(1)
          .contains('button', 'Reject')
          .click()
          .wait('@rejectOrder');

        // Approve all
        cy.get('div[class="is-flex"]')
          .contains('button', 'Approve all')
          .click()
          .wait('@approveOrder')
          // Reject all
          .get('div[class="is-flex"]')
          .contains('button', 'Reject all')
          .click()
          .wait('@rejectOrder');
      })
      .get("[data-testid='notification']")
      .contains(successApproveOrder)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successRejectOrder)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successApproveAllOrders)
      .parents('[data-testid="notification"]')
      .invoke('remove')
      .get("[data-testid='notification']")
      .contains(successRejectAllOrders)
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
