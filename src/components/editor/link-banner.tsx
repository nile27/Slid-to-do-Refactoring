'use client'

import Image from 'next/image'

export const LinkBanner = ({link, onClear}: {link: string; onClear: () => void}) => {
    if (!link) return undefined
    return (
        <div className="absolute top-12 w-full my-4 bg-custom_slate-200 p-1 rounded-full flex justify-between items-center">
            <div className="flex items-end gap-2 flex-1 min-w-0 max-w-full p-1">
                <Image src="/markdown-editor/ic-save-link.svg" alt="링크아이콘" width={24} height={24} />
                <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-body text-custom_slate-800"
                >
                    {link}
                </a>
            </div>
            <button onClick={onClear} className="shrink-0 ml-2 cursor-pointer">
                <Image src="/todos/ic-delete.svg" alt="삭제" width={24} height={24} />
            </button>
        </div>
    )
}

export default LinkBanner
