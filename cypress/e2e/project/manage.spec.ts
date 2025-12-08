const projectFixturePath = 'projects/alice_azure.json';

const _date = new Date(new Date().getFullYear() + 1, 5, 20);
const currentYear = _date.getFullYear();
const currentMonth = _date.getMonth();
const nextMonthISO = new Date(currentYear, (currentMonth + 1) % 12, 20)
  .toISOString()
  .split('T')[0];
const next3MonthsISO = new Date(currentYear, (currentMonth + 3) % 12, 20)
  .toISOString()
  .split('T')[0];

const editedProject = {
  uuid: 'df4193e2bee24a4c8e339474d74c5f8c',
  name: 'Test name',
  description: 'Test description',
  backend_id: '123456789',
  end_date: next3MonthsISO,
  type: undefined,
  image: null,
  is_industry: undefined,
  oecd_fos_2007_code: undefined,
  start_date: undefined,
};

const openTab = (tab: string) => {
  cy.get('.toolbar').contains('.menu-link', tab).click();
};

const openEditDialog = (label: string) => {
  cy.get('.card .table')
    .contains('tr th:first-child', label)
    .parent()
    .find('td:last-child .btn')
    .click();
};

type InputType = 'input' | 'textarea' | 'date';

const getField = (field: string, type: InputType = 'input') => {
  if (type === 'date') {
    return cy.get('.modal input.flatpickr-input');
  } else if (type === 'textarea' && field === 'description') {
    // Description field uses MarkdownEditor which renders with .editable-area class
    return cy.get('.modal .editable-area');
  } else {
    return cy.get(`.modal ${type}[name="${field}"]`);
  }
};

const updateField = (
  label: string,
  field: string,
  value: string,
  type: InputType = 'input',
) => {
  openEditDialog(label);

  if (type === 'date') {
    cy.selectFlatpickrDate('.modal form input.flatpickr-input', value);
  } else if (type === 'textarea' && field === 'description') {
    // MarkdownEditor requires different interaction
    getField(field, type).clear().type(value);
  } else {
    getField(field, type).clear().type(value);
  }

  cy.get('.modal form button[type="submit"]')
    .should('be.visible')
    .click()

    .wait('@updateProject')
    .its('request.body')
    .should('contain', { [field]: value });
};

const closeEditDialog = () => {
  cy.get('.modal').contains('button', 'Cancel').click();
};

describe('Project manage', { testIsolation: false }, () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .mockCustomers()
      .setToken()
      .fixture(projectFixturePath)
      .then((project) => {
        // Assume next year date as project end date, because the date-picker does not accept the date before today.
        project.end_date = nextMonthISO;
        cy.intercept('GET', `/api/projects/${project.uuid}/`, project)
          .intercept('GET', `/api/customers/${project.customer_uuid}/`, {
            fixture: 'customers/alice.json',
          })
          .intercept('GET', '/api/projects/?name=**', {
            body: [],
            headers: {
              'x-result-count': '0',
            },
          })
          .intercept('PATCH', `/api/projects/${project.uuid}/`, editedProject)
          .as('updateProject');
      });
  });

  it('Assure that we are able go to manage project page', () => {
    cy.fixture(projectFixturePath).then((project) => {
      cy.visit(`/projects/${project.uuid}/manage/`).waitForPage();
    });
  });

  it('Assure that image tab view is present', () => {
    cy.fixture(projectFixturePath).then((project) => {
      cy.visit(`/projects/${project.uuid}/manage/?tab=avatar`).waitForPage();
      cy.get('form .card-body div.image-input').should(
        project.image ? 'not.have.class' : 'have.class',
        'image-input-empty',
      );
    });
  });

  it('Assure that on the general tab, the project info is filled in correctly', () => {
    openTab('General');
    cy.fixture(projectFixturePath).then((project) => {
      // Ensure that name field is present
      openEditDialog('Name');
      getField('name').should('have.value', project.name);
      closeEditDialog();
      // Ensure that customer_name field is present and disabled
      openEditDialog('Owner');
      getField('customer_name')
        .should('have.value', project.customer_name)
        .should('be.disabled');
      closeEditDialog();
      // Ensure that end_date picker is present
      openEditDialog('End date');
      project.end_date = nextMonthISO;
      getField('end_date', 'date').should('have.value', project.end_date ?? '');
      closeEditDialog();
      // Ensure that description field is present
      openEditDialog('Description');
      // For MarkdownEditor, check text content instead of value
      if (project.description) {
        getField('description', 'textarea').should('contain.text', project.description);
      } else {
        getField('description', 'textarea').should('be.visible');
      }
      closeEditDialog();
    });
  });

  it('Assure that on the metadata tab, the project info is filled in correctly', () => {
    openTab('Metadata');
    cy.fixture(projectFixturePath).then((project) => {
      // Ensure that backend_id field is present
      openEditDialog('Backend ID');
      getField('backend_id').should('have.value', project.backend_id);
      closeEditDialog();
    });
  });

  it('Allows to update project info', () => {
    openTab('General');
    // Edit name field
    updateField('Name', 'name', editedProject.name);

    // Edit description field
    updateField(
      'Description',
      'description',
      editedProject.description,
      'textarea',
    );

    // Edit end_date picker
    updateField('End date', 'end_date', editedProject.end_date, 'date');

    openTab('Metadata');
    // Edit backend_id field
    updateField('Backend ID', 'backend_id', editedProject.backend_id);
  });
});
