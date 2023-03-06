import { translate } from '@waldur/i18n';

export const VolumeComponents = ({ resource }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <div className="fs-1">{(resource.size / 1024).toFixed()} GB</div>
      <p className="text-muted">
        {translate('{type} storage', { type: resource.type_name })}
      </p>{' '}
    </div>
  );
};
