const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// --- Constants & Config ---
const SCHEMA_PATH = path.resolve(__dirname, './waldur_api.yaml');
const CONFIG_PATH = path.resolve(__dirname, './generate-filters-config.yaml');

const ABBREVIATIONS = ['IP', 'ID', 'CPU', 'RAM', 'UUID', 'RBAC', 'OK', 'MAC', 'VM', 'MD5', 'SHA', 'SHA256', 'SHA512'];
const SEARCH_CANDIDATES = ['query', 'name', 'email', 'username', 'full_name', 'title', 'customer_keyword', 'keyword'];
const LABEL_CANDIDATES = ['name', 'title', 'full_name', 'username', 'email', 'customer_name'];
const VALUE_CANDIDATES = ['uuid', 'url', 'id', 'pk', 'customer_uuid'];

// --- Utility Functions ---
const utils = {
    humanize(str) {
        if (!str) return '';
        let h = str.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
        h = h.charAt(0).toUpperCase() + h.slice(1);
        ABBREVIATIONS.forEach(abbr => h = h.replace(new RegExp(`\\b${abbr}\\b`, 'gi'), abbr));
        return h;
    },
    toCamelCase: s => s?.replace(/_([a-z])/g, g => g[1].toUpperCase()) || '',
    toPascalCase: s => {
        const c = utils.toCamelCase(s);
        return c.charAt(0).toUpperCase() + c.slice(1);
    },
    resolveRef(ref, root) {
        if (!ref?.startsWith('#/')) return null;
        return ref.split('/').slice(1).reduce((curr, part) => curr?.[part], root);
    }
};

// --- Logic Modules ---

class SchemaProcessor {
    constructor(schema) {
        this.schema = schema;
        this.allOperationIds = new Set();
        this.searchFields = new Map();
        this.responseFields = new Map();
        this.namedEnums = this._extractNamedEnums();
        this._index();
    }

    _extractNamedEnums() {
        const map = new Map();
        const components = this.schema.components?.schemas || {};
        for (const [name, def] of Object.entries(components)) {
            if (def.enum && def['x-waldur-enum-names']) {
                const options = def.enum.map((val, i) => ({ label: def['x-waldur-enum-names'][i], value: val }));
                map.set(name, JSON.stringify(options));
            }
        }
        return map;
    }

    _index() {
        for (const methods of Object.values(this.schema.paths)) {
            for (const op of Object.values(methods)) {
                if (!op.operationId) continue;
                this.allOperationIds.add(op.operationId);

                const params = (op.parameters || []).filter(p => p.in === 'query').map(p => p.name);
                this.searchFields.set(op.operationId, SEARCH_CANDIDATES.find(c => params.includes(c)));

                const resp = op.responses?.['200']?.content?.['application/json']?.schema;
                if (!resp) continue;
                let s = resp.$ref ? utils.resolveRef(resp.$ref, this.schema) : resp;
                if (s?.type === 'array' && s.items) {
                    let item = s.items.$ref ? utils.resolveRef(s.items.$ref, this.schema) : s.items;
                    if (item?.properties) {
                        const props = Object.keys(item.properties);
                        this.responseFields.set(op.operationId, {
                            valueField: VALUE_CANDIDATES.find(c => props.includes(c)) || 'uuid',
                            labelField: LABEL_CANDIDATES.find(c => props.includes(c)) || 'name',
                            props,
                            returnType: s.items.$ref?.split('/').pop()
                        });
                    }
                }
            }
        }
    }
}

class FilterMapper {
    constructor(processor, config) {
        this.proc = processor;
        this.config = config;
        this.enumRegistry = new Map();
        this.enumReverseRegistry = new Map();
    }

