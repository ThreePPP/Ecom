export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) return '/placeholder.jpg';
  
  // Strip localhost:5000 host to make it relative path
  if (url.includes('localhost:5000')) {
    return url.replace(/https?:\/\/localhost:5000/g, '');
  }
  
  // Handle other potential local ports if needed, but 5000 is the main offender
  
  return url;
};
