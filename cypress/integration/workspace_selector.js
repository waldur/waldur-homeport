const getTextList = $p =>
  $p.map((i, el) => Cypress.$(el).text().trim()).get();

describe('Workspace selector', () => {
  beforeEach(() => {
    cy.login();
    cy.openWorkspaceSelector();
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
          'Dave Lebowski',
          'Erin Lebowski',
          'Frank Lebowski',
          'Gus Lebowski',
          'Harry Lebowski',
          'Lebowski Ltd.',
          'Walter Lebowski',
          'Zed Lebowski',
        ])
      );
  });

  it('Allows to filter projects by name', () => {
    cy
      // Select first available organization
      .get('.list-group-item').first().click()

      // Filter projects by name
      .get('input[placeholder="Filter projects"]').type('SaaS')

      // Get filtered project rows
      .get('.list-group').last().find('.list-group-item div')

      // Only matching projects should be present
      .should($p => expect(getTextList($p)).to.deep.eq(['SaaS']));
  });

  it('Allows to go switch to organization workspace', () => {
    cy
      // Click on first available organization
      .get('.list-group-item a').contains('Select').click()

      // Workspace selector indicates organization workspace
      .get('.select-workspace-toggle.btn-primary');
  });

  it.only('Allows to go switch to project workspace', () => {
    cy
      // Select first available organization
      .get('.list-group-item').first().click()

      // Click on first available project
      .get('.list-group').last().find('.list-group-item a').contains('Select').click()

      // Workspace selector indicates project workspace
      .get('.select-workspace-toggle.btn-success');
  });
});
