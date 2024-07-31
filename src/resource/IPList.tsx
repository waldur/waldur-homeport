import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

export const IPList = ({ value }) => {
  if (Array.isArray(value) && value.filter(Boolean).length > 0) {
    return (
      <>
        {value.map((ip) => (
          <span key={ip} className="text-nowrap">
            {ip}
            <CopyToClipboardButton
              value={ip}
              size={17}
              className="mx-2 text-hover-primary cursor-pointer d-inline z-index-1 position-relative"
            />
          </span>
        ))}
      </>
    );
  }
  return <>–</>;
};
