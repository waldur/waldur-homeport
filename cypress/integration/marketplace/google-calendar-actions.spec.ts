describe('Google Calendar actions in public offerings view', () => {
  beforeEach(() => {
    cy.mockCustomer()
      .mockUser()
      .setToken()

      .intercept('GET', '/api/customers/', {
        fixture: 'marketplace/anderson_and_sons.json',
      })
      .intercept('GET', '/api/marketplace-offerings/', {
        fixture: 'marketplace/booking-offerings.json',
      })
      .intercept('GET', '/api/customers/**/counters/', {
        fixture: 'marketplace/counters.json',
      })
      .intercept('GET', '/api/marketplace-orders/', [])
      .intercept('POST', '/api/booking-offerings/**/google_calendar_sync/', {})
      .as('syncGoogleCalendar')
      .intercept('POST', '/api/booking-offerings/**/share_google_calendar/', {})
      .as('publishGoogleCalendar')
      .intercept(
        'POST',
        '/api/booking-offerings/**/unshare_google_calendar/',
        {},
      )
      .as('unpublishGoogleCalendar')

      .log('Visit public offerings')
      .visit(
        '/organizations/6983ac22f2bb469189311ab21e493359/marketplace-offerings/',
      )
      .waitForSpinner();
  });

  it('allows to sync Google Calendar', () => {
    cy.get('td .dropdown')
      .first()
      .contains('Actions')
      .click({ force: true })
      .get('.dropdown-menu')
      .find('li > a')
      .contains('Sync with Google Calendar')
      .click({ force: true })

      .wait('@syncGoogleCalendar')
      .its('request.body')
      .should('deep.equal', '');
  });

  it('allows to publish Google Calendar', () => {
    cy.get('td .dropdown')
      .last()
      .contains('Actions')
      .click({ force: true })
      .get('.dropdown-menu')
      .find('li > a')
      .contains('Publish as Google Calendar')
      .click({ force: true })

      .wait('@publishGoogleCalendar')
      .its('request.body')
      .should('deep.equal', '');
  });

  it('allows to unpublish Google Calendar', () => {
    cy.get('td .dropdown')
      .first()
      .contains('Actions')
      .click({ force: true })
      .get('.dropdown-menu')
      .find('li > a')
      .contains('Unpublish as Google Calendar')
      .click({ force: true })

      .wait('@unpublishGoogleCalendar')
      .its('request.body')
      .should('deep.equal', '');
  });
});
