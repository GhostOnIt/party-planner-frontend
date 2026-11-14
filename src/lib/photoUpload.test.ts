import { describe, expect, it } from 'vitest';
import { photoUploadError, MAX_PHOTOS_PER_UPLOAD, MAX_PHOTO_SIZE_MB } from './photoUpload';

describe('Photo upload errors', () => {
  it('explains a 413 even when nginx returned HTML', () => {
    const message = photoUploadError({ response: { status: 413, data: '<html>413 Request Entity Too Large</html>' } });
    expect(message).toContain('taille');
    expect(message).toContain(`${MAX_PHOTOS_PER_UPLOAD} photos maximum`);
    expect(message).toContain(`${MAX_PHOTO_SIZE_MB} Mo par photo`);
  });
  it('shows the actual per-file validation failure', () => {
    expect(photoUploadError({ response: { status: 422, data: { message: 'Validation failed', errors: { 'photos.0': ['La photo dépasse 10 Mo.'] } } } })).toBe('La photo dépasse 10 Mo.');
  });
  it('deduplicates validation errors', () => {
    expect(photoUploadError({ response: { status: 422, data: { errors: { 'photos.0': ['Image invalide'], 'photos.1': ['Image invalide'] } } } })).toBe('Image invalide');
  });
  it('preserves authorization and quota explanations from the API', () => {
    expect(photoUploadError({ response: { status: 403, data: { message: 'Limite de photos atteinte.' } } })).toBe('Limite de photos atteinte.');
  });
  it('gives a useful timeout message without claiming no photo was saved', () => {
    expect(photoUploadError({ code: 'ECONNABORTED' })).toContain('photos déjà présentes');
  });
  it('does not expose raw server exceptions', () => {
    expect(photoUploadError({ response: { status: 500, data: { message: 'Private internal exception' } } })).not.toContain('Private internal exception');
  });
  it('handles an absent error response', () => {
    expect(photoUploadError(null)).toContain('Vérifiez votre connexion');
  });
});
