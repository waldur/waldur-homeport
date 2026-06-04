import { describe, it, expect, beforeEach } from 'vitest';

import filterGen from '../generate-filters.cjs';

const { utils, SchemaProcessor, FilterMapper, Generator } = filterGen;

describe('generate-filters.cjs', () => {
  describe('utils', () => {
    it('humanize converts snake_case to Human Readable', () => {
      expect(utils.humanize('user_uuid')).toBe('User UUID');
      expect(utils.humanize('cpu_usage')).toBe('CPU usage');
      expect(utils.humanize('ram_limit')).toBe('RAM limit');
      expect(utils.humanize('ip_address')).toBe('IP address');
    });

    it('toCamelCase converts snake_case to camelCase', () => {
      expect(utils.toCamelCase('user_uuid')).toBe('userUuid');
      expect(utils.toCamelCase('simple')).toBe('simple');
    });

    it('toPascalCase converts snake_case to PascalCase', () => {
      expect(utils.toPascalCase('user_uuid')).toBe('UserUuid');
      expect(utils.toPascalCase('simple')).toBe('Simple');
    });

    it('resolveRef resolves local references', () => {
      const root = {
        components: {
          schemas: {
            User: { type: 'object' },
          },
        },
      };
      expect(utils.resolveRef('#/components/schemas/User', root)).toEqual({
        type: 'object',
      });
      expect(utils.resolveRef('#/missing', root)).toBeUndefined();
    });
  });

  describe('SchemaProcessor', () => {
    const mockSchema = {
      paths: {
        '/users/': {
          get: {
            operationId: 'users_list',
            parameters: [
              { name: 'query', in: 'query' },
              { name: 'page', in: 'query' },
            ],
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            properties: {
              uuid: { type: 'string' },
              username: { type: 'string' },
            },
          },
          StatusEnum: {
            enum: ['active', 'inactive'],
            'x-enum-descriptions': ['Active', 'Inactive'],
          },
        },
      },
    };

    let processor: any;

    beforeEach(() => {
      processor = new SchemaProcessor(mockSchema, { overrides: {} });
    });

    it('indexes operation IDs', () => {
      expect(processor.allOperationIds.has('users_list')).toBe(true);
    });

    it('identifies search fields', () => {
      expect(processor.searchFields.get('users_list')).toBe('query');
    });

    it('extracts named enums', () => {
      expect(processor.namedEnums.size).toBeGreaterThan(0);
      const values = Array.from(processor.namedEnums.values());
      expect(values[0]).toContain('Active');
    });

    it('extracts named enums using x-enum-descriptions', () => {
      const schemaWithDesc = {
        components: {
          schemas: {
            DescEnum: {
              enum: ['v1', 'v2'],
              'x-enum-descriptions': ['Label 1', 'Label 2'],
            },
          },
        },
        paths: {},
      };
      const proc = new SchemaProcessor(schemaWithDesc, { overrides: {} });
      expect(proc.namedEnums.has('DescEnum')).toBe(true);
      expect(proc.namedEnums.get('DescEnum')).toContain('Label 1');
    });

    it('identifies response fields and types', () => {
      const resp = processor.responseFields.get('users_list');
      expect(resp).toBeDefined();
      expect(resp.valueField).toBe('uuid');
      expect(resp.labelField).toBe('username');
      expect(resp.returnType).toBe('UsersListData');
    });

    it('extracts extra enums from config', () => {
      const configWithExtra = {
        overrides: {},
        extraEnums: {
          CustomEnum: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        },
      };
      const proc = new SchemaProcessor(mockSchema, configWithExtra);
      expect(proc.namedEnums.has('CustomEnum')).toBe(true);
      expect(proc.namedEnums.get('CustomEnum')).toContain('Option 1');
    });
  });

  describe('FilterMapper', () => {
    let processor: any;
    let config: any;
    let mapper: any;

    beforeEach(() => {
      const schema = {
        paths: {
          '/users/': {
            get: {
              operationId: 'users_list',
              parameters: [{ name: 'name', in: 'query' }],
            },
          },
        },
        components: { schemas: {} },
      };
      config = { overrides: {} };
      processor = new SchemaProcessor(schema, config);
      mapper = new FilterMapper(processor, config);
    });

    it('maps simple string parameter', () => {
      const param = { name: 'name', in: 'query', schema: { type: 'string' } };
      const filter = mapper.mapParameter(param, 'users_list');
      expect(filter.name).toBe('name');
      expect(filter.component).toBe('StringField');
    });

    it('maps boolean parameter to checkbox', () => {
      const param = {
        name: 'is_active',
        in: 'query',
        schema: { type: 'boolean' },
      };
      const filter = mapper.mapParameter(param, 'users_list');
      expect(filter.component).toBe('AwesomeCheckboxField');
    });

    it('maps uuid parameter and strips suffix', () => {
      const param = {
        name: 'project_uuid',
        in: 'query',
        schema: { type: 'string' },
      };
      const filter = mapper.mapParameter(param, 'users_list');
      expect(filter.name).toBe('project');
      expect(filter.label).toBe('Project');
      expect(filter.mapTo).toBe('project_uuid');
    });

    it('maps enum parameter with descriptions', () => {
      const param = {
        name: 'status',
        in: 'query',
        schema: {
          type: 'string',
          enum: ['open', 'closed'],
          'x-enum-descriptions': ['Open Status', 'Closed Status'],
        },
      };
      const filter = mapper.mapParameter(param, 'users_list');
      expect(filter.options[0].label).toBe('Open Status');
    });

    it('applies overrides from config', () => {
      config.overrides['users_list'] = {
        name: { label: 'Full Name' },
      };
      const param = { name: 'name', in: 'query', schema: { type: 'string' } };
      const filter = mapper.mapParameter(param, 'users_list');
      expect(filter.label).toBe('Full Name');
    });

    it('maps to Autocomplete when x-waldur-operation-id is present', () => {
      // We need to register the target operation first
      processor.allOperationIds.add('customers_list');
      const param = {
        name: 'customer_uuid',
        in: 'query',
        'x-waldur-operation-id': 'customers_list',
        schema: { type: 'string' },
      };
      const filter = mapper.mapParameter(param, 'users_list');
      expect(filter.component).toBe('Autocomplete');
      expect(filter.loadOptions).toBe('customersList');
    });
  });

  describe('Generator', () => {
    it('generates StringField JSX', () => {
      const field = {
        name: 'desc',
        label: 'Description',
        component: 'StringField',
      };
      const code = Generator.field(field);
      expect(code).toContain('<StringFilter');
      expect(code).toContain('name="desc"');
      expect(code).toContain('title={translate("Description")}');
      expect(code).toContain('placeholder={translate("Description")}');
    });

    it('generates Select JSX', () => {
      const field = {
        name: 'type',
        label: 'Type',
        component: 'Select',
        optionsPlaceholder: 'TypeEnum',
      };
      const code = Generator.field(field);
      expect(code).toContain('<SelectFilter');
      expect(code).toContain('options={TypeEnum}');
    });

    it('generates selector logic', () => {
      const field = {
        name: 'user',
        component: 'Autocomplete',
        valueField: 'uuid',
        mapTo: 'user_uuid',
      };
      const code = Generator.selector(field);
      expect(code).toContain('filter.user_uuid = values.user.uuid;');
    });

    it('generates file with initialValues and translate', () => {
      const opIds = ['users_list'];
      const operationFilters = {
        users_list: [{ name: 'name', component: 'StringField', label: 'Name' }],
      };
      const enumRegistry = new Map();
      const config = {
        overrides: {
          users_list: {
            initialValues: { type: { label: 'Active', value: 'active' } },
          },
        },
      };
      const code = Generator.file(
        opIds,
        operationFilters,
        enumRegistry,
        config,
      );
      expect(code).toContain(
        'export const UsersFilterInitialValues = {"type":{"label": translate("Active"),"value":"active"}};',
      );
    });
  });
});
