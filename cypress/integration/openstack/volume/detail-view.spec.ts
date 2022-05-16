describe('OpenStack Volume detail view', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/marketplace-categories/', {
        fixture: 'marketplace/categories.json',
      })
      .intercept(
        'GET',
        '/api/openstacktenant-volumes/df15b1f2dc7c445cadb2996594b0a6c3/',
        {
          fixture: 'openstack/openstacktenant-volume.json',
        },
      )
      .as('getOpenstackTenantVolume')
      .intercept('GET', '/api/openstacktenant-instances/**', {
        fixture: 'openstack/openstacktenant-instances.json',
      })
      .intercept('GET', '/api/marketplace-cart-items/', {
        fixture: 'offerings/shoppingCartItem.json',
      })
      .intercept('GET', '/api/openstacktenant-snapshots/', [])
      .intercept('GET', '/api/projects/**', {
        fixture: 'projects/alice_azure.json',
      })
      .intercept('GET', '/api/customers/', {
        fixture: 'marketplace/anderson_and_sons.json',
      })

      .log('Visit OpenStackTenant Volume detail view')
      .visit(
        '/projects/5d3016240ccf4181b4cdc0baa0e41d5c/resources/OpenStackTenant.Volume/df15b1f2dc7c445cadb2996594b0a6c3/',
      )
      .get('.loading-title')
      .should('not.exist')
      .waitForSpinner();
  });

  it('Attaches OpenStack Volume to Instance', () => {
    cy.log('Open "Attach OpenStack Volume to Instance" dialog')
      .get('[data-cy=actions-dropdown-btn]')
      .click({ force: true })
      .wait('@getOpenstackTenantVolume')
      .wait(500)
      .get('ul.dropdown-menu a')
      .contains('Attach')
      .click({ force: true })

      .log('Select an option of Instance field')
      .get('div[class$="placeholder"]')
      .first()
      .click()
      .selectTheFirstOptionOfDropdown()

      .log('Submit the form')
      .get('button[type=submit]')
      .click();
  });
});
