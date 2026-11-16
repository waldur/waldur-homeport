import { FC, useMemo } from 'react';

import { WizardForm, WizardFormStepProps } from 'waldur-wizard';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { DownloadTemplateItem } from '@/project/import/DownloadTemplateItem';
import saveAsCsv, { toCsv } from '@/table/exporters/csv';

import templateFile from './organizations_template.json';

const getTemplateName = () => 'Organization file template';

const onDownloadClick = () => saveAsCsv(getTemplateName(), templateFile);

export const Step1DownloadTemplate: FC<WizardFormStepProps> = (props) => {
  const fileSize = useMemo(() => {
    const csv = toCsv(templateFile);
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });

    return formatFilesize(blob.size, 'B');
  }, []);

  return (
    <WizardForm {...props}>
      <div className="text-quaternary">
        <p className="mb-5">
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
