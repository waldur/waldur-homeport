const baseSteps = [
  { id: 'step-general', name: 'Details overview' },
  { id: 'step-project', name: 'Project details' },
  { id: 'step-resource-requests', name: 'Resource requests' },
  { id: 'step-team', name: 'Project team' },
];

const complianceStep = { id: 'step-compliance', name: 'Compliance checklist' };

// Function to get expected steps based on whether compliance is enabled
const getExpectedSteps = (hasCompliance = false) => {
  if (hasCompliance) {
    const steps = [...baseSteps];
    steps.splice(2, 0, complianceStep); // Insert compliance after project details
    return steps;
  }
  return baseSteps;
};

describe('Proposal page', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .setToken()

      .intercept('GET', '/api/customers/6983ac22f2bb469189311ab21e493359/', {
        fixture: 'customers/alice.json',
      })
      .intercept(
        'GET',
        '/api/proposal-proposals/8f3d266988c6415794e00147b1fd06cd/',
        {
          fixture: 'proposals/proposal.json',
        },
      )
      .intercept('GET', '/api/proposal-reviews/**', [])
      .intercept(
        'GET',
        '/api/proposal-proposals/8f3d266988c6415794e00147b1fd06cd/list_users/**',
        [],
      )
      .intercept(
        'GET',
        '/api/proposal-proposals/8f3d266988c6415794e00147b1fd06cd/resources/**',
        [],
      )

      .visit(
        '/call-management/6983ac22f2bb469189311ab21e493359/proposals/8f3d266988c6415794e00147b1fd06cd/',
      )
      .waitForPage();
  });

  it('Asure proposal name is shown', () => {
    cy.get('.v-stepper-form-header h1').should('have.text', 'Test proposal');
  });

  it('Asure that all steps of proposal progress are shown at the right side', () => {
    // By default, compliance steps are hidden behind experimental feature toggle
    const expectedSteps = getExpectedSteps(false);
    
    cy.get('.v-stepper-form-sidebar .nav-tabs')
      .children()
      .should('have.length', expectedSteps.length)
      .each((item, index) => {
        const expectedTexts = expectedSteps.map((step) => step.name);
        cy.wrap(item).should('contain.text', expectedTexts[index]);
      });
  });

  it('Checks that clicking on each step navigates to the correct section', () => {
    // By default, compliance steps are hidden behind experimental feature toggle
    const expectedSteps = getExpectedSteps(false);
    
    expectedSteps.forEach((step) => {
      const tab = cy
        .get('.v-stepper-form-sidebar .nav-tabs .nav-item a')
        .contains(step.name);
      tab.click();
      tab.parent().should('have.class', 'active');
      cy.url().should('include', step.id);
      cy.get('#' + step.id).should('be.visible');
    });
  });

  it('Checks that Resource requests tab remains active after a while and switches to Project details after scrolling', () => {
    cy.get('.v-stepper-form-sidebar .nav-tabs .nav-item a')
      .contains('Resource requests')
      .click();
    // Check if tab is still active after 1.5 sec
    cy.wait(1500);
    cy.get('.v-stepper-form-sidebar .nav-tabs .nav-item a')
      .contains('Resource requests')
      .parent()
      .should('have.class', 'active');

    // Asure Project details tab is active after scrolling
    cy.get('#step-project').scrollIntoView();
    cy.get('.v-stepper-form-sidebar .nav-tabs .nav-item a')
      .contains('Project details')
      .parent()
      .should('have.class', 'active');
  });
});
