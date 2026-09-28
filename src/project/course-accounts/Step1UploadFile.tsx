import { FileCsvIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { TemplateUploaderField } from '@/project/import/TemplateUploaderField';
import saveAsCsv from '@/table/exporters/csv';

import templateFile from './course_accounts_template.json';

const onDownloadClick = () =>
  saveAsCsv('Course accounts template', templateFile);

export const Step1UploadFile: FC = () => {
  return (
    <Field
      name="file"
      component={TemplateUploaderField}
      description={
        <div className="mb-6">
          <p className="text-muted mb-2">
            {translate('CSV should include headers: {headers}', {
              headers: 'email, description',
            })}
          </p>
          <BaseButton
            label={translate('Download CSV template')}
            onClick={onDownloadClick}
            iconNode={<FileCsvIcon size={20} weight="bold" />}
            variant="text-primary"
            size="sm"
          />
        </div>
      }
    />
  );
};
