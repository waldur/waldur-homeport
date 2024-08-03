interface UserRowFields {
  index: number;
  email: string;
  civilNumber: string;
  role: [string] | [string, string];
}

const invitationRequestBodies = {
  'owner@test.com': {
    email: 'owner@test.com',
    extra_invitation_text: 'Testing invite users',
    role: '511cfcf0357f43ff835bfe243569658d',
    scope: '/api/customers/bf6d515c9e6e445f9c339021b30fc96b',
  },
  'manager@test.com': {
    email: 'manager@test.com',
    extra_invitation_text: 'Testing invite users',
    role: 'f98af5dc4ae14d30b905e9670f44c835',
    scope: '/api/projects/6f3ae6f43d284ca196afeb467880b3b9/',
  },
  'administrator@test.com': {
    email: 'administrator@test.com',
    extra_invitation_text: 'Testing invite users',
    role: '94e3061f698c49a68b3aad97db393bd1',
    scope: '/api/projects/df4193e2bee24a4c8e339474d74c5f8c/',
  },
};

const fillUserRowFields = ({
  index,
  email,
  civilNumber,
  role,
}: UserRowFields) => {
  cy.get('#emails-list-group table td')
    .find(`input[name="rows[${index}].email"]`)
    .type(email, { delay: 0, force: true })

    .get('#emails-list-group table td')
    .find(`input[name="rows[${index}].civil_number"]`)
    .type(civilNumber, { delay: 0, force: true })

    .get('#emails-list-group table td .role-project-select')
    .eq(index)
    .scrollIntoView()
    .should('be.visible')
    .find('input')
    .click({ force: true })
    .get('#emails-list-group table td .menu.role-project-select-popup')
    .eq(index)
    .contains(role[0])
    .click();

  if (role.length === 2) {
    cy.get('#emails-list-group table td .menu.role-project-select-popup')
      .eq(index)
      .find('.sub-select input[name="search"]')
      .type(role[1], { force: true })
      .get('#emails-list-group table td .menu.role-project-select-popup')
      .eq(index)
      .find('.sub-select .menu-item')
      .first()
      .click();
  }
};

