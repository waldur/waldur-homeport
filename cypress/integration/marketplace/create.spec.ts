describe('Offering creation', () => {
  beforeEach(() => {
    cy.server()
      .mockCustomer()
      .mockUser()
      .login()

      .log('Visit Marketplace Offering Create')
      .route(
        'http://localhost:8080/api/marketplace-categories/',
        'fixture:marketplace/categories.json',
      )
      .route(
        'http://localhost:8080/api/marketplace-plugins/',
        'fixture:marketplace/plugins.json',
      )
      .route({
        url: 'http://localhost:8080/api/marketplace-offerings/',
        method: 'POST',
        response: {},
      })
      .visit(
        '/organizations/bf6d515c9e6e445f9c339021b30fc96b/marketplace-offering-create/',
      )
      .waitForSpinner();
  });

  it('allows to create new offering', () => {
    cy
      // Overview step
      .get('input[name="name"]')
      .type('My offering')

      .get('button[type="button"]')
      .contains('Browse')

      .log('Go to Description step')
      .get('button')
      .contains('Next')
      .click()

      // Description step
      .log('Select the first option of category field')
      .openDropdownByLabel('Category')
      .selectTheFirstOptionOfDropdown()

      .openDropdownByLabel('Certification')
      .selectTheFirstOptionOfDropdown()

      .log('Go to Management step')
      .get('.step-title')
      .get('button')
      .contains('Next')
      .click()

      // Management step
      .log('Select management type')
      .openDropdownByLabel('Type')
      .selectTheFirstOptionOfDropdown()

      .log('Add user input field')
      .get('button')
      .contains('Add user input field')
      .click()

      .get('input[name="options[0].name"]')
      .type('intName')

      .get('input[name="options[0].label"]')
      .type('displayName')

      // Select "Type" of "user input field" form
      .get('label:contains(Type)') // yields 2 fields: ype for 1. management and 2. "user input field" section
      .last() // access Type field for "user input field" section
      .next()
      .find('div[class$="placeholder"]')
      .click({ force: true })
      // do the same like in force mode
      .get('label:contains(Type)')
      .last()
      .next()
      .find('div[class$="placeholder"]')
      .click({ force: true })
      .selectTheFirstOptionOfDropdown()

      .log('Go to Accounting step')
      .get('button')
      .contains('Next')
      .click()

      // Accounting step
      .log('Add component')
      .get('button')
      .contains('Add component')
      .click()

      .get('input[name="components[0].type"]')
      .type('internalName')

      .get('input[name="components[0].name"]')
      .type('displayName')

      // Select the first option of "Accounting type" dropdown of "Add component" form
      .openDropdownByLabelForce('Accounting type')
      .selectTheFirstOptionOfDropdown()

      .log('Add plan')
      .get('button')
      .contains('Add plan')
      .click()

      .get('input[name="plans[0].name"]')
      .type('my plan name')

      // Select the first option of "Billing period" dropdown of 'Add plan" form
      .openDropdownByLabelForce('Billing period')
      .selectTheFirstOptionOfDropdown()

      .get('input[name="plans[0].prices.internalName"]')
      .type('1')

      .log('Go to Review step')
      .get('button')
      .contains('Next')
      .click()

      // Review step
      .get('td')
      .contains('My offering')

      .get('p')
      .contains('Request-based item')

      .get('p')
      .contains('HPC')

      .get('p')
      .contains('my plan name')

      .get('td')
      .contains('displayName')

      .get('tr > td')
      .contains('1') // price of plan

      .get('button[type="submit"]')
      .contains('Submit')
      .click()

      // Ensure that a user is redirected to offerings list page after successfully submitting the form
      .location()
      .should((loc) => {
        expect(loc.href).to.eq(
          'http://localhost:8001/organizations/bf6d515c9e6e445f9c339021b30fc96b/marketplace-offerings/',
        );
      });
  });
});
