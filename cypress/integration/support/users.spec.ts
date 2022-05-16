describe('Users', () => {
  beforeEach(() => {
    cy.mockChecklists()

      .intercept('GET', '/api/configuration/', {
        fixture: 'support/configuration.json',
      })
      .intercept('GET', '/api/customer-permissions/', [])
      .intercept('GET', '/api/project-permissions/', [])
      .intercept('GET', '/api/events/', [])

      .intercept('GET', '/api/users/me/', {
        fixture: 'support/me.json',
      })

      .intercept(
        'GET',
        '/api/users/?page=1&page_size=10&full_name=Tara%20Pierce',
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept(
        'GET',
        '/api/users/?page=1&page_size=10&username=0024c6a7885940bbb156e82073bc0244',
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept(
        'GET',
        '/api/users/?page=1&page_size=10&organization=Howard-Martin',
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept('GET', '/api/users/?page=1&page_size=10&is_staff=true', {
        fixture: 'support/users.json',
      })

      .intercept('GET', '/api/users/?page=1&page_size=10&role=&status=true', {
        fixture: 'support/users.json',
      })

      .intercept(
        'GET',
        '/api/users/?page=1&page_size=10&email=TaraPierce%40example.com',
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept('GET', '/api/users/?page=1&page_size=10', {
        fixture: 'support/users.json',
      })
      .as('getUsers')

      .setToken()

      .visit('/support/users/')
      .waitForSpinner();
  });

  it('renders title', () => {
    cy.get('.page-title h1').contains('Users').should('exist');
  });

  it('renders user items', () => {
    cy.get('table tbody tr').should('have.length', 10);
  });

  it('should full name search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('button')
        .contains('Filter')
        .click()
        .get('input[name=full_name]')
        .type('Tara Pierce')
        .get('.spinner-container > .fa')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should username search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('button')
        .contains('Filter')
        .click()
        .get('input[name=username]')
        .type('0024c6a7885940bbb156e82073bc0244')
        .get('.spinner-container > .fa')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should organization search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('button')
        .contains('Filter')
        .click()
        .get('input[name=organization]')
        .type('Howard-Martin')
        .get('.spinner-container > .fa')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should email search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('button')
        .contains('Filter')
        .click()
        .get('input[name=email]')
        .type('TaraPierce@example.com')
        .get('.spinner-container > .fa')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should search works correctly using account role', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('button')
        .contains('Filter')
        .click()
        .openDropdownByLabel('Role')
        .selectTheFirstOptionOfDropdown()
        .get('table tbody tr')
        .should('have.length', 10);
    });
  });

  it('should search works correctly using account status', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('button')
        .contains('Filter')
        .click()
        .openDropdownByLabel('Status')
        .get('*div[id^="react-select"]')
        .eq(1)
        .click({ force: true })
        .get('table tbody tr')
        .should('have.length', 10);
    });
  });

  it('should open details modal when click details button', () => {
    cy.contains('button', 'Details')
      .click()
      .get('.modal-title')
      .contains('User details of Tara Pierce')
      .should('be.visible', true)
      .get('.modal-footer > .btn')
      .click();
  });
});
