export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve((<string>reader.result).split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
