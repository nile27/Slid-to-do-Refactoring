'use client'

import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

import type {LanguageMenuPortalProperty} from '@/types/editor'

const LanguageMenuPortal = ({
    anchorRef,
    isOpen,
    currentLang,
    options,
    onSelect,
    onClose,
}: LanguageMenuPortalProperty) => {
    const portalReference = useRef<HTMLDivElement>(null)
    const [style, setStyle] = useState({top: 0, left: 0, width: 200})

    useLayoutEffect(() => {
        if (anchorRef.current && isOpen) {
            const rect = anchorRef.current.getBoundingClientRect()
            setStyle({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            })
        }
    }, [anchorRef, isOpen])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!portalReference.current?.contains(event.target as Node)) {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return undefined

    return createPortal(
        <div
            ref={portalReference}
            onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
            }}
            style={{
                position: 'absolute',
                top: style.top,
                left: style.left,
                zIndex: 9999,
            }}
            className="max-w-20 max-h-64 overflow-y-auto bg-white rounded-xl shadow-lg"
        >
            {options.map((opt) => (
                <button
                    key={opt.value}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100  ${
                        currentLang === opt.value ? 'font-semibold' : ''
                    }`}
                    onMouseDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                    }}
                    onClick={() => {
                        // onSelect 내부에서 editor.chain().focus().updateAttributes(...).run() 하도록!
                        onSelect(opt.value)
                        // 에디터 트랜잭션 적용 이후 닫기 (이벤트 순서 경쟁 방지)
                        requestAnimationFrame(() => onClose())
                    }}
                >
                    {opt.label}
                </button>
            ))}
        </div>,
        document.body,
    )
}

export default LanguageMenuPortal
