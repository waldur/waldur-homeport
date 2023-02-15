describe('Search Popup', () => {
  beforeEach(() => {
    cy.intercept('HEAD', '/api/customers/**', {
      headers: {
        'x-result-count': '3',
      },
    });
    cy.intercept('GET', '/api/customers/**', (req) => {
      if (req.url.indexOf('lebowski') !== -1) {
        req.reply({
          fixture: 'customers/lebowski.json',
          headers: {
            'x-result-count': '2',
          },
        });
      } else {
        req.reply({
          fixture: 'customers/alice_bob_web.json',
          headers: {
            'x-result-count': '3',
          },
        });
      }
    })
      .mockUser()
      .mockChecklists()
      .mockEvents()
      .mockPermissions()
      .intercept('GET', '/api/marketplace-categories/**', [
        {
          uuid: '046b038d75a342b7a0ddad7e98206492',
          title: 'Private clouds',
        },
        {
          uuid: '73e00313ced64f9a9ac7601ca892a84e',
          title: 'Storage',
        },
        {
          uuid: '3a53ce18087f4fc0800886d4615e805b',
          title: 'VMs',
        },
      ])
      .intercept('GET', '/api/projects/6f3ae6f43d284ca196afeb467880b3b9/', {
        fixture: 'projects/alice_azure.json',
      })
      .intercept('GET', '/api/customers/bf6d515c9e6e445f9c339021b30fc96b/', {
        fixture: 'customers/alice.json',
      })
      .intercept('GET', '/api/marketplace-order-items/**', [
        {
          offering_name: 'Demo Private Cloud',
          uuid: '7bd0ba5c612e465fbe792795412e2a7b',
          created: '2022-10-17T14:33:35.774884Z',
          type: 'Create',
          state: 'done',
          customer_uuid: '956930350f1b44a0ab0ba37b2b497dcd',
          project_uuid: '559cee11d35a444395522b63e95e670d',
        },
        {
          offering_name: 'Virtual machine in Test5796',
          uuid: '49e043c482b740129e8b632a95af6aeb',
          created: '2022-02-14T20:47:34.811669Z',
          type: 'Terminate',
          state: 'done',
          customer_uuid: '956930350f1b44a0ab0ba37b2b497dcd',
          project_uuid: '559cee11d35a444395522b63e95e670d',
        },
      ])
      .intercept(
        'GET',
        '/api/marketplace-provider-offerings/?field=name&field=uuid&field=url&field=category_title&field=thumbnail&o=name&state=Active&name=&page=1&page_size=10',
        [
          {
            uuid: '046b038d75a342b7a0ddad7e98206492',
            title: 'Private clouds',
          },
          {
            uuid: '73e00313ced64f9a9ac7601ca892a84e',
            title: 'Storage',
          },
          {
            uuid: '3a53ce18087f4fc0800886d4615e805b',
            title: 'VMs',
          },
        ],
      )
      .intercept('GET', 'api/marketplace-project-update-requests/**', [])
      .intercept('GET', 'api/marketplace-resources/**', [
        {
          offering_thumbnail: null,
          category_title: 'Private clouds',
          uuid: 'f5fe528068eb462ea0af2cde4639353b',
          state: 'OK',
          project_uuid: '559cee11d35a444395522b63e95e670d',
          project_name: 'First project',
          customer_name: 'Demo Org',
          name: 'Test1234',
        },
        {
          offering_thumbnail: null,
          category_title: 'Private clouds',
          uuid: '73b5981d5564482286f45998dee6d466',
          state: 'OK',
          project_uuid: '559cee11d35a444395522b63e95e670d',
          project_name: 'First project',
          customer_name: 'Demo Org',
          name: 'Test5796',
        },
        {
          offering_thumbnail: null,
          category_title: 'VMs',
          uuid: '49aca81b04124c0cb1fc7201ee0dd265',
          state: 'OK',
          project_uuid: '559cee11d35a444395522b63e95e670d',
          project_name: 'First project',
          customer_name: 'Demo Org',
          name: 'TestVM',
        },
        {
          offering_thumbnail: null,
          category_title: 'Storage',
          uuid: '7ab165cea1bb4e29b5256e2ec54d828c',
          state: 'OK',
          project_uuid: '559cee11d35a444395522b63e95e670d',
          project_name: 'First project',
          customer_name: 'Demo Org',
          name: 'TestVM-system',
        },
        {
          offering_thumbnail: null,
          category_title: 'Private clouds',
          uuid: 'b2285784c554467d9ce9049cb2549670',
          state: 'OK',
          project_uuid: '238766e6509646c08804f9f5d1d5df4a',
          project_name: 'First project',
          customer_name: 'test',
          name: 'test',
        },
        {
          offering_thumbnail:
            'https://demo-next.waldur.com/media/files/marketplace_service_offering_thumbnails/Desktop_Ubuntu_20.04.png',
          category_title: 'VMs',
          uuid: '00cde7c97dd04b328329d9df97efffff',
          state: 'OK',
          project_uuid: '559cee11d35a444395522b63e95e670d',
          project_name: 'First project',
          customer_name: 'Demo Org',
          name: 'asdfasdf',
        },
        {
          offering_thumbnail: null,
          category_title: 'Private clouds',
          uuid: 'bfd8892313df41dea830c3bb1add09a3',
          state: 'OK',
          project_uuid: '635e9c2d57ae48f28973f5d455fda3fd',
          project_name: 'First project',
          customer_name: 'test',
          name: 'admin',
        },
        {
          offering_thumbnail:
            'https://demo-next.waldur.com/media/files/marketplace_service_offering_thumbnails/Desktop_Ubuntu_20.04.png',
          category_title: 'VMs',
          uuid: '92d2c158e2224ddcaded344ab1e07075',
          state: 'OK',
          project_uuid: '559cee11d35a444395522b63e95e670d',
          project_name: 'First project',
          customer_name: 'Demo Org',
          name: 'test',
        },
        {
          offering_thumbnail:
            'https://demo-next.waldur.com/media/files/marketplace_service_offering_thumbnails/Desktop_Ubuntu_20.04.png',
          category_title: 'VMs',
          uuid: '8a313bd1c6e74202907df1f5b6c736ba',
          state: 'OK',
          project_uuid: '559cee11d35a444395522b63e95e670d',
          project_name: 'First project',
          customer_name: 'Demo Org',
          name: 'test3',
        },
        {
          offering_thumbnail:
            'https://demo-next.waldur.com/media/files/marketplace_service_offering_thumbnails/Desktop_Ubuntu_20.04.png',
          category_title: 'VMs',
          uuid: '9d513fae13344b74b9f1d58288112454',
          state: 'OK',
          project_uuid: '559cee11d35a444395522b63e95e670d',
          project_name: 'First project',
          customer_name: 'Demo Org',
          name: 'test',
        },
      ])
      .intercept(
        'GET',
        'api/marketplace-resources/?query=ccc&state=Creating&state=OK&state=Erred&state=Updating&state=Terminating&field=name&field=uuid&field=category_title&field=offering_thumbnail&field=customer_name&field=project_name&field=project_uuid&field=state',
        [],
      )
      .intercept(
        'GET',
        'api/marketplace-resources/?query=admin&state=Creating&state=OK&state=Erred&state=Updating&state=Terminating&field=name&field=uuid&field=category_title&field=offering_thumbnail&field=customer_name&field=project_name&field=project_uuid&field=state',
        [
          {
            offering_thumbnail: null,
            category_title: 'Private clouds',
            uuid: 'bfd8892313df41dea830c3bb1add09a3',
            state: 'OK',
            project_uuid: '635e9c2d57ae48f28973f5d455fda3fd',
            project_name: 'First project',
            customer_name: 'test',
            name: 'admin',
          },
          {
            offering_thumbnail:
              'https://demo-next.waldur.com/media/files/marketplace_service_offering_thumbnails/Desktop_Ubuntu_20.04.png',
            category_title: 'VMs',
            uuid: '88041d6695c34d53ae512cedd14fb14b',
            state: 'OK',
            project_uuid: '559cee11d35a444395522b63e95e670d',
            project_name: 'First project',
            customer_name: 'Demo Org',
            name: 'admin',
          },
        ],
      )
      .setToken()
      .visit('/profile/')
      .waitForPage();
  });

  it('should open the search popup', () => {
    cy.get('#searchIconContainer').click();
  });

  it('should open the search popup and be writable', () => {
    cy.get('#searchIconContainer').click();
    cy.get('#GlobalSearch input[name=search]').click().focused().type('test');
  });
  it('when searched for a keyword and matches it should come up', () => {
    cy.get('#searchIconContainer').click();
    cy.get('#GlobalSearch input[name=search]').click().focused().type('admin'),
      { delay: 100 };
    cy.get('#GlobalSearch .fs-6.fw-semibold').each(($row) => {
      cy.wrap($row).should('have.text', 'admin');
    });
  });
  it('when searched for a keyword and not matches, "No result found" message should come up', () => {
    cy.get('#searchIconContainer').debug().click();
    cy.get('#GlobalSearch input[name=search]').click().focused().type('ccc');
    cy.get('#GlobalSearch .text-gray-600.fs-5.mb-2').should('have.text', 'No result found');
  });
});
