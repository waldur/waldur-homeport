import * as yaml from 'js-yaml';

import { translate } from '@/i18n';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  metadata?: any;
}

export const validateOfferingExportFile = async (
  file: File,
): Promise<ValidationResult> => {
  try {
    // Check file type
    const isYaml =
      file.type.includes('yaml') ||
      file.name.endsWith('.yaml') ||
      file.name.endsWith('.yml');
    const isJson = file.type.includes('json') || file.name.endsWith('.json');

    if (!isYaml && !isJson) {
      return {
        isValid: false,
        error: translate(
          'File must be a JSON or YAML file (.json, .yaml, .yml)',
        ),
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: translate('File size must be less than 10MB'),
      };
    }

    // Read and parse file content
    const fileContent = await readFileAsText(file);
    const trimmedContent = fileContent.trim();

    let metadata: any = {
      offering_name: 'Unknown Offering',
      exported_components: [],
      export_timestamp: new Date().toISOString(),
    };

    if (isJson) {
      // Handle JSON format (like export-basic.json)
      try {
        const parsedJson = JSON.parse(fileContent);

        if (parsedJson.data) {
          // New structured JSON format
          const { data } = parsedJson;
          metadata = {
            offering_name: data.offering_name || 'Unknown Offering',
            exported_components: data.exported_components || [],
            export_timestamp: data.export_timestamp || new Date().toISOString(),
          };

          // Validate the export_data contains YAML-like structure
          if (data.export_data && !data.export_data.startsWith('offering:')) {
            return {
              isValid: false,
              error: translate(
                'Invalid export data format - must start with "offering:"',
              ),
            };
          }
        } else {
          // Legacy format - assume it's direct offering data
          return {
            isValid: false,
            error: translate(
              'Unsupported JSON format - expected export format with "data" property',
            ),
          };
        }
      } catch {
        return {
          isValid: false,
          error: translate('Invalid JSON format'),
        };
      }
    } else if (isYaml) {
      // Handle YAML format with proper js-yaml parsing
      try {
        // Validate YAML syntax using js-yaml
        const parsed = yaml.load(trimmedContent);

        if (!parsed || typeof parsed !== 'object') {
          return {
            isValid: false,
            error: translate('Invalid YAML: Not a valid object structure'),
          };
        }

        if (!trimmedContent.includes('offering:')) {
          return {
            isValid: false,
            error: translate(
              'Invalid YAML format - must contain "offering:" section',
            ),
          };
        }

        // Extract basic metadata from YAML content
        metadata = extractMetadataFromYaml(fileContent);
      } catch (yamlError) {
        return {
          isValid: false,
          error: translate('Invalid YAML syntax: {error}', {
            error: yamlError.message,
          }),
        };
      }
    }

    return {
      isValid: true,
      metadata,
    };
  } catch (error) {
    return {
      isValid: false,
      error: translate('Error reading file: {error}', { error: error.message }),
    };
  }
};

const extractMetadataFromYaml = (yamlContent: string): any => {
  const metadata: any = {
    offering_name: 'Unknown Offering',
    exported_components: [],
    export_timestamp: new Date().toISOString(),
  };

  // Parse offering name
  const nameMatch = yamlContent.match(/name:\s*(.+)/);
  if (nameMatch) {
    metadata.offering_name = nameMatch[1].replace(/['"]/g, '').trim();
  }

  // Parse offering type
  const typeMatch = yamlContent.match(/type:\s*(.+)/);
  if (typeMatch) {
    metadata.offering_type = typeMatch[1].trim();
  }

  // Parse state
  const stateMatch = yamlContent.match(/state:\s*(.+)/);
  if (stateMatch) {
    metadata.offering_state = stateMatch[1].trim();
  }

  // Parse category
  const categoryMatch = yamlContent.match(/category_name:\s*(.+)/);
  if (categoryMatch) {
    metadata.category_name = categoryMatch[1].trim();
  }

  // Determine components from YAML structure
  const componentTypes = [];
  if (yamlContent.includes('components:')) componentTypes.push('components');
  if (yamlContent.includes('plans:')) componentTypes.push('plans');
  if (yamlContent.includes('screenshots:')) componentTypes.push('screenshots');
  if (yamlContent.includes('files:')) componentTypes.push('files');
  if (yamlContent.includes('endpoints:')) componentTypes.push('endpoints');
  if (yamlContent.includes('organization_groups:'))
    componentTypes.push('organization_groups');
  if (yamlContent.includes('terms_of_service:'))
    componentTypes.push('terms_of_service');

  metadata.exported_components = componentTypes;

  return metadata;
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
