const fieldQueryParam =
  'field=uuid&field=full_name&field=email&field=phone_number&field=organization&field=permissions&field=is_active&field=native_name&field=civil_number&field=username&field=slug&field=preferred_language&field=identity_provider_label&field=date_joined&field=job_title&field=affiliations&field=is_staff&field=is_support&field=url';

describe('Users', () => {
  beforeEach(() => {
    cy.mockChecklists()

      .intercept('GET', '/api/configuration/', {
        fixture: 'support/configuration.json',
      })
      .intercept('GET', '/api/events/', [])
      .intercept('GET', '/api/roles/', { fixture: 'roles.json' })

      .intercept('GET', '/api/users/me/', {
        fixture: 'support/me.json',
      })

      .intercept('GET', '/api/customers/**', {
        fixture: 'support/customers.json',
      })
      .intercept(
        'GET',
        `/api/users/?page=1&page_size=10&${fieldQueryParam}&query=Tara%20Pierce`,
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept(
        'GET',
        `/api/users/?page=1&page_size=10&${fieldQueryParam}&query=0024c6a7885940bbb156e82073bc0244`,
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept(
        'GET',
        `/api/users/?page=1&page_size=10&customer_uuid=895e38d197e748459189f19285119edf&${fieldQueryParam}`,
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept(
        'GET',
        `/api/users/?page=1&page_size=10&${fieldQueryParam}&is_staff=true`,
        {
          fixture: 'support/users.json',
        },
      )

      .intercept(
        'GET',
        `/api/users/?page=1&page_size=10&${fieldQueryParam}&role=&status=true`,
        {
          fixture: 'support/users.json',
        },
      )

      .intercept(
        'GET',
        `/api/users/?page=1&page_size=10&${fieldQueryParam}&query=TaraPierce%40example.com`,
        {
          fixture: 'support/user-search-by-name.json',
        },
      )

      .intercept('GET', `/api/users/?page=1&page_size=10&${fieldQueryParam}`, {
        fixture: 'support/users.json',
      })
      .as('getUsers');

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
      cy.selectTableFilter('Organization', 'Allen-Rodriguez', true, true);
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
