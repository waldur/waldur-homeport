describe('Offerings list actions in Provider dashboard page', () => {
  beforeEach(() => {
    cy.mockUser()
      .setToken()
      .intercept('GET', '/api/customers/6983ac22f2bb469189311ab21e493359/', {
        fixture: 'customers/alice.json',
      })
      .intercept('GET', '/api/marketplace-service-providers/**/stat/', {
        fixture: 'marketplace/service_providers_stat.json',
      })
      .intercept('GET', '/api/marketplace-offering-permissions/**', [])
      .intercept(
        'GET',
        '/api/marketplace-service-providers/**/?customer_uuid=*',
        {
          fixture: 'marketplace/service_providers.json',
        },
      )
      .intercept('GET', '/api/projects/?customer=*', {
        fixture: 'customers/alice.json',
      })
      .intercept(
        'GET',
        '/api/projects/93628b21533e4314a38bdcdfdf903ccb/counters/',
        {
          fixture: 'projects/alice_azure.json',
        },
      )
      .intercept('GET', '/api/marketplace-service-providers/**/offerings/**', {
        fixture: 'marketplace/service_provider_offerings.json',
      });
    cy.fixture('marketplace/service_provider_offerings.json').then(
      (offerings) => {
        const offering = offerings.find(
          (item) => item.uuid === '31384bb20db94b3ca113c9d15caeba1a',
        );
        cy.intercept(
          'GET',
          '/api/marketplace-public-offerings/31384bb20db94b3ca113c9d15caeba1a/',
          offering,
        );
      },
    );
    cy.intercept('GET', '/api/marketplace-service-providers/**/revenue/**', [])
      .intercept('GET', '/api/marketplace-categories/', {
        fixture: 'marketplace/categories.json',
      })
      .intercept(
        'GET',
        '/api/marketplace-categories/4588ff519260461893ab371b8fe83363',
        {
          fixture: 'offerings/offeringCategory.json',
        },
      )
      .intercept('GET', '/api/marketplace-plugins/', {
        fixture: 'marketplace/plugins.json',
      })
      .visit('/providers/6983ac22f2bb469189311ab21e493359/offerings/')
      .waitForPage();
  });

  it("edit action should redirect to provider's offering update page", () => {
    cy.get('td .dropdown')
      .first()
      .find('button.dropdown-toggle')
      .click({ force: true })
      .get('.dropdown-item')
      .contains('Edit')
      .click({ force: true });

    const baseUrl = '/providers/';
    const offeringUpdateUrl = '/offering-update/';

    cy.url().should('include', baseUrl);
    cy.url().should('include', offeringUpdateUrl);
    cy.url().should('match', /\/providers\/[a-zA-Z0-9-]+\/offering-update\//);
  });

  it('preview order form action should open the preview offering modal', () => {
    cy.get('td .dropdown')
      .first()
      .find('button.dropdown-toggle')
      .click({ force: true })
      .get('table .dropdown-item')
      .contains('Preview order form')
      .click({ force: true });

    cy.get('.modal').should('be.visible');

    cy.get('.modal-header').should('contain', 'Preview offering');

    cy.get('.modal-body').within(() => {
      cy.get('form').should('be.visible');
      cy.get('form').within(() => {
        cy.get('h6').should('contain', 'Project');
      });
    });

    cy.get('.modal-footer button').contains('Cancel').click();

    cy.get('.modal').should('not.exist');
  });

  it('open public page action should redirect to public-offering', () => {
    cy.get('td .dropdown')
      .first()
      .find('button.dropdown-toggle')
      .click({ force: true })
      .get('table .dropdown-item')
      .contains('Open public page')
      .click({ force: true })
      .waitForPage();

    cy.url().should('include', '/marketplace-public-offering/');
    cy.get('h3').contains('basic offering');
  });
});
