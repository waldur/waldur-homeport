const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// --- Constants & Config ---
const SCHEMA_PATH = path.resolve(__dirname, './waldur_api.yaml');
const CONFIG_PATH = path.resolve(__dirname, './generate-filters-config.yaml');

const ABBREVIATIONS = [
  'IP',
  'ID',
  'API',
  'CPU',
  'RAM',
  'UUID',
  'RBAC',
  'OK',
  'MAC',
  'VM',
  'MD5',
  'SHA',
  'SHA256',
  'SHA512',
];
const SEARCH_CANDIDATES = [
  'query',
  'name',
  'email',
  'username',
  'full_name',
  'title',
  'customer_keyword',
  'keyword',
];
const LABEL_CANDIDATES = [
  'name',
  'title',
  'full_name',
  'username',
  'email',
  'label',
  'slug',
  'customer_name',
  'organization_name',
];
const VALUE_CANDIDATES = ['uuid', 'url', 'id', 'pk', 'value'];

// --- Utility Functions ---
const utils = {
  humanize(str) {
    if (!str) return '';
    let h = str.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    h = h.charAt(0).toUpperCase() + h.slice(1);
    ABBREVIATIONS.forEach(
      (abbr) => (h = h.replace(new RegExp(`\\b${abbr}\\b`, 'gi'), abbr)),
    );
    return h;
  },
  toCamelCase: (s) => s?.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) || '',
  toPascalCase: (s) => {
    const c = utils.toCamelCase(s);
    return c.charAt(0).toUpperCase() + c.slice(1);
  },
  resolveRef(ref, root) {
    if (!ref?.startsWith('#/')) return null;
    return ref
      .split('/')
      .slice(1)
      .reduce((curr, part) => curr?.[part], root);
  },
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
        const options = def.enum.map((val, i) => ({
          label: def['x-waldur-enum-names'][i],
          value: val,
        }));
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

        const params = (op.parameters || [])
          .filter((p) => p.in === 'query')
          .map((p) => p.name);
        this.searchFields.set(
          op.operationId,
          SEARCH_CANDIDATES.find((c) => params.includes(c)),
        );

        const resp =
          op.responses?.['200']?.content?.['application/json']?.schema;
        if (!resp) continue;
        let s = resp.$ref ? utils.resolveRef(resp.$ref, this.schema) : resp;
        if (s?.type === 'array' && s.items) {
          let item = s.items.$ref
            ? utils.resolveRef(s.items.$ref, this.schema)
            : s.items;
          if (item?.properties) {
            const props = Object.keys(item.properties);
            let returnType = s.items.$ref?.split('/').pop();
            if (returnType === 'NameUUID') returnType = 'NameUuid';
            this.responseFields.set(op.operationId, {
              valueField:
                VALUE_CANDIDATES.find((c) => props.includes(c)) || 'uuid',
              labelField:
                LABEL_CANDIDATES.find((c) => props.includes(c)) || 'name',
              props,
              returnType,
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
    const pathEntry = Object.entries(this.proc.schema.paths).find(
      ([_, m]) => m.get?.operationId === opId,
    );
    if (!pathEntry) return [];

    const queryParams = (pathEntry[1].get.parameters || []).filter(
      (p) => p.in === 'query',
    );
    const opOverrides = this.config.overrides[opId] || {};
    const extraFilters = this.config.extraFilters?.[opId] || [];

    let filters = [];
    if (opOverrides.filters) {
      filters = opOverrides.filters.map((name) => {
        const param = queryParams.find((p) => p.name === name) || { name };
        return this.mapParameter(param, opId);
      });
    } else {
      filters = queryParams.map((param) => {
        return this.mapParameter(param, opId);
      });
    }

    if (extraFilters.length) {
      extraFilters.forEach((f) => {
        if (f.loadOptions && f.loadOptions.endsWith('_retrieve')) {
          const listOp = f.loadOptions.replace(/_retrieve$/, '_list');
          f.loadOptions = this.proc.allOperationIds.has(listOp)
            ? utils.toCamelCase(listOp)
            : utils.toCamelCase(f.loadOptions);
        }
        filters.push(f);
      });
    }

    return this._deduplicateAndFinalize(filters);
  }

  mapParameter(param, opId, manualOverrides = {}) {
    const configOverrides =
      opId && param.name ? this.config.overrides[opId]?.[param.name] || {} : {};
    const overrides = { ...configOverrides, ...manualOverrides };
    let schema = param.schema || {};
    let schemaEnumName = null;
    if (schema.$ref) {
      schemaEnumName = schema.$ref.split('/').pop();
      if (schemaEnumName === 'NameUUID') schemaEnumName = 'NameUuid';
      schema = utils.resolveRef(schema.$ref, this.proc.schema) || schema;
    } else if (schema.items?.$ref) {
      schemaEnumName = schema.items.$ref.split('/').pop();
      if (schemaEnumName === 'NameUUID') schemaEnumName = 'NameUuid';
    }

    const originalName = param.name;
    const isMulti = schema.type === 'array' || undefined;
    const filter = {
      name: param.name.endsWith('_uuid')
        ? param.name.replace(/_uuid$/, '')
        : param.name,
      label: utils.humanize(param.name.replace(/_uuid$/, '')),
      mapTo: param.name.endsWith('_uuid') ? param.name : undefined,
      isMulti,
    };

    const targetOp = overrides.operationId || param['x-waldur-operation-id'];

    if (targetOp && !overrides.options && !overrides.enumOverrides) {
      this._mapAutocomplete(filter, targetOp);
    } else {
      this._mapStandard(filter, param, schema, schemaEnumName, overrides);
    }

    Object.assign(filter, overrides);

    if (isMulti && filter.isMulti === undefined) {
      filter.isMulti = true;
    }

    if (!filter.mapTo && filter.name !== originalName) {
      filter.mapTo = originalName;
    }

    if (
      overrides.component &&
      !['Select', 'Autocomplete'].includes(overrides.component)
    ) {
      ['options', 'optionsPlaceholder', 'enumName'].forEach(
        (k) => delete filter[k],
      );
    }

    return filter;
  }

  _mapAutocomplete(filter, targetOp) {
    filter.component = 'Autocomplete';
    let listOp = targetOp.endsWith('_retrieve')
      ? targetOp.replace('_retrieve', '_list')
      : targetOp;
    if (this.proc.allOperationIds.has(listOp)) {
      filter.loadOptions = utils.toCamelCase(listOp);
      filter.searchParam = this.proc.searchFields.get(listOp) || 'name';
      const resp = this.proc.responseFields.get(listOp) || {
        valueField: 'uuid',
        labelField: 'name',
      };
      filter.valueField = resp.valueField;
      filter.labelField = resp.labelField;
      if (resp.returnType) filter.valueType = resp.returnType;

      const finalName = filter.mapTo || filter.name;
      if (finalName.endsWith('_uuid') && resp.props?.includes(finalName)) {
        filter.valueField = finalName;
      }
    }
  }

  _mapStandard(filter, param, schema, schemaEnumName, overrides) {
    const enumOptions =
      schema.enum ||
      (schema.items?.$ref
        ? utils.resolveRef(schema.items.$ref, this.proc.schema)?.enum
        : schema.items?.enum);

    if (overrides.options || overrides.enumOverrides || enumOptions) {
      filter.component = 'Select';
      if (
        typeof overrides.options === 'string' &&
        overrides.options.startsWith('props.')
      ) {
        filter.optionsPlaceholder = overrides.options;
        return;
      }

      const source =
        overrides.options || overrides.enumOverrides || enumOptions;
      const options = (
        Array.isArray(source) ? source : Object.keys(source)
      ).map((opt) => {
        if (typeof opt === 'object' && opt.label && opt.value !== undefined)
          return opt;
        return {
          label: overrides.enumOverrides?.[opt] || utils.humanize(String(opt)),
          value:
            opt === 'true'
              ? true
              : opt === 'false'
                ? false
                : opt === 'null'
                  ? null
                  : opt,
        };
      });

      const key = JSON.stringify(
        [...options].sort((a, b) =>
          String(a.value).localeCompare(String(b.value)),
        ),
      );
      let finalEnumName =
        overrides.enumName ||
        schemaEnumName ||
        this.proc.namedEnums.get(key) ||
        utils.toPascalCase(param.name);
      if (!finalEnumName.endsWith('Choices')) {
        finalEnumName += 'Choices';
      }

      this._registerEnum(
        key,
        finalEnumName,
        filter,
        overrides.valueType || schemaEnumName,
      );
      filter.options = options;
    } else if (schema.type === 'boolean') {
      filter.component = 'AwesomeCheckboxField';
    } else if (schema.format === 'date' || schema.format === 'date-time') {
      filter.component = 'DateField';
    } else if (schema.type === 'number' || schema.type === 'integer') {
      filter.component = 'NumberField';
    } else {
      filter.component = 'StringField';
    }
  }

  _registerEnum(key, name, filter, valueType) {
    if (this.enumReverseRegistry.has(key)) {
      filter.optionsPlaceholder = this.enumReverseRegistry.get(key);
    } else {
      let uniqueName = name;
      let i = 1;
      while (
        this.enumRegistry.has(uniqueName) &&
        this.enumRegistry.get(uniqueName).options !== key
      ) {
        uniqueName = `${name}_${i++}`;
      }
      this.enumRegistry.set(uniqueName, { options: key, valueType });
      this.enumReverseRegistry.set(key, uniqueName);
      filter.optionsPlaceholder = uniqueName;
    }
  }

  _deduplicateAndFinalize(filters) {
    const map = new Map();
    filters.forEach((f) => map.set(f.name, f));
    return Array.from(map.values());
  }
}

// --- Generator Module ---

class Generator {
  static field(f, enumRegistry) {
    const tLabel = `translate("${f.label}")`;
    const tPlace = `translate("${f.placeholder || f.label}")`;
    const commonSelectProps = [
      `isClearable={true}`,
      f.isMulti ? `isMulti={true}` : null,
      `{...REACT_SELECT_TABLE_FILTER}`,
    ]
      .filter(Boolean)
      .join('\n            ');

    let input = '';
    const customProps = f.props
      ? Object.entries(f.props)
          .map(([k, v]) => `${k}={${v}}`)
          .join('\n        ')
      : '';

    // Determine Badge/Label logic
    let valLabel = '';
    if (f.component === 'AwesomeCheckboxField') {
      const trueLabel = f.badgeLabels?.true || f.label;
      const falseLabel = f.badgeLabels?.false || 'All';
      valLabel = `badgeValue={(value) =>
      value ? translate("${trueLabel}") : translate("${falseLabel}")
    }\n      ellipsis={false}`;
    } else if (
      ['StringField', 'NumberField', 'DateField'].includes(f.component)
    ) {
      valLabel = '';
    } else {
      const typeAnn =
        f.optionsPlaceholder && enumRegistry?.has(f.optionsPlaceholder)
          ? `: ${f.optionsPlaceholder}Option`
          : f.valueType
            ? `: ${f.valueType}`
            : '';
      const access = f.labelField ? `?.${f.labelField}` : '?.label';
      const argType =
        f.optionsPlaceholder && enumRegistry?.has(f.optionsPlaceholder)
          ? `${f.optionsPlaceholder}Option`
          : f.valueType || 'any';
      valLabel = `getValueLabel={(value: ${argType}${f.isMulti ? '[]' : ''}) => ${f.isMulti ? `value?.map((v) => v${access}).join(', ')` : `value${access}`}}`;
    }

    // Generate Field Inputs
    if (
      [
        'StringField',
        'NumberField',
        'DateField',
        'AwesomeCheckboxField',
      ].includes(f.component)
    ) {
      const extraProps =
        f.component === 'AwesomeCheckboxField'
          ? `label={${tLabel}} parse={(v) => v || undefined}`
          : `placeholder={${tPlace}}`;
      input = `      <Field
        name="${f.name}"
        component={${f.component}}
        ${extraProps}
        ${customProps}
      />\n`;
        } else if (f.component === 'Autocomplete') {
            const extraQuery = f.extraQuery ? `, ${JSON.stringify(f.extraQuery).replace(/"(props\.[a-zA-Z0-9_.]+)"/g, '$1')}` : '';
            const extraPath = f.extraPath ? `, ${JSON.stringify(f.extraPath).replace(/"(props\.[a-zA-Z0-9_.]+)"/g, '$1')}` : '';
            const vType = f.valueType ? `: ${f.valueType}` : '';
            const spreads = (f.propSpreads || []).map(s => `{...${s}}`).join('\n            ');
            const autocompleteProps = f.props ? Object.entries(f.props).map(([k, v]) => `${k}={${v}}`).join('\n            ') : '';

            input = `      <Field
        name="${f.name}"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={${tPlace}}
            loadOptions={createSelectFetcher(${f.loadOptions}, '${f.searchParam || 'name'}'${extraQuery || (extraPath ? ', {}' : '')}${extraPath})}
            defaultOptions
            getOptionValue={props.getOptionValue || ((option${vType}) => String(option.${f.valueField || 'url'} || ''))}
            getOptionLabel={props.getOptionLabel || ((option${vType}) => String(option.${f.labelField || 'name'} || ''))}
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
      const selectProps = f.props
        ? Object.entries(f.props)
            .map(([k, v]) => `${k}={${v}}`)
            .join('\n            ')
        : '';

      const defaultVal =
        f.optionsPlaceholder && enumRegistry?.has(f.optionsPlaceholder)
          ? `getOptionValue={(option: ${f.optionsPlaceholder}Option) => option.value}`
          : `getOptionValue={(option: any) => option.value}`;
      const defaultLabel =
        f.optionsPlaceholder && enumRegistry?.has(f.optionsPlaceholder)
          ? `getOptionLabel={(option: ${f.optionsPlaceholder}Option) => option.label}`
          : `getOptionLabel={(option: any) => option.label}`;

      input = `      <Field
        name="${f.name}"
        component={(fieldProps) => (
          <Select
            placeholder={${tPlace}}
            options={${optionsVar}}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            ${f.valueField ? `getOptionValue={(option${vType}) => String(option.${f.valueField})}` : optionsVar.startsWith('props.') ? '' : `getOptionValue={(option: ${f.optionsPlaceholder}Option) => String(option.value)}`}
            ${f.labelField ? `getOptionLabel={(option${vType}) => option.${f.labelField}}` : optionsVar.startsWith('props.') ? '' : `getOptionLabel={(option: ${f.optionsPlaceholder}Option) => option.label}`}
            ${commonSelectProps}
            ${selectProps}
          />
        )}
      />\n`;
    } else {
      input = `      <${f.component} ${customProps} />\n`;
    }

    let jsx = `    <TableFilterItem
      title={${tLabel}}
      name="${f.name}"
      ${valLabel || (f.optionsPlaceholder && enumRegistry?.has(f.optionsPlaceholder) ? `getValueLabel={(value: ${f.optionsPlaceholder}Option) => value?.label}` : '')}
    >
${input}    </TableFilterItem>\n`;

    if (f.isHidden) {
      const hiddenCond =
        typeof f.isHidden === 'string' && f.isHidden.startsWith('props.')
          ? f.isHidden
          : JSON.stringify(f.isHidden);
      jsx = `    {!(${hiddenCond}) && (
${jsx}    )}\n`;
    }

    return f.feature
      ? `    {isFeatureVisible(MarketplaceFeatures.${f.feature}) && (
${jsx}    )}\n`
      : jsx;
  }

  static selector(f) {
    let logic = '';
    const isUuid =
      f.name.endsWith('_uuid') ||
      (typeof f.mapTo === 'string' && f.mapTo.endsWith('_uuid'));
    const vProp =
      f.valueField ||
      (f.component === 'Autocomplete' ? (isUuid ? 'uuid' : 'url') : 'value');

    if (f.mapTo === false) {
      return '';
    }
    if (f.mapTo === true) {
      logic = `        Object.assign(filter, values.${f.name}.value);\n`;
    } else if (typeof f.mapTo === 'object') {
      Object.entries(f.mapTo).forEach(([k, path]) => {
        logic += `        filter.${k} = values.${f.name}.${path};\n`;
      });
    } else {
      const target = f.mapTo || f.name;
      const access = ['Autocomplete', 'Select'].includes(f.component)
        ? f.isMulti
          ? `.map((v: any) => v.${vProp})`
          : `.${vProp}`
        : '';
      const val = `values.${f.name}${access}`;
      logic = `        filter.${target} = ${f.isMulti && !['Autocomplete', 'Select'].includes(f.component) ? `[${val}]` : val};\n`;
    }
    return `      if (values.${f.name}) {\n${logic}      }\n`;
  }

  static file(opIds, operationFilters, enumRegistry, config) {
    const usedEnums = new Set();
    opIds.forEach((id) =>
      operationFilters[id].forEach(
        (f) =>
          f.optionsPlaceholder &&
          enumRegistry.has(f.optionsPlaceholder) &&
          usedEnums.add(f.optionsPlaceholder),
      ),
    );

    const componentsCode = opIds
      .map((id) => {
        const filters = operationFilters[id];
        // 1. Generate the SDK Type name (e.g., "InvoicesItemsRetrieveData")
        const sdkDataType = `${utils.toPascalCase(id)}Data`;

        // 2. Generate the Component Name (e.g., "InvoicesItemsFilter")
        const cleanId = utils
          .toPascalCase(id)
          .replace(/(?:List|Retrieve|Create|Update|Delete)$/, '');
        const compName =
          config.overrides[id]?.componentName || `${cleanId}Filter`;
        const usesProps = filters.some(
          (f) =>
            JSON.stringify(f).includes('props.') ||
            f.component === 'Autocomplete' ||
            (typeof f.isHidden === 'string' && f.isHidden.includes('props.')),
        );

        const interfaceFields = filters
          .map((f) => {
            let type = 'any';
            if (['StringField', 'DateField'].includes(f.component))
              type = 'string';
            else if (f.component === 'NumberField') type = 'number';
            else if (f.component === 'AwesomeCheckboxField') type = 'boolean';
            else if (
              f.optionsPlaceholder &&
              enumRegistry.has(f.optionsPlaceholder)
            ) {
              type = `${f.optionsPlaceholder}Option`;
              if (f.isMulti) type += '[]';
            } else if (f.valueType) type = f.valueType;
            return `  ${f.name}: ${f.isMulti && !type.endsWith('[]') ? `${type}[]` : type};`;
          })
          .join('\n');

        let propsInterface = '';
        if (usesProps) {
          const pFields = new Set();
          filters.forEach((f) => {
            if (f.optionsPlaceholder?.startsWith('props.'))
              pFields.add(`  ${f.optionsPlaceholder.split('.')[1]}?: any[];`);
            if (f.extraQuery) {
              const qValues =
                typeof f.extraQuery === 'object'
                  ? Object.values(f.extraQuery)
                  : [f.extraQuery];
              qValues.forEach(
                (v) =>
                  typeof v === 'string' &&
                  v.startsWith('props.') &&
                  pFields.add(`  ${v.split('.')[1]}?: any;`),
              );
            }
            if (f.extraPath) {
              const pValues =
                typeof f.extraPath === 'object'
                  ? Object.values(f.extraPath)
                  : [f.extraPath];
              pValues.forEach(
                (v) =>
                  typeof v === 'string' &&
                  v.startsWith('props.') &&
                  pFields.add(`  ${v.split('.')[1]}?: any;`),
              );
            }
            if (
              typeof f.isHidden === 'string' &&
              f.isHidden.startsWith('props.')
            ) {
              pFields.add(`  ${f.isHidden.split('.')[1]}?: boolean;`);
            }
            if (f.component === 'Autocomplete') {
              pFields.add(`  getOptionLabel?: (option: any) => string;`);
              pFields.add(`  getOptionValue?: (option: any) => string;`);
            }
          });
          if (pFields.size)
            propsInterface = `interface ${compName}Props {\n${Array.from(pFields).sort().join('\n')}\n}\n\n`;
        }

        return `export const Pure${compName}: FunctionComponent<${usesProps ? `${compName}Props` : '{}'}> = (${usesProps ? 'props' : '_props'}) => (
  <>
${filters.map((f) => Generator.field(f, enumRegistry)).join('')}  </>
);

export const ${compName}FormId = '${config.overrides[id]?.formId || compName}';

${propsInterface}interface ${compName}FormData {
${interfaceFields}
}

export const ${compName} = reduxForm<${compName}FormData, ${usesProps ? `${compName}Props` : '{}'}>({
  form: ${compName}FormId,
  destroyOnUnmount: false,
})(Pure${compName});

export const select${compName} = createSelector(
  getFormValues(${compName}FormId),
    (values: ${compName}FormData | undefined) => {
    const filter: ${sdkDataType}['query'] = {};
    if (values) {
${filters.map(Generator.selector).join('')}    }
    return filter;
  }
);
`;
      })
      .join('\n');

    return [
      `// This file is auto-generated. Do not edit manually.`,
      `/* eslint-disable @typescript-eslint/no-unused-vars */`,
      this.imports(opIds, operationFilters, enumRegistry, config),
      this.enums(enumRegistry, usedEnums),
      componentsCode,
    ].join('\n\n');
  }

  static enums(reg, used) {
    return Array.from(used)
      .sort()
      .map((name) => {
        const entry = reg.get(name);
        const opts = JSON.parse(entry.options);
        const json = JSON.stringify(opts, null, 2).replace(
          /"label":\s*"([^"]+)"/g,
          '"label": translate("$1")',
        );
        const vTypes = entry.valueType
          ? [entry.valueType]
          : Array.from(new Set(opts.map((o) => typeof o.value)));
        return `export const ${name}: ${name}Option[] = ${json};\nexport interface ${name}Option { label: string; value: ${vTypes.length === 1 ? vTypes[0] : 'any'}; }\n`;
      })
      .join('\n');
  }

  static imports(opIds, opFilters, enumRegistry, config) {
    const sdk = new Set();
    const comps = new Set();
    const extras = new Set();

    opIds.forEach((id) => {
      const sdkDataType = `${utils.toPascalCase(id)}Data`;
      sdk.add(sdkDataType);
      (config.overrides[id]?.extraImports || []).forEach((i) => extras.add(i));
      opFilters[id].forEach((f) => {
        if (f.loadOptions) sdk.add(f.loadOptions);
        if (f.valueType) sdk.add(f.valueType);
        if (f.optionsPlaceholder && enumRegistry?.has(f.optionsPlaceholder)) {
          const vt = enumRegistry.get(f.optionsPlaceholder).valueType;
          if (vt && !['string', 'number', 'boolean', 'any'].includes(vt)) {
            sdk.add(vt);
          }
        }
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
      lines.push(
        `import { isFeatureVisible } from '@waldur/features/connect';`,
      );
      lines.push(
        `import { MarketplaceFeatures } from '@waldur/FeaturesEnums';`,
      );
    }

    const hasComp = (c) =>
      Array.from(opIds).some((id) =>
        opFilters[id].some((f) => f.component === c),
      );
    if (hasComp('AwesomeCheckboxField'))
      lines.push(
        `import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';`,
      );
    if (hasComp('DateField'))
      lines.push(`import { DateField } from '@waldur/form/DateField';`);
    const formFields = [];
    if (hasComp('StringField')) formFields.push('StringField');
    if (hasComp('NumberField')) formFields.push('NumberField');
    if (formFields.length)
      lines.push(`import { ${formFields.join(', ')} } from '@waldur/form';`);

    const themed = [
      comps.has('Select') && 'Select',
      comps.has('AsyncPaginate') && 'AsyncPaginate',
      (comps.has('Select') || comps.has('AsyncPaginate')) &&
        'REACT_SELECT_TABLE_FILTER',
    ].filter(Boolean);

    if (themed.length > 0) {
      lines.push(
        `import { ${themed.join(', ')} } from '@waldur/form/themed-select';`,
      );
    }

    if (comps.has('AsyncPaginate'))
      lines.push(`import { createSelectFetcher } from '@waldur/table/api';`);
    lines.push(
      `import { ${Array.from(sdk).sort().join(', ')} } from 'waldur-js-client';`,
    );

    return [...lines, ...Array.from(extras)].join('\n');
  }
}

// --- Runner ---

function run() {
  const schema = yaml.load(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const config = fs.existsSync(CONFIG_PATH)
    ? yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8'))
    : { overrides: {} };
  const proc = new SchemaProcessor(schema);
  const mapper = new FilterMapper(proc, config);

  const operationFilters = {};
  const targetOps = new Set([
    ...Object.keys(config.overrides || {}),
    ...Object.keys(config.extraFilters || {}),
  ]);

  targetOps.forEach((id) => {
    const filters = mapper.getFiltersForOp(id);
    if (filters.length) operationFilters[id] = filters;
  });

  const outputFiles = new Map();
  Object.keys(operationFilters)
    .sort()
    .forEach((id) => {
      const out =
        config.overrides[id]?.output ||
        `./src/table/generated/${utils.toPascalCase(id).replace(/(?:List|Retrieve)$/, '')}Filter.tsx`;
      const fullPath = path.resolve(__dirname, out);
      if (!outputFiles.has(fullPath)) outputFiles.set(fullPath, []);
      outputFiles.get(fullPath).push(id);
    });

  for (const [filePath, opIds] of outputFiles) {
    const content = Generator.file(
      opIds,
      operationFilters,
      mapper.enumRegistry,
      config,
    );
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    console.log(`Generated ${opIds.length} filters in ${filePath}`);
  }

  // Format generated files
  try {
    console.log('Running ESLint fix on generated files...');
    execSync('npx eslint --fix "src/table/generated/*.tsx"', {
      stdio: 'inherit',
    });
    console.log('Formatting generated files with Prettier...');
    execSync('npx prettier --write "src/table/generated/*.tsx"', {
      stdio: 'inherit',
    });
  } catch (error) {
    console.warn('Failed to format files:', error.message);
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  utils,
  SchemaProcessor,
  FilterMapper,
  Generator,
};
