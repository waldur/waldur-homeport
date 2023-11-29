describe('Organization tooltip', () => {
    beforeEach(() => {
        cy.mockUser()
        .intercept('GET', '/api/customers/', {
            fixture: 'customers/organization_tooltips.json',
        })
        .setToken()
        .visit('/profile/')
        .get('.loading-title')
        .should('not.exist')
        .waitForSpinner();
    });

    it('Tooltip visible if abbreviation is in displayed name', () => {
        // Click on "Aside toolbar" where current selected organization is shown
        cy.get('div[data-kt-menu-attach=".aside-toolbar"]').click({force: true}).wait(500)

        // Organizations, projects panels opens
        cy.get('div[class="scrollbar-view"]').should('be.visible')
        // in current CSS layout these "outer" divs do not have any other way to target them   
        .first().first()
        // has abbreviation
        .first().should('have.attr', 'title', 'NordiQuEst-demo')
        // no abbreviation
        .next().should('not.have.attr', 'title')
      });

})