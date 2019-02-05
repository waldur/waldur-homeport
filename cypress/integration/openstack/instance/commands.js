Cypress.Commands.add('openSelectDialog', (selectId, option) => {
  cy
    .get(`a#${selectId}`).click()
    .get('td').contains(option).click()
    .get('.btn-primary').contains('Select').click();
});

Cypress.Commands.add('visitInstanceCreateForm', () => {
  cy
    .log('visit /organizations/bf6d515c9e6e445f9c339021b30fc96b/marketplace-offering/3bcdcdb0987545f0b50e6eed26bb49d6/')
    .route('http://localhost:8080/api/marketplace-offerings/3bcdcdb0987545f0b50e6eed26bb49d6/**', 'fixture:offerings/openstackInstance.json')
    .route('http://localhost:8080/api/marketplace-categories/f392e562d0954b609fa42b828e77bd2d/**', 'fixture:offerings/offeringCategory.json')
    .route('http://localhost:8080/api/service-settings/671f2f1f45f146cfb94a5ab1d0506162/**', 'fixture:offerings/serviceSettings.json')
    .route('http://localhost:8080/api/openstacktenant-images/**', 'fixture:offerings/images.json')
    .route('http://localhost:8080/api/openstacktenant-flavors/**', 'fixture:offerings/flavors.json')
    .route('http://localhost:8080/api/keys/**', 'fixture:offerings/sshKeys.json')
    .route('http://localhost:8080/api/openstacktenant-security-groups/**', 'fixture:offerings/securityGroups.json')
    .route('http://localhost:8080/api/openstacktenant-subnets/**', 'fixture:offerings/subnets.json')
    .route('http://localhost:8080/api/openstacktenant-floating-ips/**', 'fixture:offerings/floatingIps.json')
    .visit('/#/organizations/bf6d515c9e6e445f9c339021b30fc96b/marketplace-offering/3bcdcdb0987545f0b50e6eed26bb49d6/', {log: false});
});

Cypress.Commands.add('buttonShouldBeDisabled', btnClass =>
  cy.get(btnClass).should('have.class', 'disabled')
);
