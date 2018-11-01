const getTextList = $p =>
  $p.map((i, el) => Cypress.$(el).text().trim()).get();

describe('Workspace selector', () => {
  beforeEach(() => {
    cy
      .server()
      .mockUser()
      .mockCustomer()
      .route('http://localhost:8080/api/customers/?**', 'fixture:customers/alice_bob_web.json')
      .route('http://localhost:8080/api/projects/**', 'fixture:projects/alice_azure.json')
      .route('http://localhost:8080/api/quotas/**/history/**', [])
      .login()
      .openWorkspaceSelector();
  });

  it('Lists all organizations by default', () => {
    cy
      // Get filtered organization rows
      .get('.list-group-item div')

      // Only matching organizations should be present
      .should($p =>
        expect(getTextList($p)).to.deep.eq([
          'Alice Lebowski',
          'Bob Lebowski',
          'Web Services',
        ])
      );
  });

  it('Allows to filter organizations by name', () => {
    cy
      // Enter query in organization list filter
      .get('input[placeholder="Filter organizations"]').type('lebowski')

      // Get filtered organization rows
      .get('.list-group-item div')

      // Only matching organizations should be present
      .should($p =>
        expect(getTextList($p)).to.deep.eq([
          'Alice Lebowski',
          'Bob Lebowski',
        ])
      );
  });

  it('Allows to filter projects by name', () => {
    cy
      // Select first available organization
      .get('.list-group-item').first().click()

      // Filter projects by name
      .get('input[placeholder="Filter projects"]').type('OpenStack')

      // Get filtered project rows
      .get('.list-group').last().find('.list-group-item div')

      // Only matching projects should be present
      .should($p => expect(getTextList($p)).to.deep.eq(['OpenStack Alice project']));
  });

  it('Allows to go switch to organization workspace', () => {
    cy
      // Click on first available organization
      .get('.list-group-item a').contains('Select').click()

      // Workspace selector indicates organization workspace
      .get('.select-workspace-toggle.btn-primary');
  });

  it('Allows to go switch to project workspace', () => {
    cy
      // Select first available organization
      .get('.list-group-item').first().click()

      // Click on first available project
      .get('.list-group').last().find('.list-group-item a').contains('Select').click()

      // Workspace selector indicates project workspace
      .get('.select-workspace-toggle.btn-success');
  });
});
