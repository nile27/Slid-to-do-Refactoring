'use client'

import CharacterCount from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'

import {lowlight} from '@/lib/notes/editor/code-highlight'
import {CustomCodeBlock} from '@/lib/notes/editor/custom-codeblock'
import {MaxLines} from '@/lib/notes/editor/max-lines'
import {PasteLimiter} from '@/lib/notes/editor/paste-limiter'

import type {BuildExtensionsArguments} from '@/types/editor'

export const buildExtensions = ({onPasteTruncate}: BuildExtensionsArguments = {}) => {
    return [
        StarterKit.configure({codeBlock: false}),
        CustomCodeBlock.configure({lowlight}),
        Underline,
        Link.configure({
            openOnClick: false,
            autolink: false,
            linkOnPaste: false,
        }),
        TextAlign.configure({types: ['heading', 'paragraph']}),
        Placeholder.configure({
            placeholder: '이 곳을 클릭해 노트 작성을 시작해주세요',
        }),
        CharacterCount.configure({
            limit: 5000,
            textCounter: (text: string) => [...new Intl.Segmenter().segment(text)].length,
            wordCounter: (text: string) => text.split(/\s+/).filter(Boolean).length,
        }),
        MaxLines.configure({limit: 10, allowSoftBreak: true}),
        PasteLimiter.configure({
            limit: 5000,
            onTruncate: onPasteTruncate,
        }),
    ]
}
export default buildExtensions
