import { FC } from 'react';

export const SkeletonLoader: FC = () => {
  return (
    <div className="aui-loading-block">
      <div className="aui-skeleton-lines">
        <div className="aui-skeleton-line aui-skeleton-line--long" />
        <div className="aui-skeleton-line aui-skeleton-line--medium" />
        <div className="aui-skeleton-line aui-skeleton-line--short" />
        <div className="aui-skeleton-line aui-skeleton-line--long" />
        <div className="aui-skeleton-line aui-skeleton-line--medium" />
      </div>
    </div>
  );
};
