Cypress.Commands.add('openSelectDialog', (selectId, option) => {
  cy
    .get(`a#${selectId}`).click()
    .get('td').contains(option).click()
    .get('.btn-primary').contains('Select').click();
});

Cypress.Commands.add('visitInstanceCreateForm', () => {
  cy
    .route('http://localhost:8080/api/marketplace-plugins/', 'fixture:offerings/marketplacePlugins.json')
    .route('http://localhost:8080/api/marketplace-orders/**', [])
    .route('http://localhost:8080/api/marketplace-offerings/**', 'fixture:offerings/openstackInstance.json')
    .route('http://localhost:8080/api/marketplace-categories/**', 'fixture:offerings/offeringCategory.json')
    .route('http://localhost:8080/api/service-settings/**', 'fixture:offerings/serviceSettings.json')
    .route('http://localhost:8080/api/openstacktenant-images/**', 'fixture:offerings/images.json')
    .route('http://localhost:8080/api/openstacktenant-flavors/**', 'fixture:offerings/flavors.json')
    .route('http://localhost:8080/api/keys/**', 'fixture:offerings/sshKeys.json')
    .route('http://localhost:8080/api/openstacktenant-security-groups/**', 'fixture:offerings/securityGroups.json')
    .route('http://localhost:8080/api/openstacktenant-subnets/**', 'fixture:offerings/subnets.json')
    .route('http://localhost:8080/api/openstacktenant-floating-ips/**', 'fixture:offerings/floatingIps.json')
    .route('http://localhost:8080/api/openstacktenant-instance-availability-zones/**', [])
    .visit('/#/organizations/bf6d515c9e6e445f9c339021b30fc96b/marketplace-offering/3bcdcdb0987545f0b50e6eed26bb49d6/');
});

Cypress.Commands.add('buttonShouldBeDisabled', btnClass =>
  cy.get(btnClass).should('have.class', 'disabled')
);
