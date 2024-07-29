import { Info } from 'luxon';
import { recurse } from 'cypress-recurse'

/* eslint-disable no-redeclare */
// Must be declared global to be detected by typescript (allows import/export)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mockUser(userName?: string): Chainable;
      mockCustomer(): Chainable;
      mockCustomers(): Chainable;
      mockEvents(): Chainable;
      mockChecklists(): Chainable;
      mockConfigs(): Chainable;
      fillAndSubmitLoginForm(username?: string, password?: string): Chainable;
      setToken(): Chainable;
      openDropdownByLabel(value: string): Chainable;
      openDropdownByLabelForce(value: string): Chainable;
      selectRole(value: string): Chainable;
      openWorkspaceSelector(): Chainable;
      selectTheFirstOptionOfDropdown(): Chainable;
      selectTableFilter(
        label: string,
        value?: string,
        apply?: boolean,
        type?: boolean,
      ): Chainable;
      selectDate(): Chainable;
      selectFlatpickrDate(inputQueryPath: string, date?: string): Chainable;
      openSelectDialog(selectId: string, option: string): Chainable;
      buttonShouldBeDisabled(btnClass: string): Chainable;
      clickSidebarMenuItem(menu: string, submenu?: string): Chainable;
      waitForSpinner(): Chainable;
      waitForPage(): Chainable;
      acceptCookies(): Chainable;
    }
  }
}

import '../e2e/openstack/instance/commands';

Cypress.Commands.add('setToken', () => {
  window.localStorage.setItem('waldur/auth/token', 'valid');
});

// Fill and sumbit login form
Cypress.Commands.add('fillAndSubmitLoginForm', (username, password) => {
  username = username || 'staff';
  password = password || 'secret';

  cy
    // Fill and submit the form
    .log('fill and submit login form')

    // Type username
    .get('input[placeholder="Username"]', { log: false })
    .type(username, { log: false })

    // Type password
    .get('input[placeholder="Password"]', { log: false })
    .type(password, { log: false })

    // Press button to submit login form
    .get('button[type="submit"]', { log: false })
    .click({ log: false });
});

Cypress.Commands.add('waitForSpinner', () => {
  cy.get('.fa-spinner.fa-spin').should('not.exist');
});

Cypress.Commands.add('waitForPage', () => {
  cy.get('#kt_content_container').should('exist').wait(600).waitForSpinner();
});

Cypress.Commands.add('acceptCookies', () => {
  cy.get('button.acceptcookies').should(($el) => {
    if ($el) $el.trigger('click');
  });
});

Cypress.Commands.add('openDropdownByLabel', (label) => {
  cy.get('label')
    .contains(label)
    .next()
    .find('div[class$="placeholder"]') // select classnames which end with "placeholder"
    .click({ force: true });
});

Cypress.Commands.add('openDropdownByLabelForce', (label) => {
  cy.openDropdownByLabel(label).openDropdownByLabel(label);
});

Cypress.Commands.add('selectRole', (label) => {
  cy.get('label')
    .contains('Role')
    .next()
    .get('[class*="-control"]')
    .click(0, 0, { force: true, multiple: true })
    .get('[class*="-option"]')
    .contains(label)
    .click(0, 0, { force: true });
});

Cypress.Commands.add('selectTheFirstOptionOfDropdown', () => {
  cy.get('[role="option"]').first().click({ force: true }); // get ids which start with "react-select"
});

Cypress.Commands.add(
  'selectTableFilter',
  (label, value, apply = true, type = false) => {
    cy.acceptCookies();
    cy.get('.card-table button.btn-toggle-filters').should('exist').click();
    let filterType: 'select' | 'checkbox' = 'select'
    cy.wrap(filterType).as('filterType')
    cy.get('.card-table .table-filters-menu:not(.column-filter)').within(() => {
      cy.contains('.menu-link', label)
        .click()
        .contains('.menu-link', label)
        .parent()
        .within(() => {
          cy.get('.menu-sub .filter-field > *').then(($el) => {
            if ($el.hasClass('form-check')) {
              filterType = 'checkbox';
              cy.wrap(filterType).as('filterType')
            }
          });

          cy.get('@filterType').then(() => {
            if (filterType === 'checkbox') {
              cy.get(`.menu-sub .filter-field .form-check input`).click({ force: true });
            } else if (filterType === 'select') {
              if (type && value) {
                cy.get(`.menu-sub .filter-field div[class$="-control"]`).click().type(value);
              } else {
                cy.get(`.menu-sub .filter-field div[class$="-control"]`).click();
              }
            }
          })
        });
    });
    
    cy.get('@filterType').then(() => {
      if (filterType === 'select') {
        if (value === null || value === undefined) {
          cy.selectTheFirstOptionOfDropdown();
        } else {
          cy.get('*div[id^="react-select"]').contains(value).click({ force: true });
        }
      }
    })
    if (apply) {
      cy.get('.card-table .table-filters-menu:not(.column-filter)').within(() => {
        cy.contains('.menu-link', label)
          .parent()
          .contains('.filter-footer button', 'Apply')
          .click({ force: true });
      });
      // Make sure the fetch fn is performed
      cy.get('[data-cy=loading-spinner]')
        .first()
        .then(($el) => {
          //@ts-ignore
          const className = $el[0].parentNode.className;
          if (className.indexOf('fa-spin') < 0) {
            cy.get('[data-cy=loading-spinner]').first().click();
          }
        });
    }
  },
);

