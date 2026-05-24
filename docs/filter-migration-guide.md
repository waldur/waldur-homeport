# Migration to Generated Table Filters

This guide documents the transition from manually maintained table filters to automatically generated filters based on the OpenAPI schema.

## Motivation & Vision

### The Problem

Manually writing filter components for every API endpoint leads to:

- **Boilerplate**: Repetitive definitions of select fields, async paginators, and state management.
- **Inconsistency**: Discrepancies between the frontend filters and the actual API parameters (e.g., incorrect query param names, missing options).
- **Maintenance Burden**: When API changes (new filters, renamed parameters), developers must manually update the frontend code.

### The Solution

We generate filter components directly from the **OpenAPI schema** (`schema.json`). This ensures:

1. **Single Source of Truth**: The frontend filters always match the API definition.
2. **Type Safety**: Generated code uses TypeScript interfaces inferred from the schema.
3. **Automatic Updates**: Regenerating filters updates them to reflect API changes instantly.
4. **Standardization**: All filters use consistent UI components (`<Select>`, `<AsyncPaginate>`, etc.) and behavior.

---

## Architecture

The generation process is driven by:

1. **`generate-filters.cjs`**: The Node.js script that parses the schema and outputs React components.
2. **`generate-filters-config.yaml`**: A configuration file for customization (overrides, ordering, labels).
3. **`waldur-js-client`**: Provides the TypeScript types and API client functions used by the generated code.

### Generated Output

The script produces `src/table/generated/{OperationId}Filter.tsx` files. Each file exports:

- `Pure{Name}Filter`: The presentation component.
- `{Name}Filter`: The filter component using `react-final-form`.
- `{Name}FilterFormData`: TypeScript interface for form values.
- `{Name}FilterProps`: TypeScript interface for component props.
- `select{Name}Filter`: A selector to transform form values into API query parameters.

---

## Migration Process

To migrate a manual filter to a generated one, follow these steps:

### 1. Identify the OpenAPI Operation

Find the `operationId` for the list endpoint you are filtering.
Example: For `GET /api/customers/`, the operation ID might be `customers_list`.

### 2. Configure `generate-filters-config.yaml`

Add an entry for the operation if it doesn't exist. You can specify which filters to include (whitelist) or leave it empty to include all non-excluded filters.

```yaml
overrides:
  customers_list:
    # Optional: Customize component name (default: CustomersFilter)
    componentName: CustomersFilter
    # Optional: Whitelist specific filters to include
    filters:
      - name
      - accounting_is_running
      - organization_group
```

### 3. Run the Generator

Execute the generation script:

```bash
node generate-filters.cjs
```

This will create/update `src/table/generated/CustomersFilter.tsx`.

### 4. Replace the Manual Component

In your table definition (e.g., `CustomersList.tsx`), replace the manual filter component with the generated one.

**Before:**

```typescript
import { CustomersFilter } from './CustomersFilter'; // Manual file
```

**After:**

```typescript
import { CustomersFilter } from './generated/CustomersFilter'; // Generated file
```

### 5. Verify & Clean Up

- Check if the new filter behaves correctly in the UI.
- Verify that types are correct.
- Delete the old manual filter file.

---

## Configuration & Customization (`generate-filters-config.yaml`)

You can customize almost every aspect of the generated filters.

### Key Configuration Options

| Option | Description | Example |
| :--- | :--- | :--- |
| `label` | Custom label for the filter. | `label: "Organization"` |
| `component` | React component to use. | `component: "Autocomplete"` |
| `loadOptions` | API method for async loading. | `loadOptions: "customersList"` |
| `valueField` | Field to use as value. | `valueField: "uuid"` |
| `labelField` | Field to show in UI. | `labelField: "name"` |
| `mapTo` | Map a renamed filter back to a specific API param. | `mapTo: "organization_group_uuid"` |
| `options` | Hardcoded options for Select. | `options: [{ label: "Yes", value: true }]` |

### Example Configuration

```yaml
overrides:
  customers_list:
    filters:
      - organization_group

  # Override specific parameters across ALL operations
  parameters:
    organization_group:
      label: "Organization group"
      component: "Autocomplete"
      loadOptions: "organizationGroupsList"
      valueField: "uuid"
      labelField: "name"
      # The API expects 'organization_group_uuid', but we call the filter 'organization_group'
      mapTo: "organization_group_uuid"
```

---

## Tips & Quirks

### 1. Renaming and `_uuid` Suffix

The generator automatically drops `_uuid` suffixes from filter names for cleaner code (e.g., `customer_uuid` becomes `customer`).

- **Quirk**: If you list filters in the `filters` whitelist in YAML, **you must use the renamed name** (e.g., `customer`, not `customer_uuid`), OR the original name if `mapTo` is correctly inferred.
- **Tip**: The generator logic handles the mapping back to the original parameter name in the `select{Name}Filter` selector.

### 2. Explicit Typing

Generated components are strictly typed.

- **Props**: `FunctionComponent<FilterProps>` defines what props the filter accepts.
- **Form Data**: `FilterFormData` defines the shape of the form values.
- **Callbacks**: `getOptionLabel`/`getOptionValue` have explicit type annotations (e.g., `(option: Customer) => option.name`).

### 3. Autocomplete vs. Select

- **Autocomplete**: Uses `AsyncPaginate`. Requires `loadOptions`, `valueField`, and `labelField` to be set or inferred.
- **Select**: Uses standard `Select`. Used for enums, booleans, or fixed options.

### 4. Handling Props (`props.*`)

If a filter's options come from parent props (not an API call), use the `props.` prefix in configuration.

```yaml
parameters:
  project_role:
    options: "props.projectRoles" # Will generate props.projectRoles in component
```

The generator will:

1. Infer the `FilterProps` interface containing `projectRoles`.
2. Pass `props` to the component.
3. Render `options={props.projectRoles}`.

## Troubleshooting

### "My filter is missing"

- Check if it's in the `GenerateFiltersCI` exclusion list in `generate-filters.cjs`.
- Check if it's referenced in the `yaml` whitelist correctly.

### "My filter is a StringField but should be Autocomplete"

- This usually means the schema inference didn't detect it as a relation.
- **Fix**: Add an override in `generate-filters-config.yaml` setting `component: Autocomplete` and `loadOptions`.

### "TypeScript errors in generated code"

- Run `node generate-filters.cjs` to ensure the code is fresh.
- Check if `waldur-js-client` exports the types you expect.
