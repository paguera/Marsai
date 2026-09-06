export const getUploadUrl = (url: string) => {
  if (!url) return "";
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  
  // Si c'est déjà un chemin relatif
  if (url.startsWith("/uploads")) {
    return `${cleanApiUrl}${url}`;
  }
  if (url.startsWith("uploads")) {
    return `${cleanApiUrl}/${url}`;
  }
  
  // Si c'est l'ancienne URL absolue en localhost, on la remplace par l'API URL
  return url.replace("http://localhost:5011", cleanApiUrl);
};
