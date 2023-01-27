describe('Add resource pop up is visible', () => {
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
      .get('h1:contains(Alice Lebowski)')
      .should('be.visible')
      .get('i.fa.fa-spinner')
      .should('not.exist');
      // waiting until the page loaded, so that we can click on the popup
  });
  xit('shows add resource popup', () => {
    cy
      .get('i.fa.fa-spinner')
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
      .get("p:contains(Select root category)")
      .should('be.visible');
  });
});