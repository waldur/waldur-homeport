import { FileCsvIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { translate } from '@waldur/i18n';
import { TemplateUploaderField } from '@waldur/project/import/TemplateUploaderField';
import saveAsCsv from '@waldur/table/exporters/csv';

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
          <Button
            variant="link"
            size="sm"
            className="btn-icon-primary"
            onClick={onDownloadClick}
          >
            <span className="svg-icon svg-icon-2">
              <FileCsvIcon size={20} weight="bold" className="text-muted" />
            </span>
            {translate('Download CSV template')}
          </Button>
        </div>
      }
    />
  );
};
