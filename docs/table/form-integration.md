# Table Component: Form Integration (Final-Form)

The table component can be integrated as an input control inside `react-final-form` to allow users to select one or multiple rows as part of a form submission.

---

## Form Integration Properties

To enable form integration, pass the following properties to the `<Table>` component:

- **`fieldType`**: Set to `'radio'` (for single selection) or `'checkbox'` (for multi-selection). This automatically renders selection buttons in a leading column on each row.
- **`fieldName`**: The path in form values where the selection should be stored (e.g. `'attributes.security_groups'`).
- **`validate`**: An optional field validator (e.g. `required`).
- **`rowValidate`**: A callback function `(row: RowType, formValues: any) => string | string[] | undefined` to validate individual rows based on overall form state. If it returns a string, that row is marked with an error.

---

## Basic Example

```tsx
import { Form } from 'react-final-form';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { createFetcher } from '@/table/api';
import { securityGroupsList } from 'waldur-js-client';

const required = (value) => (value ? undefined : translate('Selection is required'));

export const FormSecurityGroupsField = () => {
  const tableProps = useTable({
    table: 'SecurityGroupsSelect',
    fetchData: createFetcher(securityGroupsList),
  });

  return (
    <Table
      {...tableProps}
      title={translate('Select Security Groups')}
      fieldType="checkbox"
      fieldName="attributes.security_groups"
      validate={required}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.name),
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
      ]}
    />
  );
};
```

---

## Row Validation (`rowValidate`)

You can perform dynamic validation checks on specific rows based on other values in the form. If a row is invalid, the table will display a hover warning icon next to the selection checkbox/radio:

```tsx
const checkQuotaLimit = (row, formValues) => {
  if (row.cores > formValues.remaining_cores_quota) {
    return translate('This flavor exceeds your project quota limit.');
  }
  return undefined;
};

// Usage inside Table:
<Table
  {...tableProps}
  fieldType="radio"
  fieldName="flavor"
  rowValidate={checkQuotaLimit}
/>
```
