xdescribe('Invitations', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/customers/6983ac22f2bb469189311ab21e493359/', {
        fixture: 'customers/alice.json',
      })
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
        'api/user-invitations/?page=1&page_size=10&state=pending&customer=bf6d515c9e6e445f9c339021b30fc96b',
        {
          fixture: 'invitations/pending-customer.json',
        },
      )
      .intercept('POST', 'api/user-invitations/', {
        fixture: 'invitations/user-invitation.json',
      })
      .intercept(
        'GET',
        '/api/user-invitations/?page=1&page_size=10&state=pending&state=rejected&customer=bf6d515c9e6e445f9c339021b30fc96b',
        {
          fixture: 'invitations/pending-rejected-customers.json',
        },
      )
      .as('pendingRejected')
      .visit('/organizations/6983ac22f2bb469189311ab21e493359/team/')
      .get('.loading-title')
      .should('not.exist')
      .waitForSpinner()

      .get('#customer-team-tab-invitations')
      .contains('Invitations')
      .click();
  });

  it('Allows to invite to users as owner', () => {
    cy.get('button')
      .contains('Invite user')
      .click()
      .get('input[name="email"]')
      .type('test@test.com');

    cy
      //send invitation step
      .get('button[type="submit"]')
      .contains('Invite user')
      .click()

      //check successful
      .get('p')
      .contains('Invitation has been created.');
  });

  it('Allows to invite to users as Project Manager', () => {
    cy.get('button')
      .contains('Invite user')
      .click()
      .get('input[name="email"]')
      .type('test@test.com');

    cy
      //role selection
      .get('.fa-users')
      .click({ force: true })
      .get('.modal-body div')
      .contains('Select project')
      .type('OpenStack Alice project{enter}')

      //send invitation step
      .get('button[type="submit"]')
      .contains('Invite user')
      .click()

      //check successful
      .get('p')
      .contains('Invitation has been created.');
  });

  it('Allows to invite to users as System administrator', () => {
    cy.get('button')
      .contains('Invite user')
      .click()
      .get('input[name="email"]')
      .type('test@test.com');

    cy
      //role selection
      .get('.fa-server')
      .click({ force: true })
      .get('.modal-body div')
      .contains('Select project')
      .type('OpenStack Alice project{enter}')

      //send invitation step
      .get('button[type="submit"]')
      .contains('Invite user')
      .click()

      //check successful
      .get('p')
      .contains('Invitation has been created.');
  });

  it(`Can select all the toggle buttons in Invitations component`, () => {
    cy
      //select rejection toggle button
      .get('label')
      .contains('Rejected')
      .click()
      .wait('@pendingRejected');
  });

  it(`Resend invitation`, () => {
    cy.get('tr')
      .get('button')
      .contains('Resend')
      .click()
      .get('p')
      .contains('Invitation has been sent again.');
  });

  it(`Cancel invitation`, () => {
    cy.get('tr')
      .get('button')
      .contains('Cancel')
      .click()
      .get('p')
      .contains('Invitation has been canceled.');
  });
});
