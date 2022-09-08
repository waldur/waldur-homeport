xdescribe('Group invitations', () => {
  beforeEach(() => {
    cy.mockChecklists()
      .mockUser('admin')
      .setToken()

      .intercept('GET', '/api/customers/895e38d197e748459189f19285119edf/', {
        fixture: 'customers/admin_customers.json',
      })
      .intercept(
        'GET',
        '/api/customer-permissions-reviews/?customer_uuid=895e38d197e748459189f19285119edf&is_pending=true',
        [],
      )
      .intercept(
        'GET',
        '/api/marketplace-orders/?o=-created&customer_uuid=895e38d197e748459189f19285119edf&state=requested%20for%20approval',
        [],
      )
      .intercept(
        'GET',
        '/api/user-group-invitations/?page=1&page_size=10&customer=895e38d197e748459189f19285119edf',
        {
          fixture: 'group-invitations/user-group-invitations.json',
        },
      )
      .intercept(
        'GET',
        '/api/user-group-invitations/?page=1&page_size=10&is_active=true&customer=895e38d197e748459189f19285119edf',
        {
          fixture: 'group-invitations/user-group-invitations-active-items.json',
        },
      )
      .intercept('POST', '/api/user-group-invitations/', {
        fixture: 'group-invitations/user-group-invitations-post.json',
      })
      .intercept(
        'POST',
        '/api/user-group-invitations/ab999060754043c7b099e85893fdfabf/cancel/',
        {
          fixture: 'group-invitations/user-group-invitations-cancel.json',
        },
      )

      .visit('/organizations/895e38d197e748459189f19285119edf/team/')

      .waitForSpinner()

      .contains('Group invitations')
      .click();
  });

  it('Should render items correctly', () => {
    cy.get('table tbody tr').should('have.length', 10);
  });

  it('When click Show only active group invitations check box then show only active invitations items', () => {
    cy.get('label')
      .contains('Show only active group invitations')
      .click()
      .get('table tbody tr')
      .should('have.length', 1);
  });

  it('Should open modal when Create group invitation button is clicked', () => {
    cy.contains('button', 'Create group invitation')
      .click()
      .get('.modal-title')
      .should('be.visible');
  });

  it('Should close modal when cancel button is clicked', () => {
    cy.contains('button', 'Create group invitation')
      .click()
      .get('.modal-footer > .btn-default')
      .click()
      .get('.modal-title')
      .should('not.exist');
  });

  it('Should invitation works correctly using role (Organization owner)', () => {
    cy.contains('button', 'Create group invitation')
      .click()
      .get('.btn-group label')
      .eq(0)
      .click({ multiple: true, force: true })
      .get('.modal-footer > .btn-primary')
      .click()
      .get('.reapop__notification-meta')
      .should('be.visible');
  });

  it('Should invitation works correctly using role (Project manager)', () => {
    cy.contains('button', 'Create group invitation')
      .click()
      .get('.btn-group label')
      .eq(1)
      .click({ multiple: true, force: true })
      .openDropdownByLabel('Project*')
      .selectTheFirstOptionOfDropdown()
      .get('.modal-footer > .btn-primary')
      .click()
      .get('.reapop__notification-meta')
      .should('be.visible');
  });

  it('Should invitation works correctly using role (System administrator)', () => {
    cy.contains('button', 'Create group invitation')
      .click()
      .get('.btn-group label')
      .eq(2)
      .click({ multiple: true, force: true })
      .openDropdownByLabel('Project*')
      .selectTheFirstOptionOfDropdown()
      .get('.modal-footer > .btn-primary')
      .click()
      .get('.reapop__notification-meta')
      .should('be.visible');
  });

  it('Should invitation works correctly using role (Project member)', () => {
    cy.contains('button', 'Create group invitation')
      .click()
      .get('.btn-group label')
      .eq(3)
      .click({ multiple: true, force: true })
      .openDropdownByLabel('Project*')
      .selectTheFirstOptionOfDropdown()
      .get('.modal-footer > .btn-primary')
      .click()
      .get('.reapop__notification-meta')
      .should('be.visible');
  });

  it('Should cancel invitation works properly', () => {
    cy.contains('button', 'Cancel')
      .click()
      .get('.btn-danger')
      .click()
      .get('.reapop__notification-meta')
      .should('be.visible');
  });
});
