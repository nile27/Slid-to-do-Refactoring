'use client'

import Image from 'next/image'
import {useRef} from 'react'

import LanguageMenuPortal from '@/components/editor/language-menu-portal'
import useLayout from '@/hooks/use-layout'
import useModal from '@/hooks/use-modal'
import {LANG_OPTIONS} from '@/lib/notes/editor'

import {useCodeBlockLanguage} from './hooks/use-codeblock-language'
import IconButton from './icon-button'
import {getActiveCodeBlockPos} from './utils/get-active-codeblock-pos'
import LinkModal from '../common/modal/link-modal'

import type {ButtonItem} from '@/types/editor'
import type {Editor} from '@tiptap/react'
import type React from 'react'

const Separator = () => (
    <span role="separator" aria-hidden="true" className="mx-[1px] h-5 w-px bg-slate-200/80 shrink-0" />
)

const ControlsRow = ({items, size}: {items: ButtonItem[]; size: number}) => {
    return (
        <div className="flex desktop:gap-1 items-center">
            {items.map((button) => (
                <IconButton
                    key={button.title}
                    title={button.title}
                    active={button.active}
                    onClick={button.handleClick}
                    variant={button.variant}
                >
                    <Image src={button.icon} alt={button.title} width={size} height={size} />
                </IconButton>
            ))}
        </div>
    )
}

const InlineControls = ({editor, size, isPrimary = true}: {editor: Editor; size: number; isPrimary?: boolean}) => {
    const variant = isPrimary ? 'primary' : 'ghost'
    const items: ButtonItem[] = [
        {
            title: 'Bold',
            active: editor.isActive('bold'),
            handleClick: () => editor.chain().focus().toggleBold().run(),
            icon: '/markdown-editor/ic-bold.svg',
            variant,
        },
        {
            title: 'Italic',
            active: editor.isActive('italic'),
            handleClick: () => editor.chain().focus().toggleItalic().run(),
            icon: '/markdown-editor/ic-italic.svg',
            variant,
        },
        {
            title: 'Underline',
            active: editor.isActive('underline'),
            handleClick: () => editor.chain().focus().toggleUnderline().run(),
            icon: '/markdown-editor/ic-underline.svg',
        },
    ]
    return <ControlsRow items={items} size={size} />
}

const AlignControls = ({editor, size}: {editor: Editor; size: number}) => {
    const items: ButtonItem[] = [
        {
            title: 'left',
            active: editor.isActive({textAlign: 'left'}),
            handleClick: () => editor.chain().focus().setTextAlign('left').run(),
            icon: '/markdown-editor/ic-align-left.svg',
        },
        {
            title: 'center',
            active: editor.isActive({textAlign: 'center'}),
            handleClick: () => editor.chain().focus().setTextAlign('center').run(),
            icon: '/markdown-editor/ic-align-center.svg',
        },
        {
            title: 'right',
            active: editor.isActive({textAlign: 'right'}),
            handleClick: () => editor.chain().focus().setTextAlign('right').run(),
            icon: '/markdown-editor/ic-align-right.svg',
        },
    ]
    return <ControlsRow items={items} size={size} />
}

const ListControls = ({editor, size}: {editor: Editor; size: number}) => {
    const items: ButtonItem[] = [
        {
            title: 'bulletList',
            active: editor.isActive('bulletList'),
            handleClick: () => editor.chain().focus().toggleBulletList().run(),
            icon: '/markdown-editor/ic-bullet-list.svg',
        },
        {
            title: 'orderedList',
            active: editor.isActive('orderedList'),
            handleClick: () => editor.chain().focus().toggleOrderedList().run(),
            icon: '/markdown-editor/ic-ordered-list.svg',
        },
    ]
    return <ControlsRow items={items} size={size} />
}

const LinkButton = ({hidden, onOpen, size}: {hidden?: boolean; onOpen: () => void; size: number}) => {
    if (hidden) return undefined
    return (
        <IconButton title="Link" onClick={onOpen} className="mr-1">
            <Image src="/markdown-editor/ic-link.svg" alt="Link Button" width={size} height={size} />
        </IconButton>
    )
}

const CodeControls = ({editor, size}: {editor: Editor; size: number}) => {
    const languageButtonReference = useRef<HTMLButtonElement>(null)
    const {isCodeBlock, currentLang, menuOpen, toggleMenu, changeLanguage, ensureCodePos} = useCodeBlockLanguage(editor)

    return (
        <>
            <IconButton
                title="Code block"
                onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault()}
                onClick={() => {
                    editor.chain().focus().toggleCodeBlock({language: 'javascript'}).run()
                    const pos = getActiveCodeBlockPos(editor)
                    if (pos !== undefined) editor.commands.setTextSelection(pos + 1)
                    editor.commands.focus()
                }}
            >
                <Image src="/markdown-editor/ic-code.svg" alt="Code block" width={size} height={size} />
            </IconButton>

            <div className="relative flex items-center ml-2 w-full h-full">
                <button
                    type="button"
                    ref={languageButtonReference}
                    onMouseDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                    }}
                    onClick={(event) => {
                        event.stopPropagation()
                        ensureCodePos()
                        toggleMenu()
                    }}
                    disabled={!isCodeBlock}
                    className="bg-slate-200 disabled:opacity-50 text-xs text-slate-700 w-16 h-6 shrink-0 rounded-sm"
                    title="Select language"
                >
                    {currentLang || 'Language'}
                </button>

                <LanguageMenuPortal
                    anchorRef={languageButtonReference}
                    isOpen={menuOpen}
                    currentLang={currentLang}
                    options={LANG_OPTIONS}
                    onSelect={changeLanguage}
                    onClose={() => toggleMenu()}
                />
            </div>
        </>
    )
}

export const Toolbar = ({
    editor,
    linkButton,
    onSetLinkButton,
}: {
    editor: Editor
    linkButton?: string
    onSetLinkButton?: (link: string | undefined) => void
}) => {
    const isTablet = useLayout('tablet')
    const isDesktop = useLayout('desktop')
    const iconSize = isDesktop ? 24 : isTablet ? 22 : 20

    const {openModal, closeModal} = useModal(
        () => (
            <LinkModal
                onSetButton={(url) => {
                    onSetLinkButton?.(url)
                    closeModal()
                }}
            />
        ),
        {modalAnimation: 'slideFromTop', backdropAnimation: 'fade'},
    )

    // eslint-disable-next-line unicorn/no-null
    if (!editor) return null

    return (
        <div
            data-editor-toolbar
            className="scrollbar-custom absolute desktop:gap-4 tablet:gap-1 w-full flex items-center gap-1 px-2 py-1
        rounded-sm border border-slate-200 bg-slate-50 backdrop-blur
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]
        overflow-x-auto whitespace-nowrap"
        >
            <InlineControls editor={editor} size={iconSize} isPrimary />
            <Separator />
            <AlignControls editor={editor} size={iconSize} />
            <Separator />
            <ListControls editor={editor} size={iconSize} />
            <Separator />
            <div className="w-full flex items-center justify-center">
                <LinkButton hidden={!!linkButton} onOpen={openModal} size={iconSize} />
                <CodeControls editor={editor} size={iconSize} />
            </div>
        </div>
    )
}

export default Toolbar
