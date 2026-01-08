const openAddDialog = () => {
  cy.get('button')
    .contains('Add')
    .click()
    .get('.dropdown-menu .dropdown-item')
    .contains('Group invitation')
    .click();
};

const CUSTOMER_UUID = '895e38d197e748459189f19285119edf';

describe('Group invitations', () => {
  beforeEach(() => {
    cy.mockUser('admin')
      .mockChecklists()
      .setToken()

      .intercept('GET', /\/api\/customers\/[^/]+\/$/, {
        fixture: 'customers/admin_customers.json',
      })
      .intercept('GET', /\/api\/customers\/[^/]+\/counters/, {
        fixture: 'marketplace/counters.json',
      })
      .intercept('GET', /\/api\/customer-credits\//, [])
      .intercept('GET', /\/api\/marketplace-orders\//, [])
      .intercept('GET', /\/api\/customer-permissions-reviews\//, [])
      .intercept('GET', /\/api\/user-group-invitations\//, {
        fixture: 'group-invitations/user-group-invitations.json',
      })
      .intercept(
        'GET',
        /\/api\/user-group-invitations\/\?.*is_active=true/,
        {
          fixture: 'group-invitations/user-group-invitations-active-items.json',
        },
      )
      .intercept('POST', /\/api\/user-group-invitations\/$/, {
        statusCode: 201,
        fixture: 'group-invitations/user-group-invitations-post.json',
      })
      .intercept(
        'POST',
        /\/api\/user-group-invitations\/[^/]+\/cancel\//,
        {
          fixture: 'group-invitations/user-group-invitations-cancel.json',
        },
      )
      .visit(`/organizations/${CUSTOMER_UUID}/group-invitations/`)
      .waitForPage();
  });

  it('Should render items correctly', () => {
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
  });

  it('When click Show only active group invitations check box then show only active invitations items', () => {
    cy.selectTableFilter('Group invitations')
      .get('table tbody tr')
      .should('have.length', 1);
  });

  it('Should open modal when Create group invitation button is clicked', () => {
    openAddDialog();
    cy.get('.modal .modal-header .modal-title').should('exist');
  });

  it('Should close modal when cancel button is clicked', () => {
    openAddDialog();
    cy.get('.modal .modal-header .btn-close')
      .should('be.visible')
      .click()
      .get('.modal .modal-header .modal-title')
      .should('not.exist');
  });

  it('Should invitation works correctly using role (Organization owner)', () => {
    openAddDialog();
    cy.get('label')
      .selectRole('Organization owner')
      .get('.modal .modal-body')
      .contains('button', 'Generate link')
      .click()
      .get('[role="alert"]')
      .should('be.visible');
  });

  it('Should invitation works correctly using role (Project manager)', () => {
    openAddDialog();
    cy.selectRole('Project manager')
      .openDropdownByLabel('Project')
      .selectTheFirstOptionOfDropdown()
      .get('.modal .modal-body')
      .contains('button', 'Generate link')
      .click()
      .get('[role="alert"]')
      .should('be.visible');
  });

  it('Should invitation works correctly using role (System administrator)', () => {
    openAddDialog();
    cy.selectRole('System administrator')
      .openDropdownByLabel('Project')
      .selectTheFirstOptionOfDropdown()
      .get('.modal .modal-body')
      .contains('button', 'Generate link')
      .click()
      .get('[role="alert"]')
      .should('be.visible');
  });

  it('Should invitation works correctly using role (Project member)', () => {
    openAddDialog();
    cy.selectRole('Project member')
      .openDropdownByLabel('Project')
      .selectTheFirstOptionOfDropdown()
      .get('.modal .modal-body')
      .contains('button', 'Generate link')
      .click()
      .get('[role="alert"]')
      .should('be.visible');
  });

  it('Should cancel invitation works properly', () => {
    cy.get('td .dropstart')
      .first()
      .find('button.dropdown-toggle')
      .click()
      .get('body > .dropdown-menu .dropdown-item')
      .contains('Cancel')
      .click({ force: true });

    cy.get('.modal-footer .btn:contains("Confirm")')
      .click()
      .get('[role="alert"]')
      .should('be.visible');
  });
});
