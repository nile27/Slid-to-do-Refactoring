'use client'

import Image from 'next/image'

import NotesSelect from '@/components/notes/select'
import {useModal} from '@/hooks/use-modal'

import SideModal from '../common/modal/side-modal'

import type {NoteCommon} from '@/types/notes'

export const NoteList = ({notesData}: {notesData: NoteCommon[]}) => {
    const {openModal} = useModal((noteId: number) => <SideModal noteId={noteId} />, {
        modalAnimation: 'slideFromRight',
    })

    /*노트 제목 클릭 시 사이드 모달 오픈* */
    const openNoteDetail = (noteId: number) => {
        openModal(noteId)
    }

    return (
        <div className="mt-4 w-full h-full flex-1">
            {notesData.map((note) => (
                <div key={note.id} className="mt-4 bg-white rounded-xl border border-custom_slate-100 p-6">
                    <div className="flex items-center justify-between border-b-1 border-custom_slate-200 pb-2">
                        <div className="">
                            <Image src="/notes/note-list.svg" alt="icon" width={28} height={28} />
                        </div>
                        <span
                            onClick={() => openNoteDetail(note.id)}
                            className="text-subTitle font-medium cursor-pointer block w-full truncate pl-3"
                        >
                            {note.title}
                        </span>
                        <NotesSelect noteId={note.id} />
                    </div>

                    <div className="bg-white rounded-xl">
                        <div className="pt-3 flex items-center gap-2">
                            <div className="p-1 bg-custom_slate-100 text-custom_slate-700 text-subBody font-medium rounded-sm shrink-0 whitespace-nowrap">
                                To do
                            </div>
                            <p className=" text-custom_slate-700 text-subBody font-normal min-w-0 truncate">
                                {' '}
                                {note.todo.title}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default NoteList
