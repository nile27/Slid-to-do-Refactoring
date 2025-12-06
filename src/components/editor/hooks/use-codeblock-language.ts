'use client'

import {useCallback, useEffect, useRef, useState} from 'react'

import {TextSelection} from '@tiptap/pm/state'

import {dynamicRegister, prewarmPopular} from '@/lib/notes/editor/code-highlight'

import {getActiveCodeBlockPos} from '../utils/get-active-codeblock-pos'

import type {Editor} from '@tiptap/react'

export const useCodeBlockLanguage = (editor?: Editor | null) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const lastCodePosReference = useRef<number | null>(null)

    useEffect(() => {
        prewarmPopular()
    }, [])

    const isCodeBlock = !!editor?.isActive('codeBlock')
    const currentLang = editor?.getAttributes('codeBlock')?.language ?? ''

    const toggleMenu = useCallback(() => {
        if (!editor) return
        const p = getActiveCodeBlockPos(editor)
        if (p !== undefined) lastCodePosReference.current = p
        setMenuOpen((v) => !v)
    }, [editor])

    const changeLanguage = useCallback(
        async (lang: string) => {
            const ed = editor
            if (!ed) return

            const current = ed.getAttributes('codeBlock')?.language
            if (current === lang) return

            ed.commands.focus()
            await dynamicRegister(lang)

            const pos = getActiveCodeBlockPos(ed)
            if (pos === undefined) return

            // selection을 코드블록 내부로 고정한 뒤 언어 attrs만 교체
            ed.commands.setTextSelection(pos + 1)
            ed.commands.command(({state, tr, dispatch}) => {
                const {codeBlock} = state.schema.nodes
                const node = tr.doc.nodeAt(pos)
                if (!node || node.type !== codeBlock) return false
                tr.setNodeMarkup(pos, codeBlock, {...node.attrs, language: lang}, node.marks)
                tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)))
                dispatch?.(tr)
                return true
            })

            lastCodePosReference.current = pos
            setMenuOpen(false)
        },
        [editor],
    )

    const ensureCodePos = useCallback(() => {
        if (!editor) return
        const pos = getActiveCodeBlockPos(editor)
        if (pos !== undefined) lastCodePosReference.current = pos
    }, [editor])

    return {
        isCodeBlock,
        currentLang,
        menuOpen,
        setMenuOpen,
        toggleMenu,
        changeLanguage,
        ensureCodePos,
    }
}
