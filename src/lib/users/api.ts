import {get} from '@/lib/common-api'

import type {UserType} from '@/types/user'

// 유저 정보
export const getProfile = async (): Promise<UserType> => {
    const response = await get<UserType>({endpoint: `user`})
    return response.data
}
