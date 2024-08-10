const openUpdateDialog = (label: string) => {
  cy.get('.card .table')
    .contains('tr th:first-child', label)
    .parent()
    .find('td:last-child .btn')
    .click();
};

const closeUpdateDialog = () => {
  cy.get('.modal').contains('button', 'Cancel').click();
};

const getInputField = (field: string, type: 'input' | 'textarea' = 'input') => {
  return cy.get(`.modal ${type}[name="${field}"]`);
};

describe('User manage', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .intercept('GET', '/api/support-templates/', [])
      .intercept('PATCH', '/api/users/3a836bc76e1b40349ec1a0d8220f374f/', {
        fixture: 'users/alice.json',
      })
      .intercept('HEAD', '/api/customers/', [])
      .intercept(
        'GET',
        '/api/marketplace-categories/?field=uuid&field=title&has_offerings=true',
        [],
      )
      .intercept('GET', '/api/customers/**', [])
      .setToken()
      .visit('/profile/manage/');
  });

  it('allows to update user details', () => {
    cy.fixture('users/alice.json').then((user) => {
      // Ensure that first_name input field is present
      openUpdateDialog('First name');
      getInputField('first_name').should('have.value', user.first_name);
      closeUpdateDialog();

      // Ensure that Change email button is present
      openUpdateDialog('Email');
      cy.get('.modal-footer button:contains(Request change)').should(
        'be.disabled',
      );
      cy.get('.modal input[type="email"]').type('example@test.com');
      cy.get('.modal-footer button:contains(Request change)')
        .should('not.be.disabled')
        .click();

      // Ensure that last name input field is present
      openUpdateDialog('Last name');
      getInputField('last_name').should('have.value', user.last_name);
      closeUpdateDialog();

      // Ensure that organization input field is present
      openUpdateDialog('Organization name');
      getInputField('organization')
        .should('have.value', user.organization || '')
        // Adding text to ensure that 'discard' and 'save changes' buttons appear
        .type('abc');
      cy.get('.modal-footer button:contains(Submit)')
        .should('not.be.disabled')
        .click();

      // Ensure that job_title input field is present
      openUpdateDialog('Job position');
      getInputField('job_title').should('have.value', user.job_title);
      closeUpdateDialog();

      // Ensure that description input field is present
      openUpdateDialog('Description');
      getInputField('description', 'textarea').should(
        'have.value',
        user.description,
      );
      closeUpdateDialog();

      // Ensure that phone_number input field is present
      openUpdateDialog('Phone number');
      getInputField('phone_number').should('have.value', user.phone_number);
      closeUpdateDialog();

    // Ensure that Request deletion button works
    /*.get('input[type="checkbox"]')
      .last()
      .click()
      .get('button')
      .contains('Request deletion')
      .click()

      // Close remove profile dialog
      .get('button')
      .contains('Cancel')
      .last()
      .click()

      // Ensure that Discard button exists and works
      .get('button')
      .contains('Discard')
      .click()*/
    });
  });
});
