import {
  CheckCircleIcon,
  DownloadSimpleIcon,
  FileIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import Papa from 'papaparse';
import { FC, useCallback, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { FileUploadField } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import saveAsCsv from '@/table/exporters/csv';

import example_file from './example_file.json';

export type EmailRolePairs = Array<{
  email: string;
  role?: string;
  project?: string;
}>;

interface OwnProps {
  onImport(items: EmailRolePairs): void;
}

export const BulkUpload: FC<OwnProps> = (props) => {
  const { showError } = useNotify();
  const [file, setFile] = useState<File>(null);
  const [importedUsersCount, setImportedUsersCount] = useState(0);

  const parseCsvFile = useCallback(
    (acceptedFiles: File[]) => {
      const _file = acceptedFiles[0];

      if (!_file || _file.type !== 'text/csv') {
        showError(translate('Invalid format, please import a .csv file'));
        return;
      }
      setFile(_file);
      Papa.parse(_file, {
        complete: function (results: { data: Array<Array<string>> }) {
          if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
            const emailIndex = results.data[0].findIndex((str) =>
              str.toLowerCase().includes('mail'),
            );
            if (emailIndex === -1) {
              // Can't find the emails in the data
              showError(translate('Unable to locate email information'));
              return;
            }
            const roleIndex = results.data[0].findIndex((str) =>
              str.toLowerCase().includes('role'),
            );
            const projectIndex = results.data[0].findIndex((str) =>
              str.toLowerCase().includes('project'),
            );
            const items: EmailRolePairs = [];
            // slice 1 to ignore csv header row
            results.data.slice(1).forEach((row) => {
              const email = row[emailIndex];
              const role = row[roleIndex];
              const project = row[projectIndex];
              if (email) {
                items.push({ email, role, project });
              }
            });
            setImportedUsersCount(items.length);
            props.onImport(items);
          }
        },
      });
    },
    // onImport resolves the CSV roles against the roles the dialog holds now.
    // Those load asynchronously, so a callback kept from the first render
    // would match every row against an empty list.
    [props.onImport, showError],
  );

  const onDownloadClick = useCallback(() => {
    saveAsCsv('example_file', example_file);
  }, []);

  const removeFile = () => {
    setFile(null);
    setImportedUsersCount(0);
    props.onImport([{ email: '', project: '', role: '' }]);
  };

  return file ? (
    <div className="border rounded px-1.5 mb-5.5">
      <div className="flex flex-wrap h-[60px] items-center gap-x-4 text-sm">
        <div className="flex-none ps-5">
          <FileIcon weight="bold" size={22} className="text-quaternary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center self-stretch gap-1.5 font-medium">
            <span className="font-medium">{file.name}</span>
            <CheckCircleIcon size={16} weight="fill" className="text-success" />
          </div>
          <p className="text-quaternary mb-0">
            {translate('{count} users', { count: importedUsersCount })}
            {' - '}
            {translate('{percentage}% uploaded', { percentage: 100 })}
          </p>
        </div>
        <div className="flex-none">
          <BaseButton
            tooltip={translate('Remove')}
            variant="text-danger"
            onClick={removeFile}
            iconNode={<TrashIcon weight="bold" />}
            size="lg"
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-wrap gap-x-5 border-t-[1px] border-t-secondary border-b-[1px] border-b-secondary h-[60px] items-center mb-5.5 text-sm">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-secondary mb-0">
          {translate('Bulk import contacts')}
        </p>
        <p className="text-quaternary mb-0">
          {translate(
            'Import your mailing list from a .csv file. You can download an {example}',
            {
              example: (
                <button
                  className="text-anchor"
                  type="button"
                  onClick={onDownloadClick}
                >
                  example_file.csv
                </button>
              ),
            },
            formatJsxTemplate,
          )}
        </p>
      </div>
      <div className="flex-none">
        <FileUploadField
          input={{ onChange: (file) => parseCsvFile([file]) } as any}
          accept=".csv"
          buttonLabel={translate('Import')}
          iconNode={<DownloadSimpleIcon weight="bold" />}
          variant="secondary"
          size="md"
        />
      </div>
    </div>
  );
};
