describe('User manage', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .intercept('GET', '/api/support-templates/', [])
      .intercept('PATCH', '/api/users/3a836bc76e1b40349ec1a0d8220f374f/', {
        fixture: 'users/alice.json',
      })
      .setToken()
      .visit('/profile/manage/');
  });

  it('allows to update user details', () => {
    cy
      // Ensure that full_name input field is present
      .get('input[name="full_name"]')

      // Ensure that Change email button is present
      .get('button')
      .contains('Change email')
      .click()
      // Close dialog
      .get('button')
      .contains('Cancel')
      .click()

      // Ensure that organization input field is present
      .get('input[name="organization"]')

      // Ensure that job_title input field is present
      .get('input[name="job_title"]')

      // Ensure that description input field is present
      .get('input[name="description"]')

      // Ensure that phone_number input field is present
      .get('input[name="phone_number"]')

      // Ensure that token input field is present
      .get('input[name="token"]')

      // Ensure that token_lifetime input field is present
      .get('input[name="token_lifetime"]')

      // Ensure that Remove profile button works
      .get('button')
      .contains('Remove profile')
      .click()
      // Close remove profile dialog
      .get('button:contains(Cancel)')
      .last()
      .click()

      // Ensure that Update profile button works
      .get('button')
      .contains('Update profile')
      .click()

      // Ensure that link to terms of services is present
      .get('a')
      .contains('Terms of Service')
      .click();
  });
});
