import Papa from 'papaparse';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DropzoneFiles } from '@waldur/core/DropzoneFiles';
import { translate } from '@waldur/i18n';
import { showError } from '@waldur/store/notify';
import { saveAsCsv } from '@waldur/table/export';

import example_file from './example_file.json';

type ImportEmail = Array<{ email: string }>;

interface OwnProps {
  onImport(items: ImportEmail): void;
}

export const BulkUpload: FC<OwnProps> = (props) => {
  const dispatch = useDispatch();

  const parseCsvFile = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles[0]) {
        dispatch(showError('Invalid format, please import .csv files'));
        return;
      }
      Papa.parse(acceptedFiles[0], {
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
            const items: ImportEmail = [];
            // slice 1 to ignore csv header row
            results.data.slice(1).forEach((row) => {
              if (
                row[emailIndex] &&
                !items.some((item) => item.email === row[emailIndex])
              ) {
                items.push({ email: row[emailIndex] });
              }
            });
            props.onImport(items);
          }
        },
      });
    },
    [dispatch, props.onImport],
  );

  const onDownloadClick = useCallback(() => {
    saveAsCsv('example_file', example_file);
  }, []);

  return (
    <>
      <h2 className="mb-6">{translate('Bulk upload')}</h2>
      <p className="mb-6">
        {translate(
          'Upload a CSV file containing the columns email, role, project and organization in that order. If you are unsure, you can download an example file as a template',
        )}
        :
      </p>
      <DropzoneFiles
        multiple={false}
        accept={{
          'text/csv': ['.csv'],
        }}
        onDrop={parseCsvFile}
        className="mb-4"
      />
      <a
        className="btn btn-link btn-color-muted btn-active-color-primary"
        onClick={onDownloadClick}
      >
        <u>{translate('Download')} example_file.csv</u>
      </a>
    </>
  );
};
