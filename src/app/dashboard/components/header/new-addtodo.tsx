'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import {NewAddtodoSkeleton} from '@/components/ui/skeleton/dashboard/new-addtodo-skeleton'

import type {NoteCommon} from '@/types/notes'
import type {TodoResponse} from '@/types/todos'

const NewAddTodo = ({
    data,
    subject,
    isLoading,
}: {
    data: TodoResponse[] | NoteCommon[] | undefined
    subject: 'note' | 'todo'
    isLoading: boolean
}) => {
    return (
        <article className=" w-full  h-[200px] p-3 min-w-65 bg-white rounded-lg    ">
            <header className="flex justify-between items-center mb-4">
                <div className="flex justify-center items-center gap-2">
                    <Image src={'/dashboard/todo-recently.svg'} alt="최근 등록한 할일" width={40} height={40} />

                    <span className="text-title-base font-semibold">
                        {subject === 'todo' ? '최근 등록한 할 일' : '최근 등록한 노트'}
                    </span>
                </div>
                <Link
                    href={subject === 'todo' ? './todos' : './notes'}
                    className="text-subBody-sm font-medium flex items-center"
                >
                    모두보기
                    <Image src="/goals/ic-arrow-right.svg" alt="노트보기 페이지 이동" width={24} height={24} />
                </Link>
            </header>
            {data && data.length > 0 ? (
                <ul className=" list-none space-y-0.5 h-[130px] ">
                    {data?.map((item) => (
                        <li
                            key={item.id}
                            className="flex w-full h-auto text-body-sm text-custom_slate-700 hover:opacity-70"
                        >
                            <Link href={`/goals/${item.goal.id}`} className="w-full flex">
                                <span className="mr-2 text-body-base ">・</span>

                                <p className="overflow-ellipsis whitespace-nowrap truncate">{item.title}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : isLoading ? (
                <NewAddtodoSkeleton />
            ) : (
                <div className="flex h-[100px] w-full text-sm justify-center items-center">
                    최근 등록한 일이 없습니다.
                </div>
            )}
        </article>
    )
}

export default NewAddTodo
