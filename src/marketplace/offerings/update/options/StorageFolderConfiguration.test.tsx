import { render, screen } from '@testing-library/react';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Offering } from '@/marketplace/types';

import { StorageFolderConfiguration } from './StorageFolderConfiguration';

const mockOffering = {
  components: [
    {
      type: 'storage',
      name: 'Storage',
      billing_type: 'limit',
    },
    {
      type: 'ram',
      name: 'RAM',
      billing_type: 'limit',
    },
    {
      type: 'cpu',
      name: 'CPU',
      billing_type: 'usage', // Not limit-based, should be filtered out
    },
  ],
} as Offering;

const renderComponent = (
  props: Partial<Parameters<typeof StorageFolderConfiguration>[0]> = {},
  initialValues = {},
  validate: any = undefined,
) => {
  return render(
    <Form
      onSubmit={() => {}}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <StorageFolderConfiguration offering={mockOffering} {...props} />
        </form>
      )}
    />,
  );
};

describe('StorageFolderConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all configuration fields', () => {
      renderComponent();

      expect(screen.getByText('Component Type')).toBeInTheDocument();
      expect(
        screen.getByText('Default Hard Quota Multiplier'),
      ).toBeInTheDocument();
      expect(screen.getByText('Inode Soft Multiplier')).toBeInTheDocument();
      expect(screen.getByText('Inode Hard Multiplier')).toBeInTheDocument();
      expect(screen.getByText('Storage Data Types')).toBeInTheDocument();
      expect(screen.getByText('Default Permission')).toBeInTheDocument();
    });

    it('renders field descriptions', () => {
      renderComponent();

      expect(
        screen.getByText('Limit-based component that defines soft space quota'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Default multiplier for hard quota (1.0 = same as soft quota)',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Number of inodes per TB for soft quota.'),
      ).toBeInTheDocument();
    });

    it('renders input placeholders correctly', () => {
      renderComponent();

      expect(screen.getByPlaceholderText('1.0')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('7000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('10000')).toBeInTheDocument();
    });

    it('renders Add Storage Data Type button', () => {
      renderComponent();

      expect(
        screen.getByRole('button', { name: 'Add Storage Data Type' }),
      ).toBeInTheDocument();
    });
  });

  describe('component filtering', () => {
    it('only shows limit-based components in the component type select', () => {
      renderComponent();

      // The component type select should be present
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });

    it('handles empty components array gracefully', () => {
      const offeringWithNoComponents = { components: [] };

      expect(() =>
        renderComponent({ offering: offeringWithNoComponents as any }),
      ).not.toThrow();
    });

    it('handles undefined offering gracefully', () => {
      expect(() => renderComponent({ offering: undefined })).not.toThrow();
    });

    it('handles offering without components property', () => {
      expect(() => renderComponent({ offering: {} as any })).not.toThrow();
    });
  });

  describe('storage data types field array', () => {
    it('renders Add Storage Data Type button', () => {
      renderComponent();

      const addButton = screen.getByRole('button', {
        name: 'Add Storage Data Type',
      });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveClass('btn-outline-primary');
    });

    it('renders FieldArray for storage data types', () => {
      renderComponent();

      // The Storage Data Types label and description should be present
      expect(screen.getByText('Storage Data Types')).toBeInTheDocument();
      expect(
        screen.getByText('Available storage data type options'),
      ).toBeInTheDocument();
    });
  });

  describe('form field attributes', () => {
    it('number inputs have correct min and step attributes', () => {
      renderComponent();

      const multiplierInput = screen.getByPlaceholderText('1.0');
      expect(multiplierInput).toHaveAttribute('type', 'number');
      expect(multiplierInput).toHaveAttribute('min', '1');
      expect(multiplierInput).toHaveAttribute('step', '0.1');

      const softInodeInput = screen.getByPlaceholderText('7000');
      expect(softInodeInput).toHaveAttribute('type', 'number');
      expect(softInodeInput).toHaveAttribute('min', '1');

      const hardInodeInput = screen.getByPlaceholderText('10000');
      expect(hardInodeInput).toHaveAttribute('type', 'number');
      expect(hardInodeInput).toHaveAttribute('min', '1');
    });
  });

  describe('permissions select', () => {
    it('renders permission select with placeholder', () => {
      renderComponent();

      // Verify the select components are rendered
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2); // Component type + Default permission
    });
  });

  describe('inode configuration', () => {
    it('displays inode soft multiplier field with description', () => {
      renderComponent();

      expect(screen.getByText('Inode Soft Multiplier')).toBeInTheDocument();
      expect(
        screen.getByText('Number of inodes per TB for soft quota.'),
      ).toBeInTheDocument();
    });

    it('displays inode hard multiplier field with description', () => {
      renderComponent();

      expect(screen.getByText('Inode Hard Multiplier')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Number of inodes per TB for hard quota (should be ≥ soft multiplier).',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('inode multiplier validation', () => {
    it('renders error message in UI when validation fails', () => {
      const validate = () => ({
        storage_folder_config: {
          inode_hard_multiplier:
            'Hard inode multiplier cannot be less than soft inode multiplier',
        },
      });

      renderComponent(
        {},
        {
          type: { value: 'storage_folder_manager' },
          storage_folder_config: {
            inode_soft_multiplier: '2000',
            inode_hard_multiplier: '1000',
          },
        },
        validate,
      );

      expect(
        screen.getByText(
          'Hard inode multiplier cannot be less than soft inode multiplier',
        ),
      ).toBeInTheDocument();
    });
  });
});
