export const MAX_PHOTOS_PER_UPLOAD = 20;
export const MAX_PHOTO_SIZE_MB = 10;
export const PHOTO_UPLOAD_TIMEOUT_MS = 180_000;

export function photoUploadError(error: unknown): string {
  const failure = error as {
    code?: string;
    response?: { status?: number; data?: { message?: unknown; errors?: Record<string, unknown> } };
  } | null;
  if (failure?.response?.status === 413) {
    return 'Le serveur a refusé la taille de cet envoi. Réduisez le lot et réessayez : 20 photos maximum, 10 Mo par photo.';
  }
  if (failure?.response?.status === 422) {
    const details = Object.values(failure.response.data?.errors ?? {})
      .flat().filter((value): value is string => typeof value === 'string');
    if (details.length) return [...new Set(details)].slice(0, 3).join(' ');
  }
  if (failure?.code === 'ECONNABORTED' || failure?.code === 'ETIMEDOUT') {
    return 'L’envoi a pris trop de temps. Vérifiez votre connexion et les photos déjà présentes, puis réessayez avec un lot plus petit.';
  }
  if (failure?.response?.status && failure.response.status < 500
    && typeof failure.response.data?.message === 'string') {
    return failure.response.data.message;
  }
  return 'L’envoi n’a pas pu être terminé. Vérifiez votre connexion et les photos déjà présentes dans la galerie avant de réessayer.';
}
