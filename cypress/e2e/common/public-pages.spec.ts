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
      .visit('/marketplace/');
  });

  it('Assure that landing page is visible without auth token', () => {
    cy.get('.marketplace-landing-page:contains(Marketplace)').should(
      'be.visible',
    );
  });

  it('Assure that public offering page is visible without auth token', () => {
    // Ensure that the offering we want to click is 'Test request-based item'
    cy.get('.offering-card').contains('Test request-based item').click();

    // Wait until page loaded
    cy.get('.publicOfferingDetails', { timeout: 5000 }).should(
      'contain',
      'Test request-based item',
    );
  });

  it('Assure that public category page is visible without auth token', () => {
    // Ensure that the category we want to click is 'HPC'
    cy.get('.category-card').contains('HPC').click();

    // Wait until page loaded
    cy.get('.marketplace-category-page .category-hero__main', {
      timeout: 5000,
    }).should('contain', 'HPC');
  });

  it('Assure that public all categories page is visible without auth token', () => {
    // Ensure that the category we want to click is 'Browse all'
    cy.get('.category-card').contains('Browse all').click();

    // Wait until page loaded
    cy.get('.marketplace-all-categories-page .all-categories__main', {
      timeout: 5000,
    }).should('contain', 'All categories');
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
      .intercept('GET', '/views/tos/index.html', '<h2>Terms of Services</h2>')
      .intercept(
        'GET',
        '/views/policy/privacy.html',
        '<h2>Privacy Policy</h2>',
      );
  });

  it('Assure that TOS page is visible without auth token', () => {
    cy.visit('/tos/');

    cy.get('h2:contains(Terms of Services)').should('be.visible');
  });

  it('Assure that PP page is visible without auth token', () => {
    cy.visit('/policy/privacy/');

    cy.get('h2:contains(Privacy Policy)').should('be.visible');
  });
});
