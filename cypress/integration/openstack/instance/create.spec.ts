describe('OpenStackInstanceCreateForm', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockCustomer()
      .setToken()
      .intercept('GET', '/api/marketplace-plugins/', {
        fixture: 'offerings/marketplacePlugins.json',
      })
      .intercept('GET', '/api/marketplace-orders/', [])
      .intercept('GET', '/api/marketplace-offerings/', {
        fixture: 'offerings/openstackInstance.json',
      })
      .intercept('GET', '/api/marketplace-categories/', {
        fixture: 'offerings/offeringCategory.json',
      })
      .intercept('GET', '/api/service-settings/', {
        fixture: 'offerings/serviceSettings.json',
      })
      .intercept('GET', '/api/openstacktenant-images/', {
        fixture: 'offerings/images.json',
      })
      .intercept('GET', '/api/openstacktenant-flavors/', {
        fixture: 'offerings/flavors.json',
      })
      .intercept('GET', '/api/keys/', { fixture: 'offerings/sshKeys.json' })
      .intercept('GET', '/api/openstacktenant-security-groups/', {
        fixture: 'offerings/securityGroups.json',
      })
      .intercept('GET', '/api/openstacktenant-subnets/', {
        fixture: 'offerings/subnets.json',
      })
      .intercept('GET', '/api/openstacktenant-floating-ips/', {
        fixture: 'offerings/floatingIps.json',
      })
      .intercept('GET', '/api/openstacktenant-instance-availability-zones/', [])
      .intercept('GET', '/api/openstacktenant-volume-types/', [])
      .visit(
        '/organizations/bf6d515c9e6e445f9c339021b30fc96b/marketplace-offering/3bcdcdb0987545f0b50e6eed26bb49d6/',
      )
      .waitForSpinner();
  });

  it('should create OpenStack virtual machine', () => {
    cy.intercept('POST', '/api/marketplace-cart-items/', {
      fixture: 'offerings/shoppingCartItem.json',
    })
      .intercept('GET', '/api/marketplace-cart-items/', {
        fixture: 'offerings/shoppingCartItem.json',
      })
      .get('input[name="attributes.name"]')
      .type('openstack-instance')
      .openSelectDialog('image', 'CentOS 7 64bit')
      .openSelectDialog('flavor', 'm1.little')

      // Open dropdown for project selector
      .get('div[class$="placeholder"]')
      .first()
      .click()
      .selectTheFirstOptionOfDropdown()

      .get('button')
      .contains('Add to cart')
      .click();
  });

  it('should render order summary table if flavor is selected', () => {
    cy.openSelectDialog('image', 'CentOS 7 64bit')
      .openSelectDialog('flavor', 'm1.little')
      .get('input[name="attributes.name"]')
      .type('openstack-instance')

      // Open dropdown for project selector
      .get('div[class$="placeholder"]')
      .first()
      .click()
      .selectTheFirstOptionOfDropdown()

      .get('.table-bordered')
      .should('be.visible')
      .contains('m1.little');
  });

  it('should initialize system volume size based on selected flavor', () => {
    cy.openSelectDialog('image', 'CentOS 7 64bit')
      .openSelectDialog('flavor', 'm1.little')
      .get('input[name="attributes.system_volume_size"]')
      .should('have.value', '10');
  });

  it('should keep "Add to cart" button disabled if required fields are not selected', () => {
    cy.buttonShouldBeDisabled('.btn-sm.btn-primary')
      .get('input[name="attributes.name"]')
      .type('openstack-instance')
      .buttonShouldBeDisabled('.btn-sm.btn-primary')
      .openSelectDialog('image', 'CentOS 7 64bit')
      .buttonShouldBeDisabled('.btn-sm.btn-primary')
      .openSelectDialog('flavor', 'm1.little')

      // Open dropdown for project selector
      .get('div[class$="placeholder"]')
      .first()
      .click()
      .selectTheFirstOptionOfDropdown()

      .get('.btn-sm.btn-primary')
      .should('not.have.attr', 'disabled');
  });
});
