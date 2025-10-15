const enterAndCheckCidrInput = (input, should: 'exist' | 'not.exist') => {
  cy.get('#step-internal-network input[name="attributes.subnet_cidr"]')
    .clear()
    .type(input, { delay: 0 })
    .get('#step-internal-network .text-danger')
    .should(should);
};

describe('VPC creation', () => {
  beforeEach(() => {
    cy.mockCustomer().mockUser().setToken();

    cy.intercept('GET', '/api/customers/**', {
      fixture: 'support/customers.json',
    })
      .fixture('projects/alice_azure.json')
      .then((project) => {
        cy.intercept('GET', '/api/projects/**', [project]);
      });
    cy.intercept('GET', '/api/marketplace-plugins/', {
      fixture: 'marketplace/plugins.json',
    })
      .intercept(
        'GET',
        '/api/marketplace-public-offerings/0873ed194daa4370a0f4bfcfebc9ad6a/',
        { fixture: 'offerings/openstackTenant.json' },
      )
      .intercept('GET', '/api/marketplace-offering-terms-of-service/**', [])
      .intercept('POST', '/api/marketplace-provider-offerings/', {})
      .as('createOrder')
      .visit('/marketplace-provider-offering/0873ed194daa4370a0f4bfcfebc9ad6a/')
      .waitForSpinner()
      .wait(1000);
  });

  it('Assure that the internal network step is visible', () => {
    // Check mask/CIDR input
    cy.get('#step-internal-network text-danger').should('not.exist');

    // Invalid inputs
    enterAndCheckCidrInput('192.168.42.0/15', 'exist');
    enterAndCheckCidrInput('192.168.42.0/33', 'exist');
    enterAndCheckCidrInput('192.168.256.0/30', 'exist');
    // Valid Class C
    cy.log('Class C Validation');
    enterAndCheckCidrInput('192.168.42.0/16', 'not.exist');
    enterAndCheckCidrInput('192.168.255.0/32', 'not.exist');
    enterAndCheckCidrInput('192.168.255.2/30', 'not.exist');
    // Valid Class B
    cy.log('Class B Validation');
    enterAndCheckCidrInput('172.16.42.0/12', 'not.exist');
    enterAndCheckCidrInput('172.16.255.0/32', 'not.exist');
    // Valid Class A
    cy.log('Class A Validation');
    enterAndCheckCidrInput('10.0.0.0/8', 'not.exist');
    enterAndCheckCidrInput('10.255.255.0/32', 'not.exist');
  });
});