    getFiltersForOp(opId) {
        const pathEntry = Object.entries(this.proc.schema.paths).find(([_, m]) => m.get?.operationId === opId);
        if (!pathEntry) return [];

        const queryParams = (pathEntry[1].get.parameters || []).filter(p => p.in === 'query');
        const paramNames = queryParams.map(p => p.name);
        const toExclude = ['page', 'page_size', 'o', 'field', ...paramNames.filter(n => n.endsWith('_uuid') && paramNames.includes(n.replace(/_uuid$/, '')))];

        let filters = queryParams
            .filter(p => !toExclude.includes(p.name))
            .map(p => this.mapParameter(p, opId));

        if (this.config.extraFilters?.[opId]) {
            this.config.extraFilters[opId].forEach(f => {
                if (typeof f.loadOptions === 'string') {
                    const listOp = f.loadOptions.replace(/_retrieve$/, '_list');
                    f.loadOptions = this.proc.allOperationIds.has(listOp) ? utils.toCamelCase(listOp) : utils.toCamelCase(f.loadOptions);
                }
                filters.push(f);
            });
        }

        const opOverrides = this.config.overrides[opId];
        if (opOverrides?.filters) {
            filters = opOverrides.filters.map(name => {
                const existing = filters.find(f => f.name === name || f.mapTo === name);
                return existing || this.mapParameter({ name }, opId);
            }).filter(Boolean);
        }

        return this._deduplicateAndFinalize(filters);
    }

    mapParameter(param, currentOpId) {
        const overrides = this.config.overrides[currentOpId]?.[param.name] || {};
        let schema = param.schema || {};
        let enumName = null;

        if (schema.$ref) {
            enumName = schema.$ref.split('/').pop();
            schema = utils.resolveRef(schema.$ref, this.proc.schema) || schema;
        }

        const filter = {
            name: param.name.endsWith('_uuid') ? param.name.replace(/_uuid$/, '') : param.name,
            label: utils.humanize(param.name.replace(/_uuid$/, '')),
            mapTo: param.name.endsWith('_uuid') ? param.name : undefined,
            isMulti: schema.type === 'array' || undefined,
        };

        const targetOp = overrides.operationId || param['x-waldur-operation-id'];

        if (targetOp) {
            this._mapAutocomplete(filter, targetOp);
        } else {
            this._mapStandard(filter, param, schema, enumName, overrides);
        }

        Object.assign(filter, overrides);

        if (overrides.component && !['Select', 'Autocomplete'].includes(overrides.component)) {
            ['options', 'optionsPlaceholder', 'enumName'].forEach(k => delete filter[k]);
        }

        return filter;
    }

    _mapAutocomplete(filter, targetOp) {
        filter.component = 'Autocomplete';
        let listOp = targetOp.endsWith('_retrieve') ? targetOp.replace('_retrieve', '_list') : targetOp;
        if (this.proc.allOperationIds.has(listOp)) {
            filter.loadOptions = utils.toCamelCase(listOp);
            filter.searchParam = this.proc.searchFields.get(listOp) || 'name';
            const resp = this.proc.responseFields.get(listOp) || { valueField: 'uuid', labelField: 'name' };
            filter.valueField = resp.valueField;
            filter.labelField = resp.labelField;
            if (resp.returnType) filter.valueType = resp.returnType;

            const finalName = filter.mapTo || filter.name;
            if (finalName.endsWith('_uuid') && resp.props?.includes(finalName)) {
                filter.valueField = finalName;
            }
        }
    }

    _mapStandard(filter, param, schema, enumName, overrides) {
        const enumOptions = schema.enum || (schema.items?.$ref ? (utils.resolveRef(schema.items.$ref, this.proc.schema)?.enum) : schema.items?.enum);

        if (enumOptions || overrides.enumOverrides || overrides.options) {
            filter.component = 'Select';
            if (typeof overrides.options === 'string') {
                filter.optionsPlaceholder = overrides.options;
                return;
            }

            const options = (enumOptions || Object.keys(overrides.enumOverrides || {})).map(opt => ({
                label: overrides.enumOverrides?.[opt] || utils.humanize(String(opt)),
                value: opt === 'true' ? true : opt === 'false' ? false : opt === 'null' ? null : opt
            }));

            const key = JSON.stringify([...options].sort((a, b) => String(a.value).localeCompare(String(b.value))));
            let finalEnumName = enumName || this.proc.namedEnums.get(key) || utils.toPascalCase(param.name) + 'Enum';

            this._registerEnum(key, finalEnumName, filter);
            filter.options = options;
        } else if (schema.type === 'boolean') {
            filter.component = 'Select';
            filter.options = [{ label: 'No', value: false }, { label: 'Yes', value: true }, { label: 'All', value: undefined }];
            this._registerEnum(JSON.stringify(filter.options), 'BooleanEnum', filter);
        } else if (schema.format === 'date' || schema.format === 'date-time') {
            filter.component = 'DateField';
        } else {
            filter.component = 'StringField';
        }
    }

