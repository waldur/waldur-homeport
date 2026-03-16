# Configuration Management Guide

This guide describes how configuration settings are managed in Waldur Homeport, including the architecture, design patterns, and the integration with Waldur Mastermind.

## Architecture Overview

Waldur follows a "Single Source of Truth" pattern for configuration. Settings are defined in the Mastermind backend and exposed to Homeport through auto-generated files and API endpoints.

### Backend (Mastermind)

- **Constance**: Settings are managed using `django-constance`.
- **Definitions**: Located in `src/waldur_core/server/constance_settings.py`.
- **Public Exposure**: Settings listed in `PUBLIC_CONSTANCE_SETTINGS` are available via the `/api/override-settings/` endpoint.

### Frontend (Homeport)

- **Meta-data**: `src/SettingsDescription.ts` (auto-generated) contains descriptions, types, and defaults for settings.
- **Enums**: `src/FeaturesEnums.ts` (auto-generated) contains feature flag enums.
- **API Client**: Uses `overrideSettingsRetrieve` from `waldur-js-client`.

## Design Patterns

### Configuration Components

Waldur Homeport provides specialized components for building configuration interfaces:

- **SettingsCard**: Displays a group of settings defined in `SettingsDescription.ts`.
- **SettingsWithTabs**: Organized interface with searchable tabs for multiple setting groups.
- **FieldRow**: Individual setting row with automatic field type detection.

### Available Field Types

The `SettingsDescription.ts` (and thus `FieldRow`) supports several types:

- `string`: Standard text input.
- `integer`: Number input.
- `boolean`: Checkbox toggle.
- `choice_field`: Dropdown selection (requires `options`).
- `multiple_choice_field`: Multi-select checkboxes or badges.
- `url_field`: URL validated text input.
- `color_field`: Color picker.
- `image_field`: File upload for images.
- `json_list_field`: Specialized list editor for JSON data.
- `multilingual_image_field`: Map of language codes to images.

### Auto-generation Workflow

To keep Homeport in sync with Mastermind's settings definitions, use the following commands in the `waldur-mastermind` directory:

```bash
# Update settings descriptions
uv run waldur print_settings_description > ../waldur-homeport/src/SettingsDescription.ts

# Update feature enums
uv run waldur print_features_enums > ../waldur-homeport/src/FeaturesEnums.ts
```

## How-to: Adding a New Configuration Section

### 1. Backend Definition (Mastermind)

In `waldur_core/server/constance_settings.py`:

1. Add settings to `CONSTANCE_CONFIG`.
2. Group them in `CONSTANCE_CONFIG_FIELDSETS`.
3. Add keys to `PUBLIC_CONSTANCE_SETTINGS`.

### 2. Frontend Sync

Run the auto-generation commands mentioned above.

### 3. Frontend Implementation (Homeport)

1. **Create Component**: Create a new component (e.g., `src/administration/myservice/MyServiceSettings.tsx`).

   ```tsx
   export const MyServiceSettings = () => {
     const { data, isLoading } = useQuery({
       queryKey: ['MyServiceSettings'],
       queryFn: () => overrideSettingsRetrieve().then(r => r.data)
     });
     if (isLoading) return <LoadingSpinner />;
     return <SettingsCard groupNames={[translate('My Service')]} settingsSource={data} />;
   };
   ```

2. **Register Route**: Add the route in `src/administration/routes.ts` under the appropriate parent (usually `admin-configuration`).

---

## LLM Quick-start Patterns

When asking an LLM to add configuration:

1. **Provide backend keys**: "I added `ENABLED_REPORTING_SCREENS` to Mastermind."
2. **Specify group name**: "The settings are in the 'Reporting' group."
3. **Reference template**: "Use `AdministrationSshKeys.tsx` as a template."
4. **Target file**: "Register the route in `src/administration/routes.ts`."
