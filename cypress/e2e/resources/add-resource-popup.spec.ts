const openQuickAddResourcePopupAndSelectAnOffering = (
  category: string,
  offering: string,
) => {
  cy.get('nav[class="aside aside-dark aside-hoverable"]')
    .should('be.visible')
    .trigger('mouseover', { force: true })
    .get('i[class="fa fa-plus fs-2"]')
    .click()
    .waitForSpinner()
    .get('.category-listing .list-group-item span.title')
    .contains(category)
    .click({ force: true })
    .waitForSpinner()
    .get('.offering-listing .list-group-item h6.title')
    .contains(offering)
    .click({ force: true })
    .waitForSpinner()
    .get('#kt_content_container')
    .contains('h1', 'Add ' + offering)
    .should('be.visible');
};

describe('Add resource pop up is visible', { testIsolation: false }, () => {
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
  xit('shows add resource popup', () => {
    cy.visit('/profile/').waitForPage();

    cy.get('i.fa.fa-spinner')
      .should('not.exist')
      .get('nav[class="aside aside-dark aside-hoverable"]')
      .should('be.visible')
      .trigger('mouseover', { force: true })
      .get('i[class="fa fa-plus fs-2"]')
      .should('be.visible')
      .click()
      .get('i.fa.fa-spinner')
      .should('not.exist')
      .get('i[class="fa fa-plus fs-2"]')
      .click()
      .get('#marketplaces-selector')
      .get('p:contains(Select root category)')
      .should('be.visible');
  });

  it('Project context: Assure that selecting resources from resource quick creation form works', () => {
    // Go to profile page once
    cy.visit('/profile/').waitForPage();

    // selecting an organization
    cy.get('div[class="symbol symbol-50px"]')
      .trigger('mouseover', { force: true })
      .get('[data-cy=context-selector-toggle]')
      .click({ force: true, multiple: true })
      .get('#quick-selector-search-box')
      .should('be.visible');

    // Select first available organization
    cy.get('.organization-listing .list-group-item p.title')
      .contains('Alice')
      .trigger('mouseover', { force: true })
      // Click on OpenStack offering
      .get('.project-listing .list-group-item p.title')
      .contains('OpenStack')
      .click({ force: true });

    // wait for the project menu and dashboard
    cy.get('h2:contains(Azure Alice project)')
      .should('be.visible');

    // Check from project page
    openQuickAddResourcePopupAndSelectAnOffering('HPC', 'Another offering');
  });

  it('Profile context: Assure that selecting resources from resource quick creation form works', () => {
    cy.get('[data-cy=user-dropdown-trigger]')
      .click()
      .get('[data-cy=user-dropdown-menu]')
      .contains('.menu-link', 'Dashboard')
      .click()
      .waitForSpinner();

    openQuickAddResourcePopupAndSelectAnOffering('HPC', 'Another offering');
  });

  it('Reporting context: Assure that selecting resources from resource quick creation form works', () => {
    cy.clickSidebarMenuItem('Reporting');
    openQuickAddResourcePopupAndSelectAnOffering('HPC', 'Another offering');
  });

  it('Support context: Assure that selecting resources from resource quick creation form works', () => {
    cy.clickSidebarMenuItem('Support');
    openQuickAddResourcePopupAndSelectAnOffering('HPC', 'Another offering');
  });

  it('Administration context: Assure that selecting resources from resource quick creation form works', () => {
    cy.clickSidebarMenuItem('Administration');
    openQuickAddResourcePopupAndSelectAnOffering('HPC', 'Another offering');
  });

  xit('Provider context: Assure that selecting resources from resource quick creation form works', () => {
    cy.clickSidebarMenuItem('Organization');
    cy.get('.nav-tabs .nav-item button:contains(Service provider)')
      .should('exist')
      .click();
    openQuickAddResourcePopupAndSelectAnOffering('HPC', 'Another offering');
  });

  xit('Organization context: Assure that selecting resources from resource quick creation form works', () => {
    cy.clickSidebarMenuItem('Organization');
    openQuickAddResourcePopupAndSelectAnOffering('HPC', 'Another offering');
  });

  xit('Resources context: Assure that selecting resources from resource quick creation form works', () => {
    cy.clickSidebarMenuItem('Resources', 'All resources')
      .get('#kt_content_container .card-title')
      .should('contain', 'All resources');
    openQuickAddResourcePopupAndSelectAnOffering('HPC', 'Another offering');
  });
});
