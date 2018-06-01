describe('Customer creation toggle', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Allows to create customer from user dashoard', () => {
    cy.openCustomerCreateDialog();
  });

  it('Allows to create customer from workspace selector', () => {
    cy
      .openWorkspaceSelector()

      // Click on "Add new organization" button
      .get('#add-new-organization').click()

      // Modal dialog should be displayed
      .get('.modal-title').contains('Create organization');
  });
});

describe('Customer creation dialog', () => {
  beforeEach(() => {
    cy.login();
    cy.openCustomerCreateDialog();
  });

  it('Validates required fields', () => {
    cy
      // Try to switch to next step
      .get('button span').contains('Next').click()

      // Error message should be displayed
      .get('p.text-danger').should('have.length', 2);
  });

  it.only('Accepts valid values', () => {
    cy
      // Enter organization name
      .get('input[name="name"]').type('ABC')

      // Enter organization email
      .get('input[name="email"]').type('contact@abc.com')

      // Enter organization phone
      .get('input[name="phone_number"]').type('+1234567890')

      // Open dropdown for organization type selector
      .get('.ui-select-container').click()

      // Select first organization type
      .get('.ui-select-choices-row').first().click()

      // Go to the next step
      .get('button span').contains('Next').click()

      // Last step should be active
      .get('.steps li').last().should('have.class', 'current')

      // Enter organization registration code
      .get('input[name="registration_code"]').type('EE1234567')

      // Enter organization address
      .get('input[name="address"]').type('London, UK, Baker street, 10')

      // Enter organization postal code
      .get('input[name="postal"]').type('1234567')

      // Submit form
      .get('button span').contains('Finish').click()

      // Notification should be shown
      .get('.alert.alert-success').contains('Organization has been created.')

      // Workspace selector indicates organization workspace
      .get('.select-workspace-toggle.btn-primary')

      // Workspace selector should indicate new organization name
      .get('#select-workspace-title').contains('ABC');
  });
});
