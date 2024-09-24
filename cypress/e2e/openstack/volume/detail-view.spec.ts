describe('OpenStack Volume detail view', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockCustomers()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/marketplace-categories/', {
        fixture: 'marketplace/categories.json',
      })
      .intercept(
        'GET',
        '/api/marketplace-resources/53b9bda915ab4dc0aac93a8f4fe83d30/',
        { fixture: 'openstack/resource-openstack-volume.json' },
      )
      .intercept(
        'GET',
        '/api/marketplace-resources/53b9bda915ab4dc0aac93a8f4fe83d30/details/',
        { fixture: 'openstack/openstack-volume.json' },
      )
      .intercept(
        'GET',
        '/api/openstack-volumes/df15b1f2dc7c445cadb2996594b0a6c3/',
        { fixture: 'openstack/openstack-volume.json' },
        )
      .as('getOpenstackTenantVolume')
      .intercept('GET', '/api/openstack-instances/**', {
        fixture: 'openstack/openstack-instances.json',
      })
      .intercept(
        'GET',
        '/api/marketplace-resources/53b9bda915ab4dc0aac93a8f4fe83d30/offering',
        { fixture: 'offerings/openstackVolume.json' },
      )
      .intercept('GET', '/api/marketplace-cart-items/**', {
        fixture: 'offerings/shoppingCartItem.json',
      })
      .intercept('GET', '/api/openstack-snapshots/', [])
      .intercept('GET', '/api/projects/**', {
        fixture: 'projects/alice_azure.json',
      })
      .intercept('GET', '/api/customers/bf6d515c9e6e445f9c339021b30fc96b', {
        fixture: 'marketplace/anderson_and_sons.json',
      })

      .log('Visit OpenStackTenant Volume detail view')
      .visit(
        '/resource-details/53b9bda915ab4dc0aac93a8f4fe83d30',
      )
      .get('.public-dashboard-hero-body');
  });

  it('Attaches OpenStack Volume to Instance', () => {
    cy.log('Open "Attach OpenStack Volume to Instance" dialog')
      .get('button')
      .contains('Actions')
      .click()
      .get('.dropdown-item')
      .contains('Attach')
      .click({ force: true })

      .log('Select an option of Instance field')
      .openDropdownByLabel('Instance')
      .selectTheFirstOptionOfDropdown()

      .log('Submit the form')
      .get('.modal-dialog button[type=submit]')
      .click();
  });
});