    _registerEnum(key, name, filter) {
        if (this.enumReverseRegistry.has(key)) {
            filter.optionsPlaceholder = this.enumReverseRegistry.get(key);
        } else {
            let uniqueName = name;
            let i = 1;
            while (this.enumRegistry.has(uniqueName) && this.enumRegistry.get(uniqueName) !== key) {
                uniqueName = `${name}_${i++}`;
            }
            this.enumRegistry.set(uniqueName, key);
            this.enumReverseRegistry.set(key, uniqueName);
            filter.optionsPlaceholder = uniqueName;
        }
    }

    _deduplicateAndFinalize(filters) {
        const map = new Map();
        filters.forEach(f => map.set(f.name, f));
        return Array.from(map.values());
    }
}

// --- Generator Module ---

class Generator {
    static field(f) {
        const tLabel = `translate("${f.label}")`;
        const tPlace = `translate("${f.placeholder || f.label}")`;
        const commonSelectProps = [
            `isClearable={true}`,
            f.isMulti ? `isMulti={true}` : null,
            `{...REACT_SELECT_TABLE_FILTER}`,
        ].filter(Boolean).join('\n            ');

        let input = '';
        const customProps = f.props ? Object.entries(f.props).map(([k, v]) => `${k}={${v}}`).join('\n        ') : '';

        if (['StringField', 'DateField', 'AwesomeCheckboxField'].includes(f.component)) {
            const extraProps = f.component === 'AwesomeCheckboxField' ? `label={${tLabel}} parse={(v) => v || undefined}` : `placeholder={${tPlace}}`;
            input = `      <Field
        name="${f.name}"
        component={${f.component}}
        ${extraProps}
        ${customProps}
      />\n`;
        } else if (f.component === 'Autocomplete') {
            const extraQuery = f.extraQuery ? `, ${JSON.stringify(f.extraQuery).replace(/"(props\.\w+)"/g, '$1')}` : '';
            const vType = f.valueType ? `: ${f.valueType}` : '';
            const spreads = (f.propSpreads || []).map(s => `{...${s}}`).join('\n            ');
            const autocompleteProps = f.props ? Object.entries(f.props).map(([k, v]) => `${k}={${v}}`).join('\n            ') : '';

            input = `      <Field
        name="${f.name}"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={${tPlace}}
            loadOptions={createSelectFetcher(${f.loadOptions}, '${f.searchParam || 'name'}'${extraQuery})}
            defaultOptions
            getOptionValue={(option${vType}) => option.${f.valueField || 'url'}}
            getOptionLabel={(option${vType}) => option.${f.labelField || 'name'}}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            ${commonSelectProps}
            className="metronic-select-container"
            ${spreads}
            ${autocompleteProps}
          />
        )}
      />\n`;
        } else if (f.component === 'Select') {
            const optionsVar = f.optionsPlaceholder?.replace(/^props\./, 'props.');
            const vType = f.valueType ? `: ${f.valueType}` : '';
            const selectProps = f.props ? Object.entries(f.props).map(([k, v]) => `${k}={${v}}`).join('\n            ') : '';

            input = `      <Field
        name="${f.name}"
        component={(fieldProps) => (
          <Select
            placeholder={${tPlace}}
            options={${optionsVar}}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            ${f.valueField ? `getOptionValue={(option${vType}) => option.${f.valueField}}` : ''}
            ${f.labelField ? `getOptionLabel={(option${vType}) => option.${f.labelField}}` : ''}
            ${commonSelectProps}
            ${selectProps}
          />
        )}
      />\n`;
        } else {
            input = `      <${f.component} ${customProps} />\n`;
        }

        const valLabel = ['StringField', 'DateField'].includes(f.component)
            ? ''
            : `getValueLabel={(value${f.valueType ? `: ${f.valueType}` : ''}) => value?.${f.labelField || 'label'}}`;

        let jsx = `    <TableFilterItem
      title={${tLabel}}
      name="${f.name}"
      ${valLabel}
    >
${input}    </TableFilterItem>\n`;

        return f.feature ? `    {isFeatureVisible(MarketplaceFeatures.${f.feature}) && (
${jsx}    )}\n` : jsx;
    }