describe('Invitations', () => {
  before(() => cy.setToken());
  beforeEach(() => {
    cy.mockCustomers()
      .mockUser()
      .mockChecklists()

      .intercept('HEAD', '/api/customers/?archived=false', { statusCode: 200 })
      .intercept(
        'HEAD',
        '/api/marketplace-orders/?state=requested%20for%20approval&can_approve_as_consumer=True',
        { statusCode: 200 },
      )

      .intercept(
        'HEAD',
        '/api/marketplace-orders/?offering_type=Waldur.RemoteOffering&offering_type=Marketplace.Basic&state=executing&can_approve_as_provider=True',
        { statusCode: 200 },
      )

      .intercept(
        'HEAD',
        '/api/marketplace-project-update-requests/?state=pending',
        { statusCode: 200 },
      )

      .intercept('GET', '/api/customers/6983ac22f2bb469189311ab21e493359/', {
        fixture: 'customers/alice.json',
      })
      .intercept(
        'GET',
        '/api/projects/?customer=6983ac22f2bb469189311ab21e493359',
        {
          statusCode: 200,
        },
      )
      .intercept(
        'GET',
        '/api/notification-messages-templates/?name=invitation_created',
        { statusCode: 200 },
      )

      .intercept(
        'GET',
        '/api/marketplace-categories/?field=uuid&field=title&has_offerings=true',
        { fixture: 'marketplace/categories.json' },
      )

      .intercept('GET', '/api/marketplace-orders/', [])
      .intercept(
        'GET',
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/counters/?fields=projects',
        {
          fixture: 'marketplace/counters.json',
        },
      )
      .intercept(
        'GET',
        '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/users/?page=1&page_size=10&o=concatenated_name',
        {
          fixture: 'invitations/users.json',
        },
      )
      .intercept(
        'GET',
        '/api/user-invitations/?page=1&page_size=10&customer_uuid=bf6d515c9e6e445f9c339021b30fc96b',
        { fixture: 'invitations/pending-customer.json' },
      )
      .intercept(
        'GET',
        '/api/user-invitations/?page=1&page_size=10&customer_uuid=bf6d515c9e6e445f9c339021b30fc96b',
        { fixture: 'invitations/pending-customer.json' },
      )
      .intercept('POST', '/api/user-invitations/', {
        fixture: 'invitations/user-invitation.json',
      })
      .as('createInvitation')
      .intercept(
        'GET',
        '/api/user-invitations/?page=1&page_size=10&state=rejected&customer_uuid=bf6d515c9e6e445f9c339021b30fc96b',
        {
          fixture: 'invitations/pending-rejected-customers.json',
        },
      )
      .as('pendingRejected')

      .intercept(
        'POST',
        '/api/user-invitations/bf6d515c9e6e445f9c339021b30fc96b/send/',
        { statusCode: 200 },
      )

      .intercept(
        'POST',
        '/api/user-invitations/bf6d515c9e6e445f9c339021b30fc96b/cancel/',
        { statusCode: 200 },
      );

    cy.visit('/organizations/6983ac22f2bb469189311ab21e493359/invitations/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('waldur/auth/token', 'valid');
      },
    }).waitForPage();
  });

  it('Allows to invite to users with different roles', () => {
    cy.get('.card-table button')
      .contains('Invite user')
      .click()
      .get('.invitation-create-dialog')
      .contains('Invite by email')
      .should('be.visible');

    // Testing "add" and "remove" user row buttons
    // Adding 3 more rows
    cy.get('#emails-list-group')
      .next()
      .find('button.btn-icon')
      .click()
      .click()
      .click();
    // Removing one of them
    cy.get('#emails-list-group table td')
      .find('button.btn-icon')
      .last()
      .click();

    // Filling the fields
    fillUserRowFields({
      index: 0,
      email: invitationRequestBodies['owner@test.com'].email,
      civilNumber: 'EE34501234215',
      role: ['Organization owner'],
    });
    fillUserRowFields({
      index: 1,
      email: invitationRequestBodies['manager@test.com'].email,
      civilNumber: 'EE35501234215',
      role: ['Project manager', 'OpenStack'],
    });
    fillUserRowFields({
      index: 2,
      email: invitationRequestBodies['administrator@test.com'].email,
      civilNumber: 'EE36501234215',
      role: ['System administrator', 'Azure'],
    });

    cy.get('.invitation-create-dialog')
      // Go to message step
      .contains('button', 'Continue')
      .click()

      .get('.invitation-create-dialog textarea[name="extra_invitation_text"]')
      .type('Testing invite users')

      .get('.invitation-create-dialog')
      .contains('button', 'Send invitation')
      .click()
      .wait('@createInvitation')

      .get('.invitation-create-dialog')
      .contains('Success')
      .should('be.visible')

      // Check the requests
      .get('@createInvitation.all')
      .then((xhrs: any) => {
        xhrs.forEach((xhr) => {
          const requestBody = invitationRequestBodies[xhr.request.body.email];
          cy.wrap(requestBody).should('not.be.empty');
          cy.wrap(xhr.request.body).should('deep.equal', requestBody);
        });
      });

    // Check status
    cy.get('.invitation-create-dialog')
      .contains('Sending status')
      .should('be.visible')
      .next()
      .should('include.text', 'Completed')
      .next()
      .should('include.text', 'Admin')
      .next()
      .should('include.text', '2021-11-12')
      .next()
      .should('include.text', '2021-11-19');

    // Allows to send more invitations
    cy.get('.invitation-create-dialog')
      .contains('button', 'Send more')
      .click()
      .get('.invitation-create-dialog')
      .contains('Invite by email')
      .should('be.visible')

      // Close the dialog
      .get('.invitation-create-dialog')
      .contains('button', 'Cancel')
      .click()
      .get('.invitation-create-dialog')
      .should('not.exist');
  });

  it('Can select all the toggle buttons in Invitations component', () => {
    //select rejection toggle button
    cy.selectTableFilter('State', 'Rejected').wait('@pendingRejected');
  });

  it('Resend invitation', () => {
    cy.get('td .dropdown')
      .first()
      .find('button.dropdown-toggle')
      .click()
      .get('.dropdown-menu')
      .contains('Resend')
      .click()
      .get('[role="alert"]')
      .contains('Invitation has been sent again.');
  });

  it('Cancel invitation', () => {
    cy.get('td .dropdown')
      .first()
      .find('button.dropdown-toggle')
      .click()
      .get('.dropdown-menu')
      .contains('Cancel')
      .click()
      .get('[role="alert"]')
      .contains('Invitation has been canceled.');
  });
});
