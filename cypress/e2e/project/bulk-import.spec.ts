describe('Bulk import of projects', () => {
  beforeEach(() => {
    cy.mockUser('admin');
    cy.mockCustomer();
    cy.setToken();
    cy.intercept('GET', '/api/customers/a3d37c773142465aa03cf16f0cb5eeeb/?*', { fixture: 'projects/imported_customer.json' });
    cy.intercept('POST', '/api/projects/').as('createProject');
    cy.visit('/projects/');
  });

  it('should open bulk import dialog and import projects only', () => {
    cy.contains('Bulk import').click();

    cy.contains('Import type').should('be.visible');
    cy.contains('Next').click();

    cy.contains('Next').click();

    cy.contains('Next').click();

    cy.contains('Click to upload').click();
    cy.get('input[type="file"]').selectFile('cypress/fixtures/projects/bulk_import_projects.csv', { force: true });
    cy.contains('Next').click();

    cy.contains('Import & create').click();

    cy.contains('Successfully imported').should('be.visible');
  });
});