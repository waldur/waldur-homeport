import Papa from 'papaparse';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-final-form';
import { Customer } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import saveAsCsv from '@/table/exporters/csv';

import { DownloadTemplateItem } from './DownloadTemplateItem';
import { ProjectImportFormData } from './types';
import { generateTemplateData } from './utils';

const getTemplateName = (type, organizationName = '') =>
  [
    type === 'projects_only' ? 'project_import' : 'project_and_resource_import',
    formatDate(null),
    ...organizationName.split(' '),
  ]
    .filter(Boolean)
    .join('_');

interface Step3Props {
  context: {
    customer?: Customer;
  };
}

export const Step3DownloadTemplate: FC<Step3Props> = ({
  context: { customer },
}) => {
  const { values } = useFormState<ProjectImportFormData>();
  const importType = values?.import_type;
  const offering = values?.offering;

  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    const data = generateTemplateData(
      customer?.uuid,
      importType === 'projects_with_resources'
        ? offering || undefined
        : undefined,
    );
    setTemplate(data);
  }, [customer, importType, offering]);

  const onDownloadClick = useCallback(() => {
    if (template) {
      saveAsCsv(getTemplateName(importType, customer?.name), template);
    }
  }, [template, importType, customer]);

  const fileSize = useMemo(() => {
    if (!template) return null;
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
    return formatFilesize(blob.size, 'B');
  }, [template]);

  return (
    <div className="text-muted">
      <p className="mb-6">
        {importType === 'projects_only'
          ? translate(
              'Fill the template with your project details, then upload it in the next step.',
            )
          : translate(
              'Fill the template with your project and resource details, then upload it in the next step.',
            )}
      </p>
      <DownloadTemplateItem
        name={getTemplateName(importType, customer?.name)}
        size={fileSize}
        onClick={onDownloadClick}
      />
      <p>
        {importType === 'projects_only'
          ? translate(
              'This template includes all required fields for HPC project import: {fields} (required) etc.',
              { fields: 'project_name, start_date, end_date' },
            )
          : offering
            ? translate(
                'This template includes all required fields for HPC project import: {fields} (required), {components} (offering specific).',
                {
                  fields: 'project_name, start_date, end_date',
                  components: (offering.components || [])
                    .map((component) => component.type)
                    .join(', '),
                },
              )
            : null}
      </p>
    </div>
  );
};
