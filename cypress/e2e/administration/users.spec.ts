describe('Users', () => {
  beforeEach(() => {
    cy.mockChecklists()
      .setAcceptCookies()

      .intercept('GET', '/api/configuration/', {
        fixture: 'support/configuration.json',
      })
      .intercept('GET', '/api/events/**', [])
      .intercept('GET', '/api/roles/**', { fixture: 'roles.json' })

      .intercept('GET', '/api/users/me/', {
        fixture: 'support/me.json',
      })

      .intercept('GET', '/api/customers/**', {
        fixture: 'support/customers.json',
      })
      .intercept({ pathname: '/api/users/' }, { fixture: 'support/users.json' })
      .as('getUsers')
      .intercept(
        {
          pathname: '/api/users/',
          query: {
            query: 'Tara Pierce',
          },
        },
        { fixture: 'support/user-search-by-name.json' },
      )

      .intercept(
        {
          pathname: '/api/users/',
          query: {
            query: '0024c6a7885940bbb156e82073bc0244',
          },
        },
        { fixture: 'support/user-search-by-name.json' },
      )

      .intercept(
        {
          pathname: '/api/users/',
          query: {
            customer_uuid: '895e38d197e748459189f19285119edf',
          },
        },
        { fixture: 'support/user-search-by-name.json' },
      )

      .intercept(
        {
          pathname: '/api/users/',
          query: {
            is_staff: 'true',
          },
        },
        { fixture: 'support/users.json' },
      )

      .intercept(
        {
          pathname: '/api/users/',
          query: {
            is_active: 'true',
          },
        },
        { fixture: 'support/users.json' },
      )

      .intercept(
        {
          pathname: '/api/users/',
          query: {
            query: 'TaraPierce@example.com',
          },
        },
        { fixture: 'support/user-search-by-name.json' },
      );

    cy.intercept('GET', '/api/marketplace-categories/**', [])
      .intercept('GET', '/api/marketplace-category-groups/**', [])
      .intercept('GET', '/api/marketplace-global-categories/**', [])
      .intercept('GET', '/api/admin-announcements/**', []);

    cy.fixture('support/user-search-by-name.json')
      .then((users) => {
        const user = users[0];
        cy.intercept(
          'GET',
          '/api/users/57223602e47648b0bef2da4c1d430f5f/',
          user,
        );
      })

      .setToken()

      .visit('/administration/users/')
      .waitForPage();
  });

  it('renders title', () => {
    cy.get('.card-title.h5').contains('Users').should('exist');
  });

  it('renders user items', () => {
    cy.get('table tbody tr').should('have.length', 10);
  });

  it('should full name search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('.card-table .form-control[placeholder="Search..."]')
        .type('Tara Pierce')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should username search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('.card-table .form-control[placeholder="Search..."]')
        .type('0024c6a7885940bbb156e82073bc0244')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should organization search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.selectTableFilter('Organization', 'Allen-Rodriguez', false, true);
      cy.get('table tbody tr').should('have.length', 1);
    });
  });

  it('should email search works correctly', () => {
    cy.wait('@getUsers').then(() => {
      cy.get('.card-table .form-control[placeholder="Search..."]')
        .type('TaraPierce@example.com')
        .get('table tbody tr')
        .should('have.length', 1);
    });
  });

  it('should search works correctly using account role', () => {
    cy.wait('@getUsers').then(() => {
      cy.selectTableFilter('Role', null);
      cy.get('table tbody tr').should('have.length', 10);
    });
  });

  it('should search works correctly using account status', () => {
    cy.wait('@getUsers').then(() => {
      cy.selectTableFilter('Status', null);
      cy.get('table tbody tr').should('have.length', 10);
    });
  });

  it('should open manage page when click details button', () => {
    cy.get(
      'table tbody tr:first-child td:first-child a:contains("Tara Pierce")',
    )
      .click({ force: true })
      .get('.public-dashboard-hero')
      .contains('Tara Pierce')
      .should('be.visible', true)
      .get('.form-table-card .card-header')
      .contains('Profile settings')
      .should('be.visible', true)
      .click();
  });
});
