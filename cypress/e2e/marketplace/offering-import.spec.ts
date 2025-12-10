describe('Offering Import', () => {
  beforeEach(() => {
    // Handle uncaught exceptions from react-select-async-paginate
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('react-select-async-paginate')) {
        return false;
      }
      return true;
    });

    cy.mockUser()
      .setToken()
      .intercept('GET', '/api/customers/6983ac22f2bb469189311ab21e493359/', {
        fixture: 'customers/alice.json',
      })
      .intercept('GET', 'api/customer-credits/**', {
        data: [],
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
          (item: any) => item.uuid === '31384bb20db94b3ca113c9d15caeba1a',
        );
        cy.intercept(
          'GET',
          '/api/marketplace-public-offerings/31384bb20db94b3ca113c9d15caeba1a/',
          offering,
        );
      },
    );
    cy.intercept('GET', '/api/marketplace-service-providers/**/revenue/**', [])
      .intercept('GET', '/api/marketplace-categories/**', {
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

  it('should show import option in table actions', () => {
    // Find the table header dropdown actions
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').should('be.visible');
  });

  it('should open import wizard', () => {
    // Open dropdown and click import
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').click({ force: true });

    // Should show modal with wizard
    cy.get('.modal').should('be.visible');
    cy.get('.modal-header').should('contain', 'Import offering');

    // Should show step 1: File upload
    cy.contains('Upload offering file').should('be.visible');
  });

  it('should validate and accept valid YAML file', () => {
    // Open import dialog
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').click({ force: true });

    // Upload valid file
    cy.fixture('offerings/valid-offering-export.yaml', 'utf-8').then(
      (fileContent) => {
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(fileContent),
            fileName: 'test-offering.yaml',
            mimeType: 'text/yaml',
          },
          { force: true },
        );
      },
    );

    // Should show validation success
    cy.contains('Test Import Offering', { timeout: 5000 }).should('be.visible');

    // Should enable Next button
    cy.get('button').contains('Next').should('not.be.disabled');
  });

  it('should reject invalid YAML file', () => {
    // Open import dialog
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').click({ force: true });

    // Upload invalid file
    cy.fixture('offerings/invalid-offering-export.yaml', 'utf-8').then(
      (fileContent) => {
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(fileContent),
            fileName: 'invalid-offering.yaml',
            mimeType: 'text/yaml',
          },
          { force: true },
        );
      },
    );

    // Should show validation error
    cy.contains('Invalid YAML format', { timeout: 5000 }).should('be.visible');

    // Should keep Next button disabled
    cy.get('button').contains('Next').should('be.disabled');
  });

  it.skip('should reject file that is too large', () => {
    // Open import dialog
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').click({ force: true });

    // Create a file larger than 10MB
    const largeContent = 'x'.repeat(11 * 1024 * 1024);

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(largeContent),
        fileName: 'large-offering.yaml',
        mimeType: 'text/yaml',
      },
      { force: true },
    );

    // Should show size error
    cy.contains('File size must be less than 10MB', { timeout: 5000 }).should(
      'be.visible',
    );
  });

  it('should complete full import wizard flow', () => {
    cy.intercept(
      'POST',
      '/api/marketplace-provider-offerings/import_offering/',
      {
        statusCode: 200,
        body: {
          imported_offering_uuid: 'new-offering-uuid-123',
          message: 'Offering imported successfully',
        },
      },
    ).as('importRequest');

    // Open import dialog
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').click({ force: true });

    // Step 1: Upload file
    cy.fixture('offerings/valid-offering-export.yaml', 'utf-8').then(
      (fileContent) => {
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(fileContent),
            fileName: 'test-offering.yaml',
            mimeType: 'text/yaml',
          },
          { force: true },
        );
      },
    );

    cy.contains('Test Import Offering', { timeout: 5000 }).should('be.visible');
    cy.get('button').contains('Next').click();

    // Step 2: Configure import
    cy.contains('Configure import').should('be.visible');
    cy.get('#check-import_components').should('be.checked');
    cy.get('#check-import_plans').should('be.checked');
    cy.get('button').contains('Next').click();

    // Step 3: Review
    cy.contains('Review and confirm').should('be.visible');
    cy.contains('test-offering.yaml').should('be.visible');
    cy.contains('Components').should('be.visible');
    cy.contains('Plans').should('be.visible');

    // Submit import
    cy.get('button').contains('Import').click();

    // Should trigger import API call
    cy.wait('@importRequest');

    // Should show success message
    cy.contains('Offering imported successfully').should('be.visible');

    // Should redirect to offering update page
    cy.url().should('include', '/offering-update/new-offering-uuid-123');
  });

  it('should handle import errors gracefully', () => {
    cy.intercept(
      'POST',
      '/api/marketplace-provider-offerings/import_offering/',
      {
        statusCode: 400,
        body: {
          detail: 'Offering with this name already exists',
        },
      },
    ).as('importRequest');

    // Open and go through wizard quickly
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').click({ force: true });

    cy.fixture('offerings/valid-offering-export.yaml', 'utf-8').then(
      (fileContent) => {
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(fileContent),
            fileName: 'test-offering.yaml',
            mimeType: 'text/yaml',
          },
          { force: true },
        );
      },
    );

    cy.contains('Test Import Offering', { timeout: 5000 }).should('be.visible');
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Import').click();

    cy.wait('@importRequest');

    // Should show error message
    cy.contains('Unable to import offering').should('be.visible');
    cy.contains('Offering with this name already exists').should('be.visible');
  });

  it.skip('should allow navigating back through wizard steps', () => {
    // Open import dialog
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').click({ force: true });

    cy.fixture('offerings/valid-offering-export.yaml', 'utf-8').then(
      (fileContent) => {
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(fileContent),
            fileName: 'test-offering.yaml',
            mimeType: 'text/yaml',
          },
          { force: true },
        );
      },
    );

    cy.contains('Test Import Offering', { timeout: 5000 }).should('be.visible');
    cy.get('button').contains('Next').click();

    // Should be on step 2
    cy.contains('Configure import').should('be.visible');

    // Go back
    cy.get('button').contains('Back').click();

    // Should be back on step 1
    cy.contains('Upload offering file').should('be.visible');
    // File info should still be visible
    cy.contains('Test Import Offering').should('be.visible');
  });

  it('should allow clearing uploaded file', () => {
    // Open import dialog
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').click({ force: true });

    cy.fixture('offerings/valid-offering-export.yaml', 'utf-8').then(
      (fileContent) => {
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(fileContent),
            fileName: 'test-offering.yaml',
            mimeType: 'text/yaml',
          },
          { force: true },
        );
      },
    );

    cy.contains('Test Import Offering', { timeout: 5000 }).should('be.visible');

    // Click the trash/clear button
    cy.get('button.attachment-item__delete').should('exist').click();

    // File should be cleared
    cy.contains('Test Import Offering').should('not.exist');

    // Should show upload area again
    cy.contains('Click to upload').should('be.visible');
  });

  it.skip('should show loading state during file validation', () => {
    // Open import dialog
    cy.get('.card-toolbar')
      .find('.dropdown-toggle')
      .click({ force: true });

    cy.get('.dropdown-menu').contains('Import offering').click({ force: true });

    // Add a delay to validation to catch loading state
    cy.fixture('offerings/valid-offering-export.yaml', 'utf-8').then(
      (fileContent) => {
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(fileContent),
            fileName: 'test-offering.yaml',
            mimeType: 'text/yaml',
          },
          { force: true },
        );
      },
    );

    // Should show loading spinner
    cy.get('.spinner-border').should('be.visible');
    cy.contains('Validating file...').should('be.visible');

    // Eventually validation completes
    cy.contains('Test Import Offering', { timeout: 5000 }).should('be.visible');
    cy.get('.spinner-border').should('not.exist');
  });
});
