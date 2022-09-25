const getTextList = ($p) =>
  $p.map((i, el) => Cypress.$(el).text().trim()).get();

describe('Workspace selector', () => {
  beforeEach(() => {
    cy
    .intercept('HEAD', '/api/customers/', {
      headers: {
        'x-result-count': '3',
      },
    });
    cy.intercept('GET', '/api/customers/**', (req) => {
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
      .mockChecklists()
      .mockEvents()
      .mockPermissions()
      .intercept('GET', '/api/marketplace-categories/**', [])
      .intercept('GET', '/api/projects/6f3ae6f43d284ca196afeb467880b3b9/', {
        fixture: 'projects/alice_azure.json',
      })
      .intercept('GET', '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/', {
        fixture: 'customers/alice.json',
      })
      .setToken()
      .visit('/profile/')
  });

  it('Lists all organizations by default', () => {
    cy
      .get('span[class="title lh-1"]')
      .click(
        {
          force: true, 
          multiple: true
        }
      )
      // Only matching organizations should be present
      .should(($p) =>
        expect(getTextList($p)).to.deep.eq(
          [
            'Alice Lebowski',
            'Bob Lebowski',
            'Web Services'
          ]
        ),
      );
  });

  it('Allows to filter organizations by name', () => {
    cy
      // Enter query in organization list filter
      .get('input[placeholder="Search..."]')
      .focus()
      .type('Bob', {force: true})
      // Get filtered organization rows
      .get('span[class="title lh-1"]')
      .contains('Bob')
      .click(
        {
          force: true
        }
      )

      // Only matching organizations should be present
      .should(($p) =>
        expect(getTextList($p)).to.deep.eq(
          [
            'Bob Lebowski'
          ]
        ),
      );
  });

  it('Allows to filter projects by name', () => {
    cy
      // Enter query in projects list filter
      .get('input[placeholder="Search..."]')
      .focus()
      .type('Openstack', {
          force: true
        }
      )

      // There is a bug in Cypress - it doesn't show the projects before we hover on organizations - so firstly we need to hover on organizations  
      .get('span[class="title lh-1"]')
      .contains('Alice')
      .click({force: true})
      
      // And now we get filtered project rows
      .get('span[class="title ellipsis"]')
      .contains('OpenStack')

      // Only matching projects should be present
      .should(($p) =>
        expect(getTextList($p)).to.deep.eq(
          [
            'OpenStack Alice project'
          ]
        ),
      );
  });

  it('Allows to go switch to project workspace', () => {
    cy
      .get('.organization-listing')

      // Select first available organization
      .get('span[class="title lh-1"]')
      .contains('Alice')
      .click({force: true})

      // Select last available project
      .get('.project-listing')
      .get('.list-group')
      .last()
      .click({force: true});

  });
});