    static selector(f) {
        let logic = '';
        const isUuid = f.name.endsWith('_uuid') || (typeof f.mapTo === 'string' && f.mapTo.endsWith('_uuid'));
        const vProp = f.valueField || (f.component === 'Autocomplete' ? (isUuid ? 'uuid' : 'url') : 'value');

        if (f.mapTo === true) {
            logic = `        Object.assign(filter, values.${f.name}.value);\n`;
        } else if (typeof f.mapTo === 'object') {
            Object.entries(f.mapTo).forEach(([k, path]) => { logic += `        filter.${k} = values.${f.name}.${path};\n`; });
        } else {
            const target = f.mapTo || f.name;
            const access = ['Autocomplete', 'Select'].includes(f.component)
                ? (f.isMulti ? `.map(v => v.${vProp})` : `.${vProp}`)
                : '';
            logic = `        filter.${target} = values.${f.name}${access}${f.isMulti ? ' as any' : ''};\n`;
        }
        return `      if (values.${f.name}) {\n${logic}      }\n`;
    }

    static file(opIds, operationFilters, enumRegistry, config) {
        const usedEnums = new Set();
        opIds.forEach(id => operationFilters[id].forEach(f => f.optionsPlaceholder && enumRegistry.has(f.optionsPlaceholder) && usedEnums.add(f.optionsPlaceholder)));

        const componentsCode = opIds.map(id => {
            const filters = operationFilters[id];
            const pascalId = utils.toPascalCase(id).replace(/(?:List|Retrieve)$/, '');
            const compName = config.overrides[id]?.componentName || `${pascalId}Filter`;
            const usesProps = filters.some(f => JSON.stringify(f).includes('props.'));

            const interfaceFields = filters.map(f => {
                let type = 'any';
                if (['StringField', 'DateField'].includes(f.component)) type = 'string';
                else if (f.component === 'AwesomeCheckboxField') type = 'boolean';
                else if (f.valueType) type = f.valueType;
                else if (f.optionsPlaceholder && enumRegistry.has(f.optionsPlaceholder)) type = `${f.optionsPlaceholder}Option`;
                return `  ${f.name}: ${f.isMulti ? `${type}[]` : type};`;
            }).join('\n');

            let propsInterface = '';
            if (usesProps) {
                const pFields = new Set();
                filters.forEach(f => {
                    if (f.optionsPlaceholder?.startsWith('props.')) pFields.add(`  ${f.optionsPlaceholder.split('.')[1]}: any[];`);
                    if (f.extraQuery) Object.values(f.extraQuery).forEach(v => typeof v === 'string' && v.startsWith('props.') && pFields.add(`  ${v.split('.')[1]}: any;`));
                });
                if (pFields.size) propsInterface = `interface ${compName}Props {\n${Array.from(pFields).join('\n')}\n}\n\n`;
            }

            return `export const Pure${compName}: FunctionComponent<${usesProps ? `${compName}Props` : 'any'}> = (${usesProps ? 'props' : '_props'}) => (
  <>
${filters.map(Generator.field).join('')}  </>
);

export const ${compName}FormId = '${config.overrides[id]?.formId || compName}';

${propsInterface}interface ${compName}FormData {
${interfaceFields}
}

export const ${compName} = reduxForm<${compName}FormData, ${usesProps ? `${compName}Props` : 'any'}>({
  form: ${compName}FormId,
  destroyOnUnmount: false,
})(Pure${compName});

export const select${compName} = createSelector(
  getFormValues(${compName}FormId),
  (values: ${compName}FormData | undefined) => {
    const filter: ${utils.toPascalCase(id)}Data['query'] = {};
    if (values) {
${filters.map(Generator.selector).join('')}    }
    return filter;
  }
);
`;
        }).join('\n');

        return [
            `// This file is auto-generated. Do not edit manually.`,
            `/* eslint-disable @typescript-eslint/no-unused-vars */`,
            this.imports(opIds, operationFilters, config),
            this.enums(enumRegistry, usedEnums),
            componentsCode
        ].join('\n\n');
    }

