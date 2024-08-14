describe('Public marketplace pages', () => {
  beforeEach(() => {
    cy.mockConfigs().mockChecklists();

    cy.intercept('GET', '/api/users/me/', {
      statusCode: 401,
    })
      .intercept('GET', '/api/customers/', [])
      .intercept('GET', '/api/marketplace-categories/**', {
        fixture: 'marketplace/categories.json',
      })
      .intercept('GET', '/api/marketplace-public-offerings/**', {
        fixture: 'marketplace/offerings.json',
      })
      .intercept(
        'GET',
        '/api/marketplace-public-offerings/36b6c5ab2f854df1a87ffd39b9d767c6/',
        {
          fixture: 'offerings/publicInstance.json',
        },
      )
      .intercept(
        'GET',
        '/api/marketplace-categories/06e45986252244218bd062149fc3b5b5/',
        {
          fixture: 'offerings/offeringCategory.json',
        },
      )
      .intercept(
        'GET',
        '/api/marketplace-categories/4588ff519260461893ab371b8fe83363/',
        {
          fixture: 'offerings/hpcCategory.json',
        },
      )
      .intercept('GET', '/api/marketplace-category-groups/', [])
      .visit('/marketplace/');
  });

  it('Assure that landing page is visible without auth token', () => {
    cy.get('.marketplace-landing-page:contains(Marketplace)').should(
      'be.visible',
    );
  });

  it('Assure that public offering page is visible without auth token', () => {
    // Ensure that the offering we want to click is 'Test request-based item'
    cy.get('.offering-card:contains("Test request-based item")')
      .contains('a', 'View offering')
      .click();
  });

  it('Assure that public category page is visible without auth token', () => {
    // Ensure that the category we want to click is 'HPC'
    cy.get('.category-card').contains('HPC').click();

    // Wait until page loaded
    cy.contains('h1', 'HPC');
  });
});

describe('Public calls for proposals pages', () => {
  beforeEach(() => {
    cy.mockConfigs().mockChecklists();

    cy.intercept('GET', '/api/users/me/', {
      statusCode: 401,
    })
      .intercept('GET', '/api/customers/', [])
      .intercept('GET', '/api/marketplace-categories/**', {
        fixture: 'marketplace/categories.json',
      })
      .intercept('GET', '/api/marketplace-public-offerings/**', {
        fixture: 'marketplace/offerings.json',
      })
      .intercept('GET', '/api/proposal-public-calls/**', {
        fixture: 'calls/public-calls.json',
      })
      .intercept(
        'GET',
        '/api/proposal-public-calls/3b8fc588d37f434eabc68d2a0b4a4bbe/',
        {
          fixture: 'calls/public-call.json',
        },
      )
      .visit('/calls-for-proposals/');
  });

  it('Assure that calls landing page is visible without auth token', () => {
    cy.get('h1').should('contain', 'Calls for proposals');
    cy.get('#kt_content_container .card-table .card-title').should(
      'contain',
      'Open calls',
    );
    cy.get('#kt_content_container .card-table .card-title').should(
      'contain',
      'Available offerings',
    );
  });

  it('Assure that public call page is visible without auth token', () => {
    cy.get('.card .card-title:contains("Open calls")')
      .parents('.card')
      .within(() => {
        cy.get('.model-card-1 .card-title:contains("Long time call")')
          .parents('.model-card-1')
          .contains('a', 'View call')
          .click();
      });

    cy.url()
      .should('include', '/calls/3b8fc588d37f434eabc68d2a0b4a4bbe')
      .get('.breadcrumb-item')
      .should('contain', 'Long time call')
      .get('button')
      .contains('Apply to round');
  });

  it('Assure that all calls page is visible without auth token', () => {
    cy.get('.toolbar .menu-link').contains('All calls').click();
    cy.get('h1').should('contain', 'Calls for proposals');
    cy.get('#kt_content_container .card-table table tbody tr').should(
      'have.length',
      1,
    );
  });

  it('Assure that available offerings page is visible without auth token', () => {
    cy.get('#kt_content_container')
      .contains('a.btn', 'Available offerings')
      .click();
    cy.get('h1').should('contain', 'Available offerings');
    cy.get('#kt_content_container .card-table table tbody tr').should(
      'have.length',
      2,
    );
  });
});

describe('TOS and PP pages', () => {
  beforeEach(() => {
    cy.mockConfigs().mockChecklists();

    cy.intercept('GET', '/api/users/me/', {
      statusCode: 401,
    })
      .intercept('GET', '/api/customers/', [])
      .intercept('GET', '/api/marketplace-categories/', {
        fixture: 'marketplace/categories.json',
      })
      .intercept('GET', '/api/user-agreements/?agreement_type=TOS', {
        fixture: 'marketplace/user-agreement-tos.json',
      })
      .intercept('GET', '/api/user-agreements/?agreement_type=PP', {
        fixture: 'marketplace/user-agreement-pp.json',
      });
  });

  it('Assure that TOS page is visible without auth token', () => {
    cy.visit('/tos/');

    cy.get('span:contains(TOS)').should('be.visible');
  });

  it('Assure that PP page is visible without auth token', () => {
    cy.visit('/privacy/');

    cy.get('span:contains(PP)').should('be.visible');
  });
});
