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
  toPascalCase: (s) => {
    if (!s) return '';
    return s
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  },
  toCamelCase: (s) => {
    const p = utils.toPascalCase(s);
    return p.charAt(0).toLowerCase() + p.slice(1);
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
  constructor(schema, config) {
    this.schema = schema;
    this.config = config;
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
      const enumNames = def['x-enum-descriptions'];
      if (def.enum && enumNames) {
        const options = def.enum.map((val, i) => ({
          label: enumNames[i],
          value: val,
        }));
        map.set(name, JSON.stringify(options));
      }
    }
    // Merge extra enums from config
    if (this.config.extraEnums) {
      for (const [name, options] of Object.entries(this.config.extraEnums)) {
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
        if (!resp) {
          this.responseFields.set(op.operationId, {
            returnType: `${utils.toPascalCase(op.operationId)}Data`,
          });
          continue;
        }
        let s = resp.$ref ? utils.resolveRef(resp.$ref, this.schema) : resp;
        let returnType =
          resp.$ref?.split('/').pop() ||
          `${utils.toPascalCase(op.operationId)}Data`;
        returnType = utils.toPascalCase(returnType);

        if (s?.type === 'array' && s.items) {
          let item = s.items.$ref
            ? utils.resolveRef(s.items.$ref, this.schema)
            : s.items;
          const itemType = utils.toPascalCase(s.items.$ref?.split('/').pop());
          if (item?.properties) {
            const props = Object.keys(item.properties);
            this.responseFields.set(op.operationId, {
              valueField:
                VALUE_CANDIDATES.find((c) => props.includes(c)) || 'uuid',
              labelField:
                LABEL_CANDIDATES.find((c) => props.includes(c)) || 'name',
              props,
              returnType,
              itemType,
            });
          }
        } else {
          this.responseFields.set(op.operationId, {
            returnType,
          });
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

  getFiltersForOp(key) {
    const opOverrides = this.config.overrides[key] || {};
    const opId = opOverrides.operationId || `${key}_list`;
    const pathEntry = Object.entries(this.proc.schema.paths).find(
      ([_, m]) => m.get?.operationId === opId,
    );
    if (!pathEntry) return [];

    const queryParams = (pathEntry[1].get.parameters || []).filter(
      (p) => p.in === 'query',
    );
    const extraFilters = this.config.extraFilters?.[key] || [];

    let filters = [];
    if (opOverrides.filters) {
      filters = opOverrides.filters.map((name) => {
        const param = queryParams.find((p) => p.name === name) || { name };
        return this.mapParameter(param, key);
      });
    } else {
      filters = queryParams.map((param) => {
        return this.mapParameter(param, key);
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

    return this._collapseRangePairs(
      this._deduplicateAndFinalize(filters),
      key,
    );
  }

  mapParameter(param, opId, manualOverrides = {}) {
    const configOverrides =
      opId && param.name ? this.config.overrides[opId]?.[param.name] || {} : {};
    const overrides = { ...configOverrides, ...manualOverrides };
    let schema = param.schema || {};
    let schemaEnumName = null;
    if (schema.$ref) {
      schemaEnumName = utils.toPascalCase(schema.$ref.split('/').pop());
    } else if (schema.items?.$ref) {
      schemaEnumName = utils.toPascalCase(schema.items.$ref.split('/').pop());
    }
    if (schema.$ref) {
      schema = utils.resolveRef(schema.$ref, this.proc.schema) || schema;
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
      required: param.required || overrides.required,
    };

    const targetOp = overrides.operationId || param['x-waldur-operation-id'];

    if (targetOp && !overrides.options && !overrides.enumOverrides) {
      this._mapAutocomplete(filter, targetOp);
    } else {
      this._mapStandard(filter, param, schema, schemaEnumName, overrides, opId);
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
      filter.itemType = resp.itemType;
      if (resp.returnType) {
        filter.valueType = resp.itemType || resp.returnType;
      }

      const finalName = filter.mapTo || filter.name;
      if (finalName.endsWith('_uuid') && resp.props?.includes(finalName)) {
        filter.valueField = finalName;
      }
    }
  }

  _mapStandard(filter, param, schema, schemaEnumName, overrides, opId) {
    const enumOptions =
      schema.enum ||
      (schema.items?.$ref
        ? utils.resolveRef(schema.items.$ref, this.proc.schema)?.enum
        : schema.items?.enum);
    const enumNames =
      schema['x-enum-descriptions'] ||
      (schema.items?.$ref
        ? utils.resolveRef(schema.items.$ref, this.proc.schema)?.[
            'x-enum-descriptions'
          ]
        : schema.items?.['x-enum-descriptions']);

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
      ).map((opt, i) => {
        if (typeof opt === 'object' && opt.label && opt.value !== undefined)
          return opt;
        return {
          label:
            overrides.enumOverrides?.[opt] ||
            (enumOptions?.includes(opt) && enumNames ? enumNames[i] : null) ||
            utils.humanize(String(opt)),
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
      finalEnumName = finalEnumName
        .replace(/Enum$/, '')
        .replace(/Choices$/, '');
      if (!finalEnumName.endsWith('Options')) {
        finalEnumName += 'Options';
      }

      this._registerEnum(
        key,
        finalEnumName,
        filter,
        overrides.valueType || schemaEnumName,
        opId,
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

  _registerEnum(key, name, filter, valueType, opId) {
    if (this.enumReverseRegistry.has(key)) {
      filter.optionsPlaceholder = this.enumReverseRegistry.get(key);
    } else {
      let uniqueName = name;
      if (
        this.enumRegistry.has(uniqueName) &&
        this.enumRegistry.get(uniqueName).options !== key
      ) {
        const prefix = utils
          .toPascalCase(opId)
          .replace(/(?:List|Retrieve|Create|Update|Delete)$/, '');
        uniqueName = prefix + name;
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

  _collapseRangePairs(filters, opKey) {
    const numberFilters = new Map();
    for (const f of filters) {
      if (f.component !== 'NumberField') continue;
      const origName = f.mapTo || f.name;
      if (origName.endsWith('_min') || origName.endsWith('_max')) {
        const base = origName.replace(/_(min|max)$/, '');
        if (!numberFilters.has(base)) numberFilters.set(base, {});
        numberFilters.get(base)[origName.endsWith('_min') ? 'min' : 'max'] = f;
      }
    }

    for (const [base, pair] of numberFilters) {
      if (!pair.min || !pair.max) continue;
      const overrides =
        this.config.overrides[opKey]?.[pair.min.mapTo || pair.min.name] || {};
      const rangeName = overrides.rangeName || `${base}_range`;
      const rangeLabel =
        overrides.rangeLabel || utils.humanize(base);
      const merged = {
        name: rangeName,
        label: rangeLabel,
        component: 'RangeNumberField',
        rangeMinParam: pair.min.mapTo || pair.min.name,
        rangeMaxParam: pair.max.mapTo || pair.max.name,
      };
      const minIdx = filters.indexOf(pair.min);
      const maxIdx = filters.indexOf(pair.max);
      const hi = Math.max(minIdx, maxIdx);
      const lo = Math.min(minIdx, maxIdx);
      filters.splice(hi, 1);
      filters.splice(lo, 1, merged);
    }

    return filters;
  }
}

// --- Generator Module ---

class Generator {
  static field(f, enumRegistry) {
    const tLabel = `translate("${f.label}")`;
    const tPlace = `translate("${f.placeholder || f.label}")`;
    const commonSelectProps = [
      `isClearable={${!f.required}}`,
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
    } else if (f.component === 'RangeNumberField') {
      valLabel = 'badgeValue={formatRangeBadge}';
    } else if (
      ['StringField', 'NumberField', 'DateField'].includes(f.component)
    ) {
      valLabel = '';
    } else {
      let access = f.labelField ? `?.${f.labelField}` : '?.label';
      if (f.itemType === 'User') {
        access = '?.full_name || value?.username || value?.email';
      }
      const argType =
        f.optionsPlaceholder && enumRegistry?.has(f.optionsPlaceholder)
          ? f.optionsPlaceholder.replace(/Options$/, 'Option')
          : f.valueType || 'any';
      valLabel = `getValueLabel={(value: ${argType}) => value${access}}`;
    }

    const validation = f.required ? 'validate={[required]}' : '';

    // Generate Field Inputs
    if (f.component === 'RangeNumberField') {
      input = `      <Field
        name="${f.name}"
        component={RangeNumberField}
        min={0}
      />\n`;
    } else if (
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
        ${validation}
        ${customProps}
      />\n`;
    } else if (f.component === 'Autocomplete') {
      const extraQuery = f.extraQuery
        ? `, ${JSON.stringify(f.extraQuery).replace(/"(props\.[a-zA-Z0-9_.]+)"/g, '$1')}`
        : '';
      const extraPath = f.extraPath
        ? `, ${JSON.stringify(f.extraPath).replace(/"(props\.[a-zA-Z0-9_.]+)"/g, '$1')}`
        : '';
      const vType = f.valueType ? `: ${f.valueType}` : '';
      const spreads = (f.propSpreads || [])
        .map((s) => `{...${s}}`)
        .join('\n            ');
      const autocompleteProps = f.props
        ? Object.entries(f.props)
            .map(([k, v]) => `${k}={${v}}`)
            .join('\n            ')
        : '';

      const searchParam =
        f.searchParam === false
          ? ', null as any'
          : `, '${f.searchParam || 'name'}'`;

      input = `      <Field
        name="${f.name}"
        ${validation}
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={${tPlace}}
            loadOptions={createSelectFetcher(${f.loadOptions}${searchParam}${extraQuery || (extraPath ? ', {}' : '')}${extraPath})}
            defaultOptions
            getOptionValue={(option${vType}) => String(option.${f.valueField || 'url'} || '')}
            getOptionLabel={(option${vType}) => ${f.itemType === 'User' ? 'String(option.full_name || option.username || option.email || "")' : `String(option.${f.labelField || 'name'} || '')`}}
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

      input = `      <Field
        name="${f.name}"
        ${validation}
        component={(fieldProps) => (
          <Select
            placeholder={${tPlace}}
            options={${optionsVar}}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            ${f.valueField ? `getOptionValue={(option${vType}) => String(option.${f.valueField})}` : optionsVar.startsWith('props.') ? '' : `getOptionValue={(option: ${f.optionsPlaceholder.replace(/Options$/, 'Option')}) => String(option.value)}`}
            ${f.labelField ? `getOptionLabel={(option${vType}) => option.${f.labelField}}` : optionsVar.startsWith('props.') ? '' : `getOptionLabel={(option: ${f.optionsPlaceholder.replace(/Options$/, 'Option')}) => option.label}`}
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
      ${f.required ? 'hideRemoveButton={true}' : ''}
      ${valLabel || (f.optionsPlaceholder && enumRegistry?.has(f.optionsPlaceholder) ? `getValueLabel={(value: ${f.optionsPlaceholder.replace(/Options$/, 'Option')}) => value?.label}` : '')}
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
    if (f.component === 'RangeNumberField') {
      return (
        `      if (values.${f.name}?.min != null) {\n` +
        `        filter.${f.rangeMinParam} = values.${f.name}.min;\n` +
        `      }\n` +
        `      if (values.${f.name}?.max != null) {\n` +
        `        filter.${f.rangeMaxParam} = values.${f.name}.max;\n` +
        `      }\n`
      );
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

  static file(opIds, operationFilters, enumRegistry, config, processor) {
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
        const opId = config.overrides[id]?.operationId || `${id}_list`;
        // 1. Generate the SDK Type name (e.g., "InvoicesItemsRetrieveData")
        const sdkDataType = `${utils.toPascalCase(opId)}Data`;

        // 2. Generate the Component Name (e.g., "InvoicesItemsFilter")
        const cleanId = utils
          .toPascalCase(id)
          .replace(/(?:List|Retrieve|Create|Update|Delete)$/, '');
        const compName = `${cleanId}Filter`;
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
            else if (f.component === 'RangeNumberField')
              type = '{ min?: number; max?: number }';
            else if (f.component === 'AwesomeCheckboxField') type = 'boolean';
            else if (
              f.optionsPlaceholder &&
              enumRegistry.has(f.optionsPlaceholder)
            ) {
              type = f.optionsPlaceholder.replace(/Options$/, 'Option');
              if (f.isMulti) type += '[]';
            } else if (f.valueType) type = f.valueType;
            return `  ${f.name}: ${f.isMulti && !type.endsWith('[]') ? `${type}[]` : type};`;
          })
          .join('\n');

        const pFields = new Set();
        let propsInterface = '';
        if (usesProps) {
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
          });
          if (pFields.size)
            propsInterface = `interface ${compName}Props {\n${Array.from(pFields).sort().join('\n')}\n}\n\n`;
        }

        const propsInterfaceName = pFields.size ? `${compName}Props` : '{}';

        return `const Pure${compName}: FunctionComponent<${propsInterfaceName}> = (${pFields.size ? 'props' : ''}) => (
  <>
${filters.map((f) => Generator.field(f, enumRegistry)).join('')}  </>
);

export const ${compName}FormId = '${compName}';

${propsInterface}interface ${compName}FormData {
${interfaceFields}
}

export const ${compName} = reduxForm<${compName}FormData, ${propsInterfaceName}>({
  form: ${compName}FormId,
  destroyOnUnmount: false,
  ${config.overrides[id]?.initialValues ? `initialValues: ${JSON.stringify(config.overrides[id].initialValues).replace(/"label":\s*"([^"]+)"/g, '"label": translate("$1")')},` : ''}
})(Pure${compName});

type ${compName}Query = ${sdkDataType}['query'];

export const select${compName} = createSelector<
  RootState,
  Partial<${compName}FormData>,
  ${compName}Query
>(
  getFormValues(${compName}FormId),
  (values) => {
    const filter: ${compName}Query = {} as any;
    if (values) {
${filters.map(Generator.selector).join('')}    }
    return filter;
  }
);
`;
      })
      .join('\n');

    const hasRangeField = opIds.some((id) =>
      operationFilters[id].some((f) => f.component === 'RangeNumberField'),
    );

    const rangeHelper = hasRangeField
      ? `const formatRangeBadge = (value?: { min?: number; max?: number }) => {
  if (!value) return '';
  if (value.min != null && value.max != null) return \`\${value.min} – \${value.max}\`;
  if (value.min != null) return \`≥ \${value.min}\`;
  if (value.max != null) return \`≤ \${value.max}\`;
  return '';
};`
      : '';

    return [
      `// This file is auto-generated. Do not edit manually.`,
      `/* eslint-disable @typescript-eslint/no-unused-vars */`,
      this.imports(opIds, operationFilters, enumRegistry, config, processor),
      this.enums(enumRegistry, usedEnums),
      rangeHelper,
      componentsCode,
    ]
      .filter(Boolean)
      .join('\n\n');
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
        const interfaceName = name.replace(/Options$/, 'Option');
        return `export const ${name}: ${interfaceName}[] = ${json};\nexport interface ${interfaceName} { label: string; value: ${vTypes.length === 1 ? vTypes[0] : 'any'}; }\n`;
      })
      .join('\n');
  }

  static imports(opIds, opFilters, enumRegistry, config) {
    const sdk = new Set();
    const comps = new Set();
    const extras = new Set();

    opIds.forEach((id) => {
      const opId = config.overrides[id]?.operationId || `${id}_list`;
      const sdkDataType = `${utils.toPascalCase(opId)}Data`;
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

    const hasRequired = Array.from(opIds).some((id) =>
      opFilters[id].some((f) => f.required),
    );

    const lines = [
      `import { RootState } from '@waldur/store/reducers';`,
      `import { translate } from '@waldur/i18n';`,
      `import { FunctionComponent } from 'react';`,
      `import { Field, getFormValues, reduxForm } from 'redux-form';`,
      `import { createSelector } from 'reselect';`,
      `import { TableFilterItem } from '@waldur/table/TableFilterItem';`,
    ];

    if (hasRequired) {
      lines.push(`import { required } from '@waldur/core/validators';`);
    }

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
    if (hasComp('RangeNumberField'))
      lines.push(
        `import { RangeNumberField } from '@waldur/form/RangeNumberField';`,
      );
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
  const proc = new SchemaProcessor(schema, config);
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
      const out = `./src/table/generated/${utils.toPascalCase(id).replace(/(?:List|Retrieve)$/, '')}Filter.tsx`;
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
      proc,
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