    static enums(reg, used) {
        return Array.from(used).sort().map(name => {
            const opts = JSON.parse(reg.get(name));
            const json = JSON.stringify(opts, null, 2).replace(/"label":\s*"([^"]+)"/g, '"label": translate("$1")');
            const vTypes = new Set(opts.map(o => typeof o.value));
            return `const ${name} = ${json};\ninterface ${name}Option { label: string; value: ${vTypes.size === 1 ? Array.from(vTypes)[0] : 'any'}; }\n`;
        }).join('\n');
    }

    static imports(opIds, opFilters, config) {
        const sdk = new Set();
        const comps = new Set();
        const extras = new Set();

        opIds.forEach(id => {
            sdk.add(`${utils.toPascalCase(id)}Data`);
            (config.overrides[id]?.extraImports || []).forEach(i => extras.add(i));
            opFilters[id].forEach(f => {
                if (f.loadOptions) sdk.add(f.loadOptions);
                if (f.valueType) sdk.add(f.valueType);
                if (f.feature) comps.add('feature');
                if (f.component === 'Autocomplete') comps.add('AsyncPaginate');
                if (f.component === 'Select' || f.options) comps.add('Select');
            });
        });

        const lines = [
            `import { translate } from '@waldur/i18n';`,
            `import { FunctionComponent } from 'react';`,
            `import { Field, getFormValues, reduxForm } from 'redux-form';`,
            `import { createSelector } from 'reselect';`,
            `import { TableFilterItem } from '@waldur/table/TableFilterItem';`,
        ];

        if (comps.has('feature')) {
            lines.push(`import { isFeatureVisible } from '@waldur/features/connect';`);
            lines.push(`import { MarketplaceFeatures } from '@waldur/FeaturesEnums';`);
        }

        const hasComp = (c) => Array.from(opIds).some(id => opFilters[id].some(f => f.component === c));
        if (hasComp('AwesomeCheckboxField')) lines.push(`import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';`);
        if (hasComp('DateField')) lines.push(`import { DateField } from '@waldur/form/DateField';`);
        if (hasComp('StringField')) lines.push(`import { StringField } from '@waldur/form';`);

        const themed = [
            comps.has('Select') && 'Select',
            comps.has('AsyncPaginate') && 'AsyncPaginate',
            (comps.has('Select') || comps.has('AsyncPaginate')) && 'REACT_SELECT_TABLE_FILTER'
        ].filter(Boolean);

        if (themed.length > 0) {
            lines.push(`import { ${themed.join(', ')} } from '@waldur/form/themed-select';`);
        }

        if (comps.has('AsyncPaginate')) lines.push(`import { createSelectFetcher } from '@waldur/table/api';`);
        lines.push(`import { ${Array.from(sdk).sort().join(', ')} } from 'waldur-js-client';`);

        return [...lines, ...Array.from(extras)].join('\n');
    }
}

// --- Runner ---

function run() {
    const schema = yaml.load(fs.readFileSync(SCHEMA_PATH, 'utf8'));
    const config = fs.existsSync(CONFIG_PATH) ? yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')) : { overrides: {} };
    const proc = new SchemaProcessor(schema);
    const mapper = new FilterMapper(proc, config);

    const operationFilters = {};
    const targetOps = new Set([...Object.keys(config.overrides || {}), ...Object.keys(config.extraFilters || {})]);

    targetOps.forEach(id => {
        const filters = mapper.getFiltersForOp(id);
        if (filters.length) operationFilters[id] = filters;
    });

    const outputFiles = new Map();
    Object.keys(operationFilters).sort().forEach(id => {
        const out = config.overrides[id]?.output || `./src/table/generated/${utils.toPascalCase(id).replace(/(?:List|Retrieve)$/, '')}Filter.tsx`;
        const fullPath = path.resolve(__dirname, out);
        if (!outputFiles.has(fullPath)) outputFiles.set(fullPath, []);
        outputFiles.get(fullPath).push(id);
    });

    for (const [filePath, opIds] of outputFiles) {
        const content = Generator.file(opIds, operationFilters, mapper.enumRegistry, config);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        console.log(`Generated ${opIds.length} filters in ${filePath}`);
    }
}


if (require.main === module) {
    run();
}

module.exports = {
    utils,
    SchemaProcessor,
    FilterMapper,
    Generator
};
