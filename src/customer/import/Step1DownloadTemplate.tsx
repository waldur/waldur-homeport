import Papa from 'papaparse';
import { FC, useMemo } from 'react';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { DownloadTemplateItem } from '@/project/import/DownloadTemplateItem';
import saveAsCsv from '@/table/exporters/csv';
import { WizardForm, WizardFormStepProps } from '@/wizard';

import templateFile from './organizations_template.json';

const getTemplateName = () => 'Organization file template';

const onDownloadClick = () => saveAsCsv(getTemplateName(), templateFile);

export const Step1DownloadTemplate: FC<WizardFormStepProps> = (props) => {
  const fileSize = useMemo(() => {
    const csv = Papa.unparse(templateFile);
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });

    return formatFilesize(blob.size, 'B');
  }, []);

  return (
    <WizardForm {...props}>
      <div className="text-muted">
        <p className="mb-6">
          {translate(
            'Fill the template with your organization details, then upload it in the next step.',
          )}
        </p>
        <DownloadTemplateItem
          name={getTemplateName()}
          size={fileSize}
          onClick={onDownloadClick}
        />
        <p>
          {translate(
            'This template includes all required fields for organization import: {fields} (required) etc.',
            { fields: 'name, email' },
          )}
        </p>
      </div>
    </WizardForm>
  );
};
