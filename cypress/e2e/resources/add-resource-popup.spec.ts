describe('Add resource pop up is visible', { testIsolation: false }, () => {
  beforeEach(() => {
    cy.intercept('HEAD', '/api/customers/**', {
      headers: {
        'x-result-count': '3',
      },
    })
      .intercept('GET', '/api/customers/**', (req) => {
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
      .intercept('GET', '/api/marketplace-category-groups/', [])
      .intercept('GET', '/api/projects/6f3ae6f43d284ca196afeb467880b3b9/', {
        fixture: 'projects/alice_azure.json',
      })
      .intercept('GET', '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/', {
        fixture: 'customers/alice.json',
      })
      .mockUser('admin')
      .mockChecklists()
      .mockEvents()
      .intercept('GET', '/api/marketplace-categories/**', {
        fixture: 'marketplace/categories.json',
      })
      .intercept('GET', '/api/marketplace-public-offerings/**', {
        fixture: 'marketplace/offerings.json',
      });

    // Requests for offering deploy page
    cy.fixture('marketplace/offerings.json')
      .then((offerings) => {
        const offering = offerings.find(
          (item) => item.uuid === '46b6c5ab2f854df1a87ffd39b9d767c6',
        );
        cy.intercept(
          'GET',
          '/api/marketplace-public-offerings/46b6c5ab2f854df1a87ffd39b9d767c6/',
          offering,
        );
      })
      .intercept('GET', '/api/marketplace-plugins/', {
        fixture: 'offerings/marketplacePlugins.json',
      })
      .fixture('marketplace/categories.json')
      .then((categories) => {
        const category = categories[0]; // HPC
        cy.intercept(
          'GET',
          '/api/marketplace-categories/56e45986252244218bd062149fc3b5b5/',
          category,
        );
      });

    cy.setToken();
    // waiting until the page loaded, so that we can click on the popup
  });

  xit('Assure that selecting resources from resource quick creation form works', () => {
    cy.visit('/profile/')
      .waitForSpinner()
      .get('nav[class="aside aside-dark aside-hoverable"]')
      .should('be.visible')
      .trigger('mouseover', { force: true })
      .get('i[class="fa fa-plus fs-2"]')
      .click()
      .waitForSpinner()
      .get('.category-listing .list-group-item span.title')
      .contains('HPC')
      .click({ force: true })
      .waitForSpinner()
      .get('.offering-listing .list-group-item h6.title')
      .contains('Another offering')
      .click({ force: true })
      .waitForSpinner()
      .get('#kt_content_container')
      .contains('h1', 'Add ' + 'Another offering')
      .should('be.visible');
  });
});
