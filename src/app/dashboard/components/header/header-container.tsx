'use client'

import React from 'react'

import {useCustomQuery} from '@/hooks/use-custom-query'
import {notes, todos} from '@/lib/query-keys'

import FocusTimer from './focus-timer'
import NewAddTodo from './new-addtodo'

import type {NoteListResponse} from '@/types/notes'
import type {TodoListDetailResponse} from '@/types/todos'

const Header = () => {
    const {data: todoData, isLoading: todoLoading} = useCustomQuery<TodoListDetailResponse>(
        todos.newTodo().queryKey,
        todos.newTodo().queryFn,
        {
            select: (data: TodoListDetailResponse): TodoListDetailResponse => ({
                totalCount: data.todos.length,
                nextCursor: data.nextCursor,
                todos: data.todos
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .filter((item) => !item.done)
                    .slice(0, 5),
            }),
        },
    )

    const {data: noteData, isLoading: noteLoding} = useCustomQuery<NoteListResponse>(
        notes.newNotes().queryKey,
        notes.newNotes().queryFn,
        {
            select: (data: NoteListResponse): NoteListResponse => ({
                totalCount: data.notes.length,
                nextCursor: data.nextCursor,
                notes: data.notes
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5),
            }),
        },
    )

    return (
        <header className="w-full  h-auto min-w-[200px]   flex-col mb-4  flex justify-start items-start gap-4">
            <NewAddTodo data={todoData?.todos} subject="todo" isLoading={todoLoading} />
            <NewAddTodo data={noteData?.notes} subject="note" isLoading={noteLoding} />
            <FocusTimer />
        </header>
    )
}

export default Header
