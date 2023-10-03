describe('Offerings list actions in Provider dashboard page', () => {

    beforeEach(() => {
        cy.mockUser()
        .setToken()
        .intercept('GET', '/api/customers/6983ac22f2bb469189311ab21e493359/', {
            fixture: 'customers/alice.json',
        })
        .intercept('GET', '/api/marketplace-service-providers/**/stat/', { 
            fixture: 'marketplace/service_providers_stat.json' ,
        })
        .intercept('GET', '/api/marketplace-offering-permissions/**', [])
        .intercept('GET', '/api/marketplace-service-providers/**/?customer_uuid=*', {
            fixture: 'marketplace/service_providers.json',
        })
        .intercept('GET', '/api/projects/?customer=*', {
            fixture: 'customers/alice.json',
        })
        .intercept('GET', '/api/projects/93628b21533e4314a38bdcdfdf903ccb/counters/', {
            fixture: 'projects/alice_azure.json',
        })
        .intercept('GET', '/api/marketplace-service-providers/**/offerings/**', {
            fixture: 'marketplace/service_provider_offerings.json',
        })
        .intercept('GET', '/api/marketplace-service-providers/**/revenue/**', [])
        .visit('/providers/6983ac22f2bb469189311ab21e493359/dashboard/')
        .waitForSpinner()
    }
    );

    it('edit action should redirect to provider\'s offering update page', () => {
        cy.get('td .dropdown')
        .first()
        .contains('Actions')
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
        .contains('Actions')
        .click({ force: true })
        .get('.dropdown-item')
        .contains('Preview order form')
        .click({ force: true });

        cy.get('.modal').should('be.visible');

        cy.get('.modal-header').should('contain', 'Preview offering');

        cy.get('.modal-body').within(() => {
            cy.get('form').should('be.visible');
            cy.get('form').within(() => {
                cy.get('label').should('contain', 'Project');
            });
        });

        cy.get('.modal-footer button')
        .contains('Cancel')
        .click();

        cy.get('.modal').should('not.exist');
    });

    it('open public page action should redirect to public-offering', () => {
        cy.get('td .dropdown')
        .first()
        .contains('Actions')
        .click({ force: true })
        .get('.dropdown-item')
        .contains('Open public page')
        .click({ force: true });

        cy.url().should('include', '/marketplace-public-offering/');
    });

});
