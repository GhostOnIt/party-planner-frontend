import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoUploader } from './PhotoUploader';

const NativeURL = URL;
beforeEach(() => {
  vi.stubGlobal('URL', class extends NativeURL {
    static createObjectURL = vi.fn(() => 'blob:test-photo');
    static revokeObjectURL = vi.fn();
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('Photo batch selection', () => {
  it('rejects a photo over 10 MiB before sending', async () => {
    const upload = vi.fn();
    render(<PhotoUploader open onOpenChange={vi.fn()} onUpload={upload} />);
    const file = new File(['test'], 'large.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
    await userEvent.setup().upload(screen.getByRole('dialog').querySelector('input[type="file"]') as HTMLInputElement, file);
    expect(screen.getByText(/dépasse la taille maximale de 10 Mo/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Envoyer/ })).toBeDisabled();
    expect(upload).not.toHaveBeenCalled();
  });

  it('keeps at most 20 photos and explains excess selection', async () => {
    const upload = vi.fn();
    render(<PhotoUploader open onOpenChange={vi.fn()} onUpload={upload} />);
    const files = Array.from({ length: 21 }, (_, i) => new File(['test'], `${i}.png`, { type: 'image/png' }));
    const user = userEvent.setup();
    await user.upload(screen.getByRole('dialog').querySelector('input[type="file"]') as HTMLInputElement, files);
    expect(screen.getByText(/ne pouvez ajouter que 20/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Envoyer (20)' }));
    expect(upload.mock.calls[0][0]).toHaveLength(20);
  });

  it('clears the previous successful selection when the modal closes', async () => {
    const props = { onOpenChange: vi.fn(), onUpload: vi.fn() };
    const { rerender } = render(<PhotoUploader open {...props} />);
    await userEvent.setup().upload(screen.getByRole('dialog').querySelector('input[type="file"]') as HTMLInputElement, new File(['test'], 'photo.png', { type: 'image/png' }));
    expect(screen.getByRole('button', { name: 'Envoyer (1)' })).toBeEnabled();
    rerender(<PhotoUploader open={false} {...props} />);
    rerender(<PhotoUploader open {...props} />);
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled();
  });
});

