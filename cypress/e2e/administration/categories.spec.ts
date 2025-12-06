describe('Categories', () => {
  before(() => cy.setToken());
  beforeEach(() => {
    cy.mockUser();

    cy.fixture('marketplace/categories.json').then((categories) => {
      const category = categories.find(
        (item) => item.uuid === '4588ff519260461893ab371b8fe83363',
      );
      cy.intercept(
        'GET',
        '/api/marketplace-categories/4588ff519260461893ab371b8fe83363/',
        category,
      );
    });
    cy.intercept(
      'PUT',
      '/api/marketplace-categories/4588ff519260461893ab371b8fe83363/',
      {
        statusCode: 200,
        body: {
          url: '/api/marketplace-categories/4588ff519260461893ab371b8fe83363/',
          uuid: '4588ff519260461893ab371b8fe83363',
          title: 'HPC',
          description: 'High Performance Computing',
          default_vm_category: true,
        },
      },
    )
      .as('updateCategory')

      .visit('/administration/categories/')
      .waitForPage();
  });

  it('Allows update a category', () => {
    cy.get('.card-table td .dropstart')
      .first()
      .find('button.dropdown-toggle')
      .click()
      .get('body > .dropdown-menu .dropdown-item')
      .contains('Edit')
      .click({ force: true });

    cy.get('.modal')
      .should('be.visible')

      .get('.modal-header')
      .should('contain', 'Edit HPC')

      .get('.modal-footer button')
      .contains('Edit')
      .should('be.disabled');

    cy.get('.modal-body .form-switch')
      .contains('Default vm category')
      .parent()
      .find('input')
      .should('not.be.checked')
      .click()
      .should('be.checked')

      .get('.modal-footer button')
      .contains('Edit')
      .click()
      .wait('@updateCategory')

      // Notification should be shown
      .get("[data-testid='notification']")
      .contains('The category has been updated.')

      // Assure modal is closed
      .get('.modal')
      .should('not.exist');

    // Check again the updated field
    cy.get('.card-table td .dropstart')
      .first()
      .find('button.dropdown-toggle')
      .click()
      .get('body > .dropdown-menu .dropdown-item')
      .contains('Edit')
      .click({ force: true })

      .get('.modal')
      .should('be.visible');

    cy.get('.modal-body .form-switch')
      .contains('Default vm category')
      .parent()
      .find('input')
      .should('be.checked');
  });
});
