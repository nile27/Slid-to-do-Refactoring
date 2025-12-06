import type {LanguageFn} from 'highlight.js'

/** 노트 에디터 코드 메뉴 드롭다운 */
export interface LanguageMenuPortalProperty {
    anchorRef: React.RefObject<HTMLElement | null>
    isOpen: boolean
    currentLang: string
    options: readonly {label: string; value: string}[]
    onSelect: (lang: string) => void
    onClose: () => void
}

/** 에디터 엔터 제한 */
export interface MaxLinesOptions {
    limit: number
    allowSoftBreak?: boolean
}

/** 에디터 글자수 제한 */
export interface PasteLimiterOptions {
    limit: number
    onTruncate?: (info: {before: number; pasted: number; allowed: number}) => void
}

/** 에디터 */
export interface MarkdownProperty {
    value: string
    onUpdate: (content: string) => void
    className?: string
    linkButton?: string
    onSetLinkButton?: (link: string | undefined) => void
}

/** 에디터 옵션 */
export interface BuildExtensionsArguments {
    onPasteTruncate?: (info: {before: number; pasted: number; allowed: number}) => void
}

/** 에디터 버튼 */
export type IconButtonProperty = {
    active?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'ghost' | 'primary'
    className?: string
    children: React.ReactNode
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

/** 툴바에서 사용 */
export interface HLJSLangModule {
    default: LanguageFn
}
export type HLJSLangLoader = () => Promise<HLJSLangModule>

/** 툴바 버튼 */
export interface ButtonItem {
    title: string
    active?: boolean
    handleClick: () => void
    icon: string
    variant?: 'ghost' | 'primary'
}
