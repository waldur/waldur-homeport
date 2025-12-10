describe('Offering Export', () => {
  beforeEach(() => {
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

  it('should show export option in actions dropdown', () => {
    cy.get('td .dropstart')
      .first()
      .find('button.dropdown-toggle')
      .click();

    cy.get('body > .dropdown-menu .dropdown-item')
      .contains('Export')
      .should('be.visible');
  });

  it('should open export dialog with options', () => {
    cy.intercept(
      'POST',
      '/api/marketplace-provider-offerings/*/export_offering/',
      {
        statusCode: 200,
        fixture: 'offerings/export-response.json',
      },
    ).as('exportRequest');

    cy.get('td .dropstart')
      .first()
      .find('button.dropdown-toggle')
      .click();

    cy.get('body > .dropdown-menu .dropdown-item')
      .contains('Export')
      .click({ force: true });

    // Should show export dialog
    cy.get('.modal').should('be.visible');
    cy.get('.modal-header').should('contain', 'Export offering');

    // Should have checkboxes for options
    cy.get('.modal-body').within(() => {
      cy.contains('Include components').should('be.visible');
      cy.contains('Include plans').should('be.visible');
      cy.contains('Include screenshots').should('be.visible');
      cy.contains('Include files').should('be.visible');
      cy.contains('Include access endpoints').should('be.visible');
    });
  });

  it('should export offering with selected options', () => {
    cy.intercept(
      'POST',
      '/api/marketplace-provider-offerings/*/export_offering/',
      {
        statusCode: 200,
        fixture: 'offerings/export-response.json',
      },
    ).as('exportRequest');

    cy.get('td .dropstart')
      .first()
      .find('button.dropdown-toggle')
      .click();

    cy.get('body > .dropdown-menu .dropdown-item')
      .contains('Export')
      .click({ force: true });

    // Select options (already checked by default, but verify)
    cy.get('#check-include_components').should('be.checked');
    cy.get('#check-include_plans').should('be.checked');

    // Click export
    cy.get('.modal-footer button').contains('Export').click();

    // Should trigger export API call
    cy.wait('@exportRequest').its('request.body').should('deep.include', {
      include_components: true,
      include_plans: true,
    });

    // Should show success message
    cy.contains('Offering exported successfully').should('be.visible');

    // Modal remains open (user needs to close it manually)
    cy.get('.modal').should('be.visible');
  });

  it('should handle export errors', () => {
    cy.intercept(
      'POST',
      '/api/marketplace-provider-offerings/*/export_offering/',
      {
        statusCode: 500,
        body: { detail: 'Export failed' },
      },
    ).as('exportRequest');

    cy.get('td .dropstart')
      .first()
      .find('button.dropdown-toggle')
      .click();

    cy.get('body > .dropdown-menu .dropdown-item')
      .contains('Export')
      .click({ force: true });

    cy.get('.modal-footer button').contains('Export').click();

    cy.wait('@exportRequest');

    // Should show error message
    cy.contains('Error while exporting offering').should('be.visible');
  });

  it('should allow canceling export dialog', () => {
    cy.get('td .dropstart')
      .first()
      .find('button.dropdown-toggle')
      .click();

    cy.get('body > .dropdown-menu .dropdown-item')
      .contains('Export')
      .click({ force: true });

    cy.get('.modal').should('be.visible');

    // Click cancel
    cy.get('.modal-footer button').contains('Cancel').click();

    // Modal should close
    cy.get('.modal').should('not.exist');
  });

  it('should disable export button while processing', () => {
    cy.intercept(
      'POST',
      '/api/marketplace-provider-offerings/*/export_offering/',
      {
        statusCode: 200,
        fixture: 'offerings/export-response.json',
        delay: 2000, // Add delay to test loading state
      },
    ).as('exportRequest');

    cy.get('td .dropstart')
      .first()
      .find('button.dropdown-toggle')
      .click();

    cy.get('body > .dropdown-menu .dropdown-item')
      .contains('Export')
      .click({ force: true });

    // Checkboxes are already checked by default, just click export
    cy.get('.modal-footer button').contains('Export').click();

    // Export button should be disabled during processing
    cy.get('.modal-footer button')
      .contains('Export')
      .should('be.disabled');
  });
});
