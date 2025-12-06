import {Extension} from '@tiptap/core'
import {Plugin} from 'prosemirror-state'

import type {PasteLimiterOptions} from '@/types/editor'

export const PasteLimiter = Extension.create<PasteLimiterOptions>({
    name: 'pasteLimiter',
    addOptions() {
        return {limit: 5000, onTruncate: undefined}
    },
    addProseMirrorPlugins() {
        return [
            new Plugin({
                props: {
                    handlePaste: (view, event) => {
                        const plain = event.clipboardData?.getData('text/plain') ?? ''
                        const current = view.state.doc.textContent.length
                        const remain = Math.max(0, this.options.limit - current)

                        let allowText = plain

                        if (remain <= 0) {
                            this.options.onTruncate?.({before: current, pasted: plain.length, allowed: 0})
                            allowText = ''
                        } else if (plain.length > remain) {
                            allowText = plain.slice(0, remain)
                            this.options.onTruncate?.({
                                before: current,
                                pasted: plain.length,
                                allowed: allowText.length,
                            })
                        }

                        if (allowText) {
                            view.dispatch(view.state.tr.insertText(allowText))
                        }

                        return true
                    },
                },
            }),
        ]
    },
})
