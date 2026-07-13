import { uniq } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';
import { useToggle } from 'react-use';
import {
  marketplaceProviderOfferingsList,
  ServiceProvider,
  usersList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { Tip } from '@/core/Tooltip';
import { truncate } from '@/core/utils';
import { deleteDuplicateRecords } from '@/customer/import/utils';
import { FieldErrorMessage } from '@/form/FieldError';
import { translate } from '@/i18n';
import { SkipErrorsCheck } from '@/project/import/SkipErrorsCheck';
import { useNotify } from '@/store/notify';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table, { TableColumns } from '@/table/Table';
import { useTable } from '@/table/useTable';
import { WizardForm, WizardFormStepProps } from '@/wizard';

import { OfferingUserRecord, RecordStatus } from './types';
import { parseOfferingUsersFile, validateOfferingUserCreation } from './utils';

const getStatusMessages = () => ({
  invalid: translate('Invalid user'),
  username: translate('Missing username'),
  offering: translate('Invalid offering'),
  provider: translate('Not provider-owned'),

  ready: translate('Ready'),
  created: translate('Created'),
  erred: translate('Erred'),
});
const statusColors = {
  ready: 'default',
  created: 'success',
  erred: 'danger',
};

const StatusField = ({
  row,
  status,
}: {
  row: OfferingUserRecord;
  status?: RecordStatus;
}) => {
  const validate = validateOfferingUserCreation(row);
  const statusMessages = getStatusMessages();
  return status ? (
    <Tip
      id={`tip-error-${row.uuid}`}
      label={
        status.status === 'erred' && <FieldErrorMessage error={status.error} />
      }
    >
      <Badge variant={statusColors[status.status]} pill outline>
        {statusMessages[status.status]}
      </Badge>
    </Tip>
  ) : (
    <Tip id={`tip-error-${row.uuid}`} label={validate.reason[0]}>
      <Badge variant={validate.valid ? 'default' : 'danger'} pill outline>
        {validate.valid
          ? translate('Ready')
          : statusMessages[validate.errors[0]]}
      </Badge>
    </Tip>
  );
};

const WithTooltip = ({ label = '', len = 24 }) =>
  label?.length > len ? (
    <Tip label={label} id="tip-truncated">
      {truncate(label, len)}
    </Tip>
  ) : (
    label || DASH_ESCAPE_CODE
  );

export const Step2PreviewAndImport: FC<WizardFormStepProps> = (props) => {
  const form = useForm();
  const { values } = useFormState({
    subscription: { values: true },
  });

  const { showError } = useNotify();

  const [data, setData] = useState<OfferingUserRecord[]>([]);
  const [loading, setLoading] = useToggle(false);
  const [skipErrors, setSkipErrors] = useToggle(false);

  const provider: ServiceProvider = props.data?.provider;
  const recordsStatus: RecordStatus[] = props.data?.status;

  const getRecordStatus = useCallback(
    (row: OfferingUserRecord) => {
      return recordsStatus?.find(
        (rec) =>
          rec.data.offering_uuid === row.offering_uuid &&
          rec.data.user_uuid === row.user_uuid,
      );
    },
    [recordsStatus],
  );

  const refToolbar = useRef<HTMLDivElement>(null);

  const tableProps = useTable({
    table: 'ImportOfferingUsersPreview',
    fetchData: (request) => {
      let rows = [...data];
      const q = (request.filter?.query || '').trim().toLowerCase();
      if (q) {
        rows = rows.filter((row) =>
          row.user_username.toLowerCase().includes(q),
        );
      }
      return Promise.resolve({
        rows,
        resultCount: rows.length,
      });
    },
    queryField: 'query',
  });

  useEffect(() => {
    tableProps.fetch();
  }, [data]);

  const columns = useMemo<TableColumns<OfferingUserRecord>>(
    () => [
      {
        title: translate('Waldur username'),
        render: ({ row }) => <WithTooltip label={row.user_username} />,
      },
      {
        title: translate('Offering'),
        render: ({ row }) => <WithTooltip label={row.offering_name} />,
      },
      {
        title: translate('Offering username'),
        render: ({ row }) => <WithTooltip label={row.username} />,
      },
      {
        title: translate('Status'),
        render: ({ row }) => (
          <StatusField row={row} status={getRecordStatus(row)} />
        ),
      },
    ],
    [data, getRecordStatus],
  );

  const parseCsvFile = useCallback(
    (acceptedFiles: File[]) => {
      const _file = acceptedFiles[0];

      if (!_file) {
        showError(translate('No file has been imported'));
        return;
      }
      setLoading(true);
      parseOfferingUsersFile(_file)
        .then(async (_data) => {
          // Prepare the requests payload here and save it in the formData
          const offeringUuids = uniq(_data.map((user) => user.offering_uuid));
          const usernames = uniq(_data.map((user) => user.username));

          // Fetch required data (users and offerings)
          const offerings = await marketplaceProviderOfferingsList({
            query: {
              field: provider
                ? ['uuid', 'name', 'customer_uuid']
                : ['uuid', 'name'],
              uuid_list: offeringUuids.join(','),
            },
          }).then((res) => res.data);
          const users = await usersList({
            query: {
              field: ['uuid', 'username'],
              username_list: usernames.join(','),
            },
          }).then((res) => res.data);

          const rows: OfferingUserRecord[] = _data.map((row) => {
            const offering = offerings.find(
              (ofr) => row.offering_uuid === ofr.uuid,
            );
            const user = users.find((user) => row.username === user.username);
            let providerOwned = true;
            if (
              provider &&
              offering &&
              offering.customer_uuid !== provider.customer_uuid
            ) {
              providerOwned = false;
            }
            return {
              uuid: row.uuid,
              offering_uuid: offering?.uuid, // not exist, means invalid
              offering_name: offering?.name || row.offering_uuid,
              user_uuid: user?.uuid, // not exist, means invalid
              user_username: row.username,
              username: row.offering_username,
              ...(!providerOwned ? { customer_uuid: 'invalid' } : {}), // not belong to the provider
            };
          });

          // Delete duplicate records
          const { duplicates, rows: uniqueRows } = deleteDuplicateRecords(
            rows,
            ['offering_uuid', 'user_uuid'],
          );

          if (duplicates) {
            showError(
              translate('{count} duplicate records were removed.', {
                count: duplicates,
              }),
            );
          }

          setData(uniqueRows);
          form.change('payload', uniqueRows);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [setData, setLoading, form, provider, showError],
  );

  const validation = useMemo(() => {
    if (!data?.length) {
      return {
        message: translate('At least one user is required.'),
        valid: 0,
        invalid: 0,
      };
    }
    let valid = 0;
    let invalid = 0;
    let msg = '';
    data.forEach((user) => {
      const validate = validateOfferingUserCreation(user);
      if (validate.valid) {
        valid++;
      } else {
        invalid++;
      }
      if (!msg && !validate.valid) {
        if (validate.errors.includes('invalid')) {
          msg = translate('Contains invalid users.');
        } else if (validate.errors.includes('username')) {
          msg = translate('Username is required.');
        } else if (validate.errors.includes('offering')) {
          msg = translate('Contains invalid offerings.');
        } else if (validate.errors.includes('provider')) {
          msg = translate(
            'Some offerings do not belong to the service provider.',
          );
        }
      }
    });
    const FixMessage = translate('Please fix data or skip records with errors');
    return {
      message: msg ? msg + ' ' + FixMessage : null,
      valid,
      invalid,
    };
  }, [data]);

  const file = values?.file;

  useEffect(() => {
    if (file?.length > 0) {
      parseCsvFile(file);
    }
  }, []);
  return (
    <WizardForm
      {...props}
      submitDisabled={!!validation.message && !skipErrors}
      submitTooltip={!skipErrors && validation.message}
    >
      <div>
        <div className="d-flex justify-content-start mb-3">
          <div ref={refToolbar}>{/* Portal destination */}</div>
        </div>
        <div className="d-flex justify-content-between text-muted mb-3">
          <span>
            {validation.invalid === 0
              ? translate('{n} valid', { n: validation.valid })
              : translate('{n} valid, {m} errors found', {
                  n: validation.valid,
                  m: validation.invalid,
                })}
          </span>
          <span>{translate('Verify your data before importing')}</span>
        </div>
        <Table
          {...tableProps}
          columns={columns}
          verboseName={translate('Users')}
          hasActionBar={false}
          fullWidth
          cardBordered={false}
          minHeight="auto"
          portal={{ toolbar: refToolbar?.current }}
          hasQuery
          loading={loading}
          footer={
            Boolean(validation.message && data?.length) && (
              <SkipErrorsCheck checked={skipErrors} onChange={setSkipErrors} />
            )
          }
        />
      </div>
    </WizardForm>
  );
};
