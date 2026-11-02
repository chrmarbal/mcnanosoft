const backendURL = import.meta.env.VITE_BASE_URL_BACKEND || "https://localhost:3016/"
const driveImageBaseUrl = "https://lh3.googleusercontent.com/d/"

export const getProjectImageUrl = (imageValue) => {
  if (!imageValue) return ""

  if (/^https?:\/\//i.test(imageValue)) {
    try {
      const imageUrl = new URL(imageValue)
      const hostname = imageUrl.hostname.toLowerCase()
      const driveFileId = imageUrl.searchParams.get("id") || imageUrl.pathname.match(/\/d\/([^/]+)/)?.[1]
      if (driveFileId && (hostname === "drive.google.com" || hostname.endsWith(".googleusercontent.com"))) {
        return `${driveImageBaseUrl}${driveFileId}`
      }
    } catch {
      return imageValue
    }

    return imageValue
  }

  if (/^[\w-]{20,}$/.test(imageValue)) {
    return `${driveImageBaseUrl}${imageValue}`
  }

  return `${backendURL.replace(/\/?$/, "/")}${imageValue.replace(/^\/+/, "")}`
}
