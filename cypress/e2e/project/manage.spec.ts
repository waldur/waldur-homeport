const projectFixturePath = 'projects/alice_azure.json';

const currentYear = new Date().getFullYear();
const nextYear = new Date(currentYear + 1, 5, 20);

const editedProject = {
  uuid: 'df4193e2bee24a4c8e339474d74c5f8c',
  name: 'Test name',
  description: 'Test description',
  backend_id: '123456789',
  end_date: nextYear.toISOString().split('T')[0],
};

describe('Project manage', { testIsolation: false }, () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .mockPermissions()
      .mockCustomers()
      .setToken()
      .intercept('GET', '/api/projects/oecd_codes/', [])
      .fixture(projectFixturePath)
      .then((project) => {
        cy.intercept('GET', `/api/projects/${project.uuid}/`, {
          fixture: projectFixturePath,
        })
          .intercept('GET', `/api/customers/${project.customer_uuid}/`, {
            fixture: 'customers/alice.json',
          })
          .intercept('PATCH', `/api/projects/${project.uuid}/`, {})
          .as('updateProject');
      });
  });

  it('Assure that we are able go to manage project page', () => {
    cy.fixture(projectFixturePath).then((project) => {
      cy.visit(`/projects/${project.uuid}/manage/`).waitForPage();
    });
  });

  it('Assure that the project info is filled in correctly', () => {
    cy.fixture(projectFixturePath).then((project) => {
      cy
        // Ensure that customer_name field is present and disabled
        .get('input[name="customer_name"]')
        .should('have.value', project.customer_name)
        .should('be.disabled')

        // Ensure that name field is present
        .get('input[name="name"]')
        .should('have.value', project.name)

        // Ensure that description field is present
        .get('textarea[name="description"]')
        .should('have.value', project.description)

        // Ensure that end_date picker is present
        .get('.card-body form input.flatpickr-input')
        .should('have.value', project.end_date ?? '')

        // Ensure that backend_id field is present
        .get('input[name="backend_id"]')
        .should('have.value', project.backend_id)

        // Ensure that image field is present
        .get('.card-body form div.image-input')
        .should(
          project.image ? 'not.have.class' : 'have.class',
          'image-input-empty',
        )

        // Ensure that submit button is not present when we have not changed anything yet
        .get('.card-body form button[type="submit"]')
        .should('have.length', 0);
    });
  });

  it('Assure that the date picker works fine', () => {
    const initialDate = new Date(currentYear + 3, 6, 21)
      .toISOString()
      .split('T')[0];

    // Edit the name field to make sure the submit button is visible
    cy.get('input[name="name"]').clear().type('testing date picker');

    cy
      // Update end_date picker with the initial date
      .selectFlatpickrDate('.card-body form input.flatpickr-input', initialDate)

      .get('.card-body form button[type="submit"]')
      .should('be.visible')
      .click()

      .wait('@updateProject')
      .its('request.body')
      .should('contain', initialDate);

    cy
      // Clear and save end_date picker
      .selectFlatpickrDate('.card-body form input.flatpickr-input', null)

      .get('.card-body form button[type="submit"]')
      .should('be.visible')
      .click()

      .wait('@updateProject')
      .its('request.body')
      .should('not.contain', initialDate);

    cy
      // Update end_date picker with a new date
      .selectFlatpickrDate(
        '.card-body form input.flatpickr-input',
        editedProject.end_date,
      )

      .get('.card-body form button[type="submit"]')
      .should('be.visible')
      .click()

      .wait('@updateProject')
      .its('request.body')
      .should('contain', editedProject.end_date);
  });

  it('Allows to update project info', () => {
    cy
      // Edit name field
      .get('input[name="name"]')
      .clear()
      .type(editedProject.name)

      // Edit description field
      .get('textarea[name="description"]')
      .clear()
      .type(editedProject.description)

      // Edit end_date picker
      .selectFlatpickrDate(
        '.card-body form input.flatpickr-input',
        editedProject.end_date,
      )

      // Edit backend_id field
      .get('input[name="backend_id"]')
      .clear()
      .type(editedProject.backend_id)

      // Ensure that submit button is not present when we have not changed anything yet
      .get('.card-body form button[type="submit"]')
      .should('be.visible')
      .click()

      .wait('@updateProject')
      .its('request.body')
      .should('contain', editedProject.name)
      .should('contain', editedProject.description)
      .should('contain', editedProject.backend_id)
      .should('contain', editedProject.end_date);
  });
});
