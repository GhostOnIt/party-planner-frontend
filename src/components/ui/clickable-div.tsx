import { forwardRef, type ComponentPropsWithoutRef, type KeyboardEvent } from 'react';

type DivProps = ComponentPropsWithoutRef<'div'>;

export interface ClickableDivProps extends Omit<DivProps, 'onKeyDown'> {
  /** Appelé sur clic + appui Enter / Espace. */
  onClick: NonNullable<DivProps['onClick']>;
  /** Permet d'étendre la gestion clavier (sera appelée avant les Enter/Espace par défaut). */
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * Div interactive accessible au clavier.
 * Ajoute role="button", tabIndex=0 et un handler onKeyDown qui déclenche onClick
 * sur Enter ou Espace. À utiliser à la place de `<div onClick={...}>` pour les
 * conteneurs cliquables qui ne peuvent pas être un vrai `<button>` (carte, ligne
 * de liste, etc.).
 */
export const ClickableDiv = forwardRef<HTMLDivElement, ClickableDivProps>(
  function ClickableDiv({ onClick, onKeyDown, children, role = 'button', tabIndex = 0, ...rest }, ref) {
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e as unknown as Parameters<NonNullable<DivProps['onClick']>>[0]);
      }
    };

    return (
      <div ref={ref} role={role} tabIndex={tabIndex} onClick={onClick} onKeyDown={handleKeyDown} {...rest}>
        {children}
      </div>
    );
  }
);
