import Papa from 'papaparse';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { formatDate } from '@/core/dateUtils';
import { formatFilesize } from '@/core/utils';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';
import saveAsCsv from '@/table/exporters/csv';

import { DownloadTemplateItem } from './DownloadTemplateItem';
import { generateTemplateData } from './utils';

const getTemplateName = (type, organizationName = '') =>
  [
    type === 'projects_only' ? 'project_import' : 'project_and_resource_import',
    formatDate(null),
    ...organizationName.split(' '),
  ]
    .filter(Boolean)
    .join('_');

export const Step3DownloadTemplate: FC<WizardFormStepProps> = (props) => {
  const [template, setTemplate] = useState(null);

  const onDownloadClick = useCallback(
    (type) =>
      saveAsCsv(getTemplateName(type, props.data?.customer?.name), template),
    [template, props.data],
  );

  const fileSize = useMemo(() => {
    if (!template) return null;
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });

    return formatFilesize(blob.size, 'B');
  }, [template]);

  return (
    <WizardForm
      {...props}
      onPrev={(values) =>
        props.onStep(values.import_type === 'projects_only' ? 0 : 1)
      }
    >
      {(wizardProps) => {
        const importType = wizardProps.formValues?.import_type;
        const offering = wizardProps.formValues?.offering;

        useEffect(() => {
          const data = generateTemplateData(
            props.data?.customer?.uuid,
            importType === 'projects_with_resources' ? offering : null,
          );
          setTemplate(data);
        }, [importType, offering]);

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
              name={getTemplateName(importType, props.data?.customer?.name)}
              size={fileSize}
              onClick={() => onDownloadClick(importType)}
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
      }}
    </WizardForm>
  );
};
