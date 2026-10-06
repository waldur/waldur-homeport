export const saveFile = (blob: Blob, name: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
