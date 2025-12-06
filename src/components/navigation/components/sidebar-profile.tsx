'use client '

import Image from 'next/image'
import {useRouter} from 'next/navigation'
import React from 'react'

import axios from 'axios'

import {useCustomQuery} from '@/hooks/use-custom-query'
import useToast from '@/hooks/use-toast'
import {users} from '@/lib/query-keys'

import type {UserType} from '@/types/user'

// 로고 및 유저 정보 Component
const SidebarProfile = () => {
    const router = useRouter()
    const {showToast} = useToast()
    const {data: userData} = useCustomQuery<UserType>(users.user().queryKey, users.user().queryFn, {
        errorDisplayType: 'toast',
        mapErrorMessage: (error) => {
            const typedError = error as {message?: string; response?: {data?: {message?: string}}}

            if (axios.isAxiosError(error)) {
                return error.response?.data.message || '서버 오류가 발생했습니다.'
            }

            return typedError.message || '알 수 없는 오류가 발생했습니다.'
        },
    })
    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout', {
                withCredentials: true,
            })

            router.push('/login')
            showToast('로그아웃이 되었습니다.', {type: 'success'})
        } catch {
            showToast('로그아웃에 실패했습니다.', {type: 'error'})
        }
    }

    return (
        <div className=" flex flex-col w-full h-auto gap-5 mb-2 justify-between items-center border-t-1 border-custom_slate-300 py-2">
            <div className="flex w-full h-auto gap-3  justify-between items-center">
                <Image
                    src={'/sidebar/profile.svg'}
                    alt="profile"
                    width={24}
                    height={24}
                    className=" w-13 h-13 p-2 rounded-full mobile:w-5 mobile:h-5 mobile:p-0"
                />
                <div className="w-full h-auto mobile:flex mobile: justify-between mobile:items-end">
                    <div className="flex flex-col">
                        <p className="text-sm font-medium overflow-x-hidden w-full truncate">{userData?.name}</p>
                        <p className="text-sm font-medium overflow-x-hidden w-full truncate">{userData?.email}</p>
                    </div>
                </div>
            </div>

            <button
                className=" flex rounded-sm px-5 gap-4 text-[16px] font-extrabold w-full py-2 hover:bg-custom_slate-800 text-center text-white bg-custom_slate-600 hover:underline"
                onClick={handleLogout}
            >
                <Image src={'/sidebar/logout.svg'} alt="logout" width={24} height={24} />
                Logout
            </button>
        </div>
    )
}

export default SidebarProfile
