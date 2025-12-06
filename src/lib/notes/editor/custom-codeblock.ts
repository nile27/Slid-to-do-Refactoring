import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

export const CustomCodeBlock = CodeBlockLowlight.extend({
    name: 'codeBlock',

    addOptions() {
        return {
            ...this.parent?.(),
            exitOnTripleEnter: false,
            exitOnArrowDown: false,
        }
    },
    addKeyboardShortcuts() {
        const INDENT = '  '

        return {
            // 들여쓰기
            Tab: () => {
                if (!this.editor.isActive('codeBlock')) return false
                const view = this.editor.view
                const {state} = view
                const {from, to} = state.selection
                view.dispatch(state.tr.insertText(INDENT, from, to))
                return true
            },
            // 내어쓰기
            'Shift-Tab': () => {
                if (!this.editor.isActive('codeBlock')) return false
                const view = this.editor.view
                const {state} = view
                const {from} = state.selection
                const before = Math.max(0, from - INDENT.length)
                const text = state.doc.textBetween(before, from)
                if (text === INDENT) {
                    view.dispatch(state.tr.delete(before, from))
                    return true
                }
                return false
            },

        }
    },
})
