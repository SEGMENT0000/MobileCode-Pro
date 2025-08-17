export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Determine read method based on file type
    if (
      file.type.startsWith('image/') ||
      file.type.startsWith('audio/') ||
      file.type.startsWith('video/') ||
      file.name.endsWith('.woff') ||
      file.name.endsWith('.woff2') ||
      file.name.endsWith('.ttf') ||
      file.name.endsWith('.otf')
    ) {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    }
  });
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isWebFile = (filename: string): boolean => {
  const webExtensions = [
    'html', 'htm', 'css', 'js', 'json', 'xml',
    'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
    'woff', 'woff2', 'ttf', 'otf', 'eot',
    'mp3', 'mp4', 'webm', 'ogg', 'wav',
    'md', 'txt', 'ico'
  ];
  
  const ext = getFileExtension(filename);
  return webExtensions.includes(ext);
};

export const createBlobUrl = (content: string, type = 'text/html'): string => {
  const blob = new Blob([content], { type });
  return URL.createObjectURL(blob);
};

export const downloadFile = (content: string, filename: string, type = 'text/html'): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
};
