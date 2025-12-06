'use client'

import {useEffect, useState} from 'react'

import {EditorContent, useEditor} from '@tiptap/react'
import clsx from 'clsx'

import useToast from '@/hooks/use-toast'
import {buildExtensions} from '@/lib/notes/editor/build-extensions'
import {ensureTrailingParagraph} from '@/lib/notes/editor/trailing-paragraph'

import LinkBanner from './link-banner'
import Toolbar from './toolbar'

import type {MarkdownProperty} from '@/types/editor'

export const MarkdownEditor = ({
  value,
  onUpdate,
  className,
  linkButton,
  onSetLinkButton,
}: MarkdownProperty) => {
  const [internalLink, setInternalLink] = useState(linkButton ?? '')
  const {showToast} = useToast()

  useEffect(() => setInternalLink(linkButton ?? ''), [linkButton])

  const editorInstance = useEditor({
    extensions: buildExtensions({
      onPasteTruncate: () => showToast('붙여넣기 최대 5000자 까지 허용됩니다'),
    }),
    content: '',
    immediatelyRender: false,
    onCreate: ({editor: ed}) => ensureTrailingParagraph(ed.view),
    onUpdate: ({editor: ed}) => {                               
      onUpdate(ed.getHTML())
      ensureTrailingParagraph(ed.view)
    },
    editorProps: {
      attributes: {class: 'prose focus:outline-none'},
      handleDOMEvents: {
        compositionend: (view) => {
          ensureTrailingParagraph(view)
          return false
        },
      },
    },
  })

  useEffect(() => {
    if (editorInstance && value !== editorInstance.getHTML()) {
      editorInstance.commands.setContent(value)
    }
  }, [value, editorInstance])

  if (!editorInstance) return <div>Loading editor...</div>

  return (
    <div
      onClick={(event) => {
        const element = event.target as HTMLElement
        if (element.closest('.ProseMirror')) return
        if (element.closest('[data-editor-toolbar]')) return
        if (element.closest('[data-lang-portal]')) return
        editorInstance.commands.focus()
      }}
      className={clsx('relative max-w-full min-w-64 min-h-64 cursor-pointer', className)}
    >
      <Toolbar
        editor={editorInstance}
        linkButton={linkButton}
        onSetLinkButton={onSetLinkButton}
      />

      <div className="h-12">
        <LinkBanner
          link={internalLink}
          onClear={() => {
            setInternalLink('')
            onSetLinkButton?.(undefined)
          }}
        />
      </div>

      <div className={clsx(internalLink ? 'mt-16' : 'mt-5', 'w-full text-body text-custom_slate-700')}>
        <div className="h-full overflow-y-auto rounded">
          <EditorContent editor={editorInstance} className="max-w-full" />
        </div>
      </div>
    </div>
  )
}

export default MarkdownEditor