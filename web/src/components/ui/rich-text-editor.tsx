"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Sparkles,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline font-medium hover:text-primary/80 transition-colors cursor-pointer",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[180px] w-full bg-background/50 px-4 py-3 text-xs ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm dark:prose-invert max-w-none leading-relaxed",
          "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mb-2 [&_h1]:mt-3",
          "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-1.5 [&_h2]:mt-2.5",
          "[&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-foreground [&_h3]:mb-1 [&_h3]:mt-2",
          "[&_p]:mb-2 [&_p]:text-foreground/90",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/60 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-2",
          "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_code]:font-mono",
          className
        ),
      },
    },
  })

  useEffect(() => {
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "")
    }
  }, [value, editor])

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Masukkan URL Tautan:", previousUrl)

    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="rounded-xl border border-border/80 bg-background/80 shadow-sm transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10 overflow-hidden">
      {/* Notion Style Floating/Minimalist Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border/40 bg-muted/40 px-3 py-1.5 text-muted-foreground backdrop-blur-md">
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-7 px-2 text-xs rounded font-bold"
            title="Tebal (Bold)"
          >
            B
          </Button>

          <Button
            type="button"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-7 px-2 text-xs rounded italic"
            title="Miring (Italic)"
          >
            i
          </Button>

          <Button
            type="button"
            variant={editor.isActive("strike") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="h-7 px-2 text-xs rounded line-through"
            title="Coret (Strikethrough)"
          >
            S
          </Button>

          <Button
            type="button"
            variant={editor.isActive("code") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className="h-7 w-7 p-0 text-xs rounded font-mono"
            title="Inline Code"
          >
            {"< >"}
          </Button>
        </div>

        <div className="h-3.5 w-[1px] bg-border/60 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="h-7 px-2 text-xs rounded font-bold"
            title="Heading 1"
          >
            H1
          </Button>

          <Button
            type="button"
            variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="h-7 px-2 text-xs rounded font-semibold"
            title="Heading 2"
          >
            H2
          </Button>

          <Button
            type="button"
            variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className="h-7 px-2 text-xs rounded font-medium"
            title="Heading 3"
          >
            H3
          </Button>
        </div>

        <div className="h-3.5 w-[1px] bg-border/60 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="h-7 w-7 p-0 text-xs rounded"
            title="Bullet List"
          >
            <List className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="h-7 w-7 p-0 text-xs rounded"
            title="Numbered List"
          >
            <ListOrdered className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="h-7 w-7 p-0 text-xs rounded"
            title="Notion Callout / Quote"
          >
            <Quote className="size-3.5" />
          </Button>
        </div>

        <div className="h-3.5 w-[1px] bg-border/60 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant={editor.isActive("link") ? "secondary" : "ghost"}
            size="sm"
            onClick={setLink}
            className="h-7 w-7 p-0 text-xs rounded"
            title="Sematkan Link"
          >
            <LinkIcon className="size-3.5" />
          </Button>

          {editor.isActive("link") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="h-7 w-7 p-0 text-xs text-destructive hover:bg-destructive/10 rounded"
              title="Lepas Link"
            >
              <Unlink className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-7 w-7 p-0 text-xs rounded"
            title="Urungkan (Undo)"
          >
            <Undo className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-7 w-7 p-0 text-xs rounded"
            title="Ulangi (Redo)"
          >
            <Redo className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Notion Canvas Body */}
      <div className="p-4 bg-background/30 min-h-[160px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
