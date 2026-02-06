import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder: _placeholder = 'Saisissez le contenu…',
  className,
  minHeight = '280px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],  
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-w-0 focus:outline-none ' +
          'prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div
        className={cn('rounded-lg border bg-muted/20 animate-pulse', className)}
        style={{ minHeight }}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-background overflow-hidden',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      {/* Toolbar — onPointerDownCapture empêche le focus de quitter l'éditeur au clic */}
      <div
        className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1"
        onPointerDownCapture={(e) => {
          e.preventDefault();
          const target = e.target as HTMLElement;
          const button = target.closest?.('button[data-toolbar-cmd]');
          if (button) {
            const cmd = (button as HTMLElement).getAttribute('data-toolbar-cmd');
            if (cmd) {
              if (cmd === 'bold') editor.chain().focus().toggleBold().run();
              else if (cmd === 'italic') editor.chain().focus().toggleItalic().run();
              else if (cmd === 'h2') {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              } else if (cmd === 'h3') {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              } else if (cmd === 'bulletList') editor.chain().focus().toggleBulletList().run();
              else if (cmd === 'orderedList') editor.chain().focus().toggleOrderedList().run();
            }
          }
        }}
      >
        <ToolbarButton cmd="bold" active={editor.isActive('bold')} title="Gras">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton cmd="italic" active={editor.isActive('italic')} title="Italique">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <span className="w-px h-6 bg-border mx-0.5" aria-hidden />
        <ToolbarButton cmd="h2" active={editor.isActive('heading', { level: 2 })} title="Titre 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton cmd="h3" active={editor.isActive('heading', { level: 3 })} title="Titre 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <span className="w-px h-6 bg-border mx-0.5" aria-hidden />
        <ToolbarButton cmd="bulletList" active={editor.isActive('bulletList')} title="Liste à puces">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton cmd="orderedList" active={editor.isActive('orderedList')} title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="p-3" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  cmd,
  active,
  title,
  children,
}: {
  cmd: string;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      data-toolbar-cmd={cmd}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium',
        'hover:bg-accent hover:text-accent-foreground focus:outline-none',
        active && 'bg-accent text-accent-foreground'
      )}
      title={title}
    >
      {children}
    </button>
  );
}