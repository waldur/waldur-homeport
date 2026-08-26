import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  marketplaceProviderResourcesRetrieve,
  marketplaceProviderResourcesSetBackendMetadata,
  marketplaceProviderResourcesSetEndpoints,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { FieldError, StringField } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { CompactActionButton } from '@/table/CompactActionButton';

interface Column {
  field: string;
  label: string;
  required?: boolean;
}

interface FormData {
  endpoints: { name: string; url: string }[];
  metadata: { key: string; value: string }[];
}

// set_endpoints replaces the whole list — strip rows to the {name, url} the API
// wants (dropping any uuid the resource reported).
export const toEndpointsBody = (endpoints: FormData['endpoints'] = []) =>
  endpoints.map((endpoint) => ({ name: endpoint.name, url: endpoint.url }));

// set_backend_metadata replaces the whole object — rebuild it from the rows.
export const toMetadataBody = (rows: FormData['metadata'] = []) =>
  Object.fromEntries(rows.map((row) => [row.key, row.value ?? '']));

// Seed the form from the resource: endpoints as-is, metadata as key/value rows
// (nested values shown as JSON text — flat string metadata round-trips exactly).
export const resourceToMetadataForm = (resource: any): FormData => ({
  endpoints: (resource.endpoints || []).map((endpoint: any) => ({
    name: endpoint.name,
    url: endpoint.url,
  })),
  metadata: Object.entries(resource.backend_metadata || {}).map(
    ([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }),
  ),
});

// A generic add/remove/edit table over a FieldArray — reused for both the
// endpoints (name + url) and the backend metadata (key + value) sections.
const FieldRows: FC<{
  name: string;
  title: string;
  addTitle: string;
  columns: Column[];
}> = ({ name, title, addTitle, columns }) => (
  <FieldArray name={name}>
    {({ fields }) => (
      <div className="mb-6">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold">{title}</span>
          <CompactActionButton
            title={addTitle}
            action={() => fields.push({})}
            iconNode={<PlusIcon weight="bold" />}
            variant="text-secondary"
          />
        </div>
        {fields.length ? (
          <Table bordered responsive className="mb-0">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.field}>{column.label}</th>
                ))}
                <th className="w-1" />
              </tr>
            </thead>
            <tbody>
              {fields.map((row, index) => (
                <tr key={row}>
                  {columns.map((column) => (
                    <td key={column.field}>
                      <Field
                        name={`${row}.${column.field}`}
                        validate={column.required ? required : undefined}
                      >
                        {({ input, meta }) => (
                          <>
                            <StringField
                              input={input}
                              meta={meta}
                              aria-label={column.label}
                            />
                            <FieldError error={meta.touched && meta.error} />
                          </>
                        )}
                      </Field>
                    </td>
                  ))}
                  <td className="row-actions">
                    <CompactActionButton
                      title={translate('Remove')}
                      action={() => fields.remove(index)}
                      iconNode={<TrashIcon weight="bold" />}
                      variant="text-secondary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted mb-0">{translate('None yet.')}</p>
        )}
      </div>
    )}
  </FieldArray>
);

const MetadataEditor: FC = () => (
  <>
    <FieldRows
      name="endpoints"
      title={translate('Endpoints')}
      addTitle={translate('Add endpoint')}
      columns={[
        { field: 'name', label: translate('Name'), required: true },
        { field: 'url', label: translate('URL'), required: true },
      ]}
    />
    <FieldRows
      name="metadata"
      title={translate('Backend metadata')}
      addTitle={translate('Add field')}
      columns={[
        { field: 'key', label: translate('Key'), required: true },
        { field: 'value', label: translate('Value') },
      ]}
    />
  </>
);

export const EditResourceMetadataForm: FC<{
  resource: any;
  refetch?: () => void;
}> = ({ resource, refetch }) => {
  const mutation = useManagedMutation<any, any, FormData>({
    // set_endpoints and set_backend_metadata each replace the whole value.
    // Sequential: metadata write only runs if the endpoints write succeeded.
    mutationFn: async (formData) => {
      await marketplaceProviderResourcesSetEndpoints({
        path: { uuid: resource.uuid },
        body: { endpoints: toEndpointsBody(formData.endpoints) },
      });
      await marketplaceProviderResourcesSetBackendMetadata({
        path: { uuid: resource.uuid },
        body: { backend_metadata: toMetadataBody(formData.metadata) },
      });
    },
    successMessage: translate('Resource metadata has been updated.'),
    errorMessage: translate('Unable to update resource metadata.'),
    refetch,
  });

  // Seed the form once. react-final-form reinitializes (discarding in-progress
  // edits) whenever initialValues changes by reference, so a background refetch
  // must not hand it a freshly built object — otherwise the row you're typing
  // in flashes back to its original value.
  const initialValues = useMemo(
    () => resourceToMetadataForm(resource),
    [resource.uuid],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Edit metadata')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resource.name}
        />
      }
      formFields={[{ name: 'metadata-editor', component: MetadataEditor }]}
      initialValues={initialValues}
      submitForm={mutation.mutateAsync}
    />
  );
};

export const EditResourceMetadataDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  // The resource handed in by the action can carry stale/partial endpoints, so
  // refetch the authoritative copy. Editing off a stale object would let Submit
  // overwrite the real endpoints with a stale (often empty) list.
  const { data, isFetching, isError } = useQuery({
    queryKey: ['EditResourceMetadata', resource.uuid],
    queryFn: () =>
      marketplaceProviderResourcesRetrieve({
        path: { uuid: resource.uuid },
      }).then((response) => response.data),
    // Reopening after a save must show the saved values, and editing must not be
    // interrupted mid-way. So: refetch on every open, never revalidate on window
    // focus, and drop the copy on close. The form is gated on !isFetching below
    // so a reopen shows a spinner (not the pre-edit cache) until the fresh copy
    // lands — the uuid-keyed initialValues memo then seeds off fresh data.
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  if (data && !isFetching && !isError) {
    return <EditResourceMetadataForm resource={data} refetch={refetch} />;
  }
  return (
    <ModalDialog
      title={translate('Edit metadata')}
      subtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resource.name}
        />
      }
    >
      {isError ? (
        <h3>{translate('Unable to load resource metadata.')}</h3>
      ) : (
        <LoadingSpinner />
      )}
    </ModalDialog>
  );
};
