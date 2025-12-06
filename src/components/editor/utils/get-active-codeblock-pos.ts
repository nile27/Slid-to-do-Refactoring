import type {Editor} from '@tiptap/react'

export const getActiveCodeBlockPos = (editor: Editor): number | undefined => {
    const {$from} = editor.state.selection
    for (let d = $from.depth; d >= 0; d--) {
        const node = $from.node(d)
        if (node.type.name === 'codeBlock') {
            return $from.before(d)
        }
    }
    return undefined
}
export default getActiveCodeBlockPos
