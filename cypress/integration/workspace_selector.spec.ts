const getTextList = ($p) =>
  $p.map((i, el) => Cypress.$(el).text().trim()).get();

xdescribe('Workspace selector', () => {
  beforeEach(() => {
    cy.intercept('HEAD', '/api/customers/', {
      headers: {
        'x-result-count': '3',
      },
    });
    cy.intercept('GET', '/api/customers/?', (req) => {
      if (req.url.indexOf('lebowski') !== -1) {
        req.reply({
          fixture: 'customers/lebowski.json',
          headers: {
            'x-result-count': '2',
          },
        });
      } else {
        req.reply({
          fixture: 'customers/alice_bob_web.json',
          headers: {
            'x-result-count': '3',
          },
        });
      }
    })
      .mockUser()
      .intercept('GET', '/api/projects/6f3ae6f43d284ca196afeb467880b3b9/', {
        fixture: 'projects/alice_azure.json',
      })
      .intercept('GET', '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/', {
        fixture: 'customers/alice.json',
      })
      .setToken()
      .visit('/profile/')
      .openWorkspaceSelector();
  });

  it('Lists all organizations by default', () => {
    cy.contains('button', 'Select an organization...')
      .click()
      // Get filtered organization rows
      .get('.organization-list-item .title')

      // Only matching organizations should be present
      .should(($p) =>
        expect(getTextList($p)).to.deep.eq([
          'Alice Lebowski',
          'Bob Lebowski',
          'Web Services',
        ]),
      );
  });

  it('Allows to filter organizations by name', () => {
    cy.contains('button', 'Select an organization...')
      .click()
      // Enter query in organization list filter
      .get('input[placeholder="Search for organization...')
      .type('lebowski')

      // Get filtered organization rows
      .get('.organization-list-item .title')

      // Only matching organizations should be present
      .should(($p) =>
        expect(getTextList($p)).to.deep.eq(['Alice Lebowski', 'Bob Lebowski']),
      );
  });

  it('Allows to filter projects by name', () => {
    cy.contains('button', 'Select an organization...')
      .click()
      // Select first available organization
      .get('.organization-list-item')
      .first()
      .click()

      // Filter projects by name
      .get('input[placeholder="Filter projects"]')
      .type('OpenStack')

      // Get filtered project rows
      .get('.project-list-item .title')

      // Only matching projects should be present
      .should(($p) =>
        expect(getTextList($p)).to.deep.eq(['OpenStack Alice project']),
      );
  });

  it('Allows to go switch to project workspace', () => {
    cy.contains('button', 'Select an organization...')
      .click()
      // Select first available organization
      .get('.organization-list-item')
      .contains('Alice Lebowski')
      .click({ force: true })

      // Select last available project
      .get('.projects-table a')
      .last()
      .contains('Select')
      .click();
  });
});