Cypress.Commands.add('selectDate', () => {
  cy.get('.react-datepicker-wrapper input')
    .click()
    .get(
      '.react-datepicker__week:last-child .react-datepicker__day:first-child',
    )
    .click();
});

Cypress.Commands.add('selectFlatpickrDate', (inputQueryPath, date) => {
  if (date) {
    const d = new Date(date);
    cy.get(inputQueryPath)
      .click({ force: true })
      .get('.flatpickr-calendar')
      .should('be.visible')
      .within(() => {
        // Month
        const monthName = Info.months('long', {locale: 'en-US'})[d.getMonth()];
        recurse(
          () => cy.get('.cur-month').then(t => t.text().trim()),
          (month) => month === monthName,
          {delay:0, post: () => cy.get('.flatpickr-next-month').click()}
        )
        // Year
        cy.get('input.cur-year')
          .clear()
          .type(d.getFullYear().toString());
        // Day
        cy.get('.flatpickr-innerContainer .dayContainer')
          .contains('span.flatpickr-day', d.getDate().toString())
          .click();
      });
  } else {
    cy.get(inputQueryPath)
      .next()
      .should('have.class', 'btn-circle')
      .click({ force: true });
  }
});

Cypress.Commands.add('openWorkspaceSelector', () => {
  cy.waitForSpinner()
    // Workspace selector indicates user workspace
    .get('[data-cy=select-workspace-toggle]')

    // Open workspace selector by clicking on button
    .contains('Select project')
    .click()

    // Modal dialog should be displayed
    .get('.modal-content')
    .should('be.visible')

    // Wait until dialog is loaded
    .waitForSpinner();
});

Cypress.Commands.add('clickSidebarMenuItem', (menu, submenu) => {
  cy.get(`.aside-menu .menu-item:contains(${menu})`).click().wait(500);

  if (submenu) {
    cy.get(`.aside-menu .menu-item:contains(${menu})`).then(($menuItem) => {
      if (!$menuItem.hasClass('show')) {
        $menuItem.trigger('click');
      }
    });
    cy.wait(500)
      .get(
        `.aside-menu .menu-item:contains(${menu}) .menu-item:contains(${submenu})`,
      )
      .click()
      .waitForSpinner()
      .get(
        `.aside-menu .menu-item:contains(${menu}) .menu-item:contains(${submenu})`,
      )
      .should('have.class', 'here');
  } else {
    cy.waitForSpinner()
      .get(`.aside-menu .menu-item:contains(${menu})`)
      .should('have.class', 'here');
  }
});

Cypress.Commands.add('mockConfigs', () => {
  cy.intercept('GET', '/api/configuration/', {
    fixture: 'configuration.json',
  })
    .intercept('GET', '/api/events/', [])
    .intercept('GET', '/api/roles/', {
      fixture: 'roles.json',
    });
});

Cypress.Commands.add('mockUser', (userName) => {
  const userData = userName === 'admin' ? 'admin.json' : 'alice.json';

  const userConfiguration =
    userName === 'admin' ? 'configuration-admin.json' : 'configuration.json';

  cy.intercept('GET', '/api/configuration/', {
    fixture: userConfiguration,
  })
    .intercept('POST', '/api-auth/password/', { token: 'valid' })
    .intercept('GET', '/api/users/me/', {
      fixture: `users/${userData}`,
    })
    .intercept('GET', '/api/roles/', { fixture: 'roles.json' });
});

Cypress.Commands.add('mockCustomer', () => {
  cy.intercept(
    'GET',
    '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/counters/',
    {},
  )
    .intercept('GET', '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/', {
      fixture: 'customers/alice.json',
    })
    .intercept('GET', '/api/invoices/', [])
    .intercept('GET', '/api/projects/', [])
    .intercept('GET', '/api/marketplace-orders/', []);
});

Cypress.Commands.add('mockChecklists', () => {
  cy.intercept('HEAD', '/api/marketplace-checklists/', {
    headers: {
      'x-result-count': '1',
    },
  }).intercept('GET', '/api/marketplace-checklists-categories/', {
    fixture: 'marketplace/checklists_categories.json',
  });
});

Cypress.Commands.add('mockEvents', () => {
  cy.intercept('GET', '/api/events-stats/**', []);
});

Cypress.Commands.add('mockCustomers', () => {
  cy.intercept('HEAD', '/api/customers/', []).intercept(
    'GET',
    '/api/customers/**',
    [],
  );
});
