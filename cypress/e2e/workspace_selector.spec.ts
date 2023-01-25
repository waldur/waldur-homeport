const getTextList = ($p) =>
  $p.map((i, el) => Cypress.$(el).text().trim()).get();

describe('Workspace selector', () => {
  beforeEach(() => {
    cy.intercept('HEAD', '/api/customers/**', {
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
      // waiting until the page loaded, so that we can click on the popup
      .waitForPage()
      .get('h2:contains(Alice Lebowski)')
      .should('be.visible');

    // opening popup
    cy.get('div[class="symbol symbol-50px"]')
      .trigger('mouseover', { force: true })
      .get('i[class="fa fa-angle-right display-5 fw-light"]')
      .click({ force: true, multiple: true })
      .get('#quick-selector-search-box')
      .should('be.visible');
  });

  it('Lists all organizations by default', () => {
    cy.get('span[class="title lh-1"]')
      .click({
        force: true,
        multiple: true,
      })
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
    cy
      // Enter query in the search input to search for organization
      .get('#quick-selector-search-box')
      .focus()
      .type('Bob', { force: true })
      // Get filtered organization rows
      .get('span[class="title lh-1"]')
      .get('span[class="highlight-color"]')

      // Only matching organizations should be present
      .should(($p) => expect(getTextList($p)).to.deep.eq(['Bob']));
  });

  it('Allows to filter projects by name', () => {
    cy
      // Enter query in the search input to search for project
      .get('#quick-selector-search-box')
      .focus()
      .type('Openstack', {
        force: true,
      })

      // There is a bug in Cypress - it doesn't show the projects before we hover on organizations - so firstly we need to hover on organizations
      .get('span[class="title lh-1"]')
      .contains('Alice')
      .click({ force: true })

      // And now we get filtered project rows
      .get('span[class="title ellipsis"]')
      .contains('OpenStack')

      // Only matching projects should be present
      .should(($p) =>
        expect(getTextList($p)).to.deep.eq(['OpenStack Alice project']),
      );
  });

  it('Allows to go switch to organization dashboard', () => {
    cy.get('.organization-listing')
      // Click on first available organization
      .get('span[class="title lh-1"]')
      .contains('Alice')
      .trigger('mouseover', { force: true })
      .get('span[class="title lh-1"]')
      .contains('Alice')
      .click({ force: true });

    // wait for the organization menu and dashboard
    cy.get('.aside-menu .menu-item:contains(Organization)')
      .should('have.class', 'here')
      .get('h2:contains(Alice Lebowski)')
      .should('be.visible');
  });

  it('Allows to go switch to project dashboard', () => {
    cy.get('.organization-listing')
      // Select first available organization
      .get('span[class="title lh-1"]')
      .contains('Alice')
      .trigger('mouseover', { force: true });

    // Click on OpenStack offering
    cy.get('.project-listing span[class="title ellipsis"]')
      .contains('OpenStack')
      .click({ force: true });

    // wait for the project menu and dashboard
    cy.get('.aside-menu .menu-item:contains(Project)')
      .should('have.class', 'here')
      .get('h2:contains(Azure Alice project)')
      .should('be.visible');
  });

  it('Assure that View my organizations button leads to correct page', () => {
    cy.get('.quick-project-selector')
      .contains('a', 'View my organizations')
      .click();

    // Wait until page loaded
    cy.get('.header h1')
      .should('contain', 'Alice Lebowski')
      .get('.header small')
      .should('contain', 'Affiliations > Organizations');
  });

  it('Assure that View my projects button leads to correct page', () => {
    cy.get('.quick-project-selector').contains('a', 'View my projects').click();

    // Wait until page loaded
    cy.get('.header h1')
      .should('contain', 'Alice Lebowski')
      .get('.header small')
      .should('contain', 'Affiliations > Projects');
  });

  it('Assure that View all organizations button leads to correct page', () => {
    cy.get('.quick-project-selector')
      .contains('a', 'View all organizations')
      .click();

    // Wait until page loaded
    cy.get('.header h1')
      .should('contain', 'Administration')
      .get('.header small')
      .should('contain', 'Organizations');
  });

  it('Assure that View all projects button leads to correct page', () => {
    cy.get('.quick-project-selector')
      .contains('a', 'View all projects')
      .click();

    // Wait until page loaded
    cy.get('.header h1')
      .should('contain', 'Administration')
      .get('.header small')
      .should('contain', 'Projects');
  });
});
