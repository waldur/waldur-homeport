describe('OpenStackInstanceCreateForm', () => {
  beforeEach(() => {
    cy
      .server()
      .mockUser()
      .mockCustomer()
      .login()
      .visitInstanceCreateForm()
      .waitForSpinner();
  });

  it('should create OpenStack virtual machine', () => {
    cy
      .route({
        url: 'http://localhost:8080/api/marketplace-cart-items/',
        method: 'POST',
        response: 'fixture:offerings/shoppingCartItem.json',
      })
      .route('http://localhost:8080/api/marketplace-cart-items/', 'fixture:offerings/shoppingCartItem.json')
      .get('input[name="attributes.name"]').type('OpenStack instance')
      .openSelectDialog('image', 'CentOS 7 64bit')
      .openSelectDialog('flavor', 'm1.little')

      // Open dropdown for project selector
      .get('.Select-placeholder').first().click()

      // Select first project
      .get('.Select-option').first().click()

      .get('button').contains('Add to cart').click();
  });

  it('should render order summary table if flavor is selected', () => {
    cy
      .openSelectDialog('image', 'CentOS 7 64bit')
      .openSelectDialog('flavor', 'm1.little')
      .get('.table-bordered').should('be.visible').contains('m1.little');
  });

  it('should initialize system volume size based on selected flavor', () => {
    cy
      .openSelectDialog('image', 'CentOS 7 64bit')
      .openSelectDialog('flavor', 'm1.little')
      .get('input[name="attributes.system_volume_size"]').should('have.value', '10');
  });

  it('should keep "Add to cart" button disabled if required fields are not selected', () => {
    cy
      .buttonShouldBeDisabled('.btn-sm')
      .get('input[name="attributes.name"]').type('OpenStack instance')
      .buttonShouldBeDisabled('.btn-sm')
      .openSelectDialog('image', 'CentOS 7 64bit')
      .buttonShouldBeDisabled('.btn-sm')
      .openSelectDialog('flavor', 'm1.little')

      // Open dropdown for project selector
      .get('.Select-placeholder').first().click()

      // Select first project
      .get('.Select-option').first().click()

      .get('.btn-sm').should('not.have.class', 'disabled');
  });
});
