import { difference, isNumber, uniq, uniqueId } from 'lodash-es';
import Papa from 'papaparse';
import { Offering } from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';

const TYPE_FIELD = 'type';
const ORG_FIELD = 'customer_uuid';
const PROJECT_FIELDS = [
  'name',
  isFeatureVisible(ProjectFeatures.show_description_in_create_dialog) &&
    'description',
  isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) && 'oecd_fos_2007_code',
  isFeatureVisible(ProjectFeatures.show_industry_flag) && 'is_industry',
  isFeatureVisible(ProjectFeatures.show_type_in_create_dialog) &&
    'project_type',
  isFeatureVisible(ProjectFeatures.show_start_date_in_create_dialog) &&
    'start_date (yyyy-mm-dd)',
  isFeatureVisible(ProjectFeatures.show_end_date_in_create_dialog) &&
    'end_date (yyyy-mm-dd)',
].filter(Boolean);
const RESOURCE_FIELDS = [
  'name',
  'description',
  'end_date (yyyy-mm-dd)',
  'project_name',
  'offering_name',
  'plan_name',
];

interface IField {
  field: string;
  idx: number;
}

const cleanHeaderFields = (fields: string[]) =>
  fields.map((field) => field.split('(')[0].trim());

const parseValue = (value) => {
  if (['true', 'TRUE'].includes(value)) return true;
  if (['false', 'FALSE'].includes(value)) return false;
  if (isNumber(value)) return Number(value);
  return value;
};

export const parseProjectsAndResourcesFile = (file: File) => {
  return new Promise<any>((resolve, reject) =>
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: function (results: { data: Array<Array<string>> }) {
        if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
          const header = cleanHeaderFields(results.data[0]);
          // Read data based on headers dynamically
          const projectHeaderFields = cleanHeaderFields(PROJECT_FIELDS);
          const projectFields = header.reduce<IField[]>((acc, field, idx) => {
            if (projectHeaderFields.includes(field)) {
              acc.push({ field, idx });
            }
            return acc;
          }, []);
          const diffFields = difference(
            projectHeaderFields,
            cleanHeaderFields(RESOURCE_FIELDS),
          );
          const resourceFields = header.reduce<IField[]>((acc, field, idx) => {
            if (!diffFields.includes(field) && field !== 'type') {
              acc.push({ field, idx });
            }
            return acc;
          }, []);

          const rows = results.data.slice(1);

          const typeIndex = header.indexOf('type');

          // If type is not exist, it means all rows are projects
          const projectRows =
            typeIndex === -1
              ? rows
              : rows.filter((row) => row[typeIndex] === 'project');

          const projects = projectRows.map((row) => {
            const projectName = row[header.indexOf('name')];
            // Extract project rows
            const projectData: Record<string, any> = {
              uuid: uniqueId(),
            };
            projectFields.forEach(({ field, idx }) => {
              projectData[field] = parseValue(row[idx]);
            });
            // add customer_uuid if it exists
            const customerIndex = header.indexOf('customer_uuid');
            if (customerIndex !== -1) {
              projectData.customer_uuid = row[customerIndex];
            }
            if (typeIndex >= 0) {
              // Find the resources of this project
              const resources = rows
                .filter(
                  (r) =>
                    r[typeIndex] === 'resource' &&
                    r[header.indexOf('project_name')] === projectName,
                )
                .map((resourceRow) => {
                  const resourceData: Record<string, any> = {
                    uuid: uniqueId(),
                  };
                  const limits: Record<string, any> = {};
                  const attributes: Record<string, any> = {};
                  resourceFields.forEach(({ field, idx }) => {
                    const value = parseValue(resourceRow[idx]);
                    // Set name, description and end_date
                    if (['name', 'description', 'end_date'].includes(field)) {
                      if (value) {
                        attributes[field] = value;
                        resourceData[field] = value;
                      }
                    } else if (String(field).endsWith('_limit')) {
                      // Components
                      limits[field.substring(0, field.lastIndexOf('_limit'))] =
                        value;
                    } else if (RESOURCE_FIELDS.includes(field)) {
                      // Resource fields
                      resourceData[field] = value;
                    } else {
                      // Attributes
                      attributes[field] = value;
                    }
                  });
                  return { ...resourceData, limits, attributes };
                });
              return {
                ...projectData,
                resources,
              };
            }
            return projectData;
          });

          resolve(projects);
        }
        resolve([]);
      },
      error: function (error) {
        reject(error);
      },
    }),
  );
};

/**
 * Generate template data for projects and resources
 */
export const generateTemplateData = (
  customerUuid?: string,
  offering?: Offering,
) => {
  if (!offering) {
    return {
      fields: [!customerUuid && ORG_FIELD, ...PROJECT_FIELDS].filter(Boolean),
      data: [],
    };
  }
  // Generate template file for projects with resources
  const fixedFields = uniq([
    TYPE_FIELD,
    !customerUuid && ORG_FIELD,
    ...PROJECT_FIELDS,
    ...RESOURCE_FIELDS,
  ]);
  return {
    fields: fixedFields
      .concat(
        offering.components.map((comp) => comp.type + '_limit'),
        Object.keys(offering.attributes).map((attr) => attr),
      )
      .filter(Boolean),
    data: [],
  };
};

export const cleanObjectEmptyFields = (obj) => {
  Object.keys(obj).forEach(
    (key) => ['', null, undefined].includes(obj[key]) && delete obj[key],
  );
  return obj;
};
