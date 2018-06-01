// Login using UI
Cypress.Commands.add('login', function(username, password){
  username = username || 'staff';
  password = password || 'secret';

  const log = Cypress.log({
    name: 'login',
    message: [username, password],
    consoleProps: () => ({
      username,
      password,
    })
  });

  cy
    // Goto login page
    .visit('/', {log: false})

    // Ensure taht we're on login page
    .contains('Login', {log: false})

    // Type username
    .get('input[placeholder="Username"]', {log: false}).type(username, {log: false})

    // Type password
    .get('input[placeholder="Password"]', {log: false}).type(password, {log: false})

    // Press button to submit login form
    .get('button[type="submit"]', {log: false}).click({log: false})

    // We should be on the dashboard now
    .get('h2', {log: false}).contains('User dashboard', {log: false})
    .hash({log: false}).should('match', /profile/, {log: false})

    // Make DOM snapshot
    .then(function(){
      log.snapshot().end();
    });
});

Cypress.Commands.add('waitForSpinner', () => {
  cy.get('.fa-spinner.fa-spin').should('not.be.visible');
});

Cypress.Commands.add('openWorkspaceSelector', () => {
  cy
    // Workspace selector indicates user workspace
    .get('.select-workspace-toggle.btn-info')

    // Open workspace selector by clicking on button
    .contains('Select workspace').click()

    // Modal dialog should be displayed
    .get('.modal-content').should('be.visible')

    // Wait until dialog is loaded
    .waitForSpinner();
});

Cypress.Commands.add('openCustomerCreateDialog', () => {
  cy
    // Click on "Add organization" button
    .get('button').contains('Add organization').click()

    // Modal dialog should be displayed
    .get('.modal-title').contains('Create organization');
});
