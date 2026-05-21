import { uniqueId } from 'lodash-es';
import Papa from 'papaparse';

import { translate } from '@/i18n';

import templateFile from './offering_users_template.json';
import { OfferingUserRecord } from './types';

interface IField {
  field: string;
  idx: number;
}

interface RawUser {
  uuid;
  username?;
  offering_uuid?;
  offering_username?;
}

export const parseOfferingUsersFile = (file: File) => {
  return new Promise<RawUser[]>((resolve, reject) =>
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: function (results: { data: Array<Array<string>> }) {
        if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
          const header = results.data[0];

          const fields = templateFile.fields;
          const userFields = header.reduce<IField[]>((acc, field, idx) => {
            if (fields.includes(field)) {
              acc.push({ field, idx });
            }
            return acc;
          }, []);
          const rows = results.data.slice(1);

          const users = rows.map((row) => {
            const userData: RawUser = {
              uuid: uniqueId(),
            };
            userFields.forEach(({ field, idx }) => {
              userData[field] = row[idx];
            });
            return userData;
          });

          resolve(users);
        }
        resolve([]);
      },
      error: function (error) {
        reject(error);
      },
    }),
  );
};

export const validateOfferingUserCreation = (record: OfferingUserRecord) => {
  return {
    valid: record.user_uuid && record.username && record.offering_uuid,
    errors: [
      record.customer_uuid === 'invalid' ? 'provider' : null,
      record.user_uuid ? null : 'invalid',
      record.username ? null : 'username',
      record.offering_uuid ? null : 'offering',
    ].filter(Boolean),
    reason: [
      record.user_uuid
        ? null
        : translate('There is no user with this username.'),
      record.offering_uuid
        ? null
        : translate('There is no offering with this UUID.'),
    ].filter(Boolean),
  };
};
