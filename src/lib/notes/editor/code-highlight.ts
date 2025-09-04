import {createLowlight} from 'lowlight'

import type {LanguageFn} from 'highlight.js'

export const lowlight = createLowlight()

export interface HLJSLangModule {
    default: LanguageFn
}
export type HLJSLangLoader = () => Promise<HLJSLangModule>

/** 언어 옵션 */
export const LANG_OPTIONS = [
    {label: 'auto', value: ''},
    {label: 'JavaScript', value: 'javascript'},
    {label: 'TypeScript', value: 'typescript'},
    {label: 'JSX', value: 'jsx'},
    {label: 'TSX', value: 'tsx'},
    {label: 'JSON', value: 'json'},
    {label: 'HTML', value: 'html'}, // hljs 모듈명: xml
    {label: 'CSS', value: 'css'},
    {label: 'Bash', value: 'bash'},
    {label: 'Markdown', value: 'markdown'},
    {label: 'GraphQL', value: 'graphql'},
    {label: 'SQL', value: 'sql'},
    {label: 'YAML', value: 'yaml'},
    {label: 'Diff', value: 'diff'},
    {label: 'Python', value: 'python'},
] as const

/** highlight.js 모듈명 매핑  */
const HLJS_LOADER_MAP:Record<string,HLJSLangLoader> = {
    javascript: () => import('highlight.js/lib/languages/javascript'),
    typescript: () => import('highlight.js/lib/languages/typescript'),
    jsx: () => import('highlight.js/lib/languages/javascript'),
    tsx: () => import('highlight.js/lib/languages/typescript'),
    json: () => import('highlight.js/lib/languages/json'),
    html: () => import('highlight.js/lib/languages/xml'),
    css: () => import('highlight.js/lib/languages/css'),
    bash: () => import('highlight.js/lib/languages/bash'),
    markdown: () => import('highlight.js/lib/languages/markdown'),
    graphql: () => import('highlight.js/lib/languages/graphql'),
    sql: () => import('highlight.js/lib/languages/sql'),
    yaml: () => import('highlight.js/lib/languages/yaml'),
    diff: () => import('highlight.js/lib/languages/diff'),
    python: () => import('highlight.js/lib/languages/python'),
} satisfies Record<string, HLJSLangLoader>

export const dynamicRegister = async (lang: string) => {
    if (!lang) return
    if (lowlight.listLanguages().includes(lang)) return

    const load = HLJS_LOADER_MAP[lang]
    if (!load) return

    const module_ = await load()
    lowlight.register(lang, module_.default)
}

/** 초기에 자주 쓰는 언어만 예열 */
export const prewarmPopular = async () => {
    await Promise.all([dynamicRegister('javascript'), dynamicRegister('typescript'), dynamicRegister('json')])
}
