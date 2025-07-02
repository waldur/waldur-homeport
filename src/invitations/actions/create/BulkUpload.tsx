import {
  CheckCircleIcon,
  DownloadSimpleIcon,
  FileIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import Papa from 'papaparse';
import { FC, useCallback, useState } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { FileUploadField } from '@waldur/form';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { showError } from '@waldur/store/notify';
import saveAsCsv from '@waldur/table/exporters/csv';

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
  const dispatch = useDispatch();
  const [file, setFile] = useState<File>(null);
  const [importedUsersCount, setImportedUsersCount] = useState(0);

  const parseCsvFile = useCallback(
    (acceptedFiles: File[]) => {
      const _file = acceptedFiles[0];

      if (!_file || _file.type !== 'text/csv') {
        dispatch(showError('Invalid format, please import a .csv file'));
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
              dispatch(showError('Unable to locate email information'));
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
    [dispatch, props.onImport, setFile, setImportedUsersCount],
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
    <div className="border rounded px-2 mb-7">
      <Row className="h-60px align-items-center gx-5 fs-6">
        <Col xs="auto" className="ps-6">
          <FileIcon weight="bold" size={22} className="text-muted" />
        </Col>
        <Col>
          <Stack
            direction="horizontal"
            gap={2}
            className="align-items-center fw-bold"
          >
            <span className="fw-bold">{file.name}</span>
            <CheckCircleIcon size={16} weight="fill" className="text-success" />
          </Stack>
          <p className="text-muted mb-0">
            {translate('{count} users', { count: importedUsersCount })}
            {' - '}
            {translate('{percentage}% uploaded', { percentage: 100 })}
          </p>
        </Col>
        <Col xs="auto">
          <Button
            variant="active-light-danger"
            className="btn-icon btn-icon-danger"
            onClick={removeFile}
          >
            <span className="svg-icon svg-icon-1">
              <TrashIcon weight="bold" />
            </span>
          </Button>
        </Col>
      </Row>
    </div>
  ) : (
    <Row className="border-top border-bottom h-60px align-items-center mb-7 fs-6">
      <Col>
        <p className="fs-6 fw-bold text-gray-700 mb-0">
          {translate('Bulk import contacts')}
        </p>
        <p className="text-muted mb-0">
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
      </Col>
      <Col xs="auto">
        <FileUploadField
          input={{ onChange: (file) => parseCsvFile([file]) } as any}
          accept=".csv"
          buttonLabel={translate('Import')}
          iconNode={<DownloadSimpleIcon weight="bold" />}
          className="btn btn-secondary"
        />
      </Col>
    </Row>
  );
};
