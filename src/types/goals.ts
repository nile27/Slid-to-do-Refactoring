export interface Goal {
    id: number
    title: string
}

/**단일 목표 응답 */
export interface GoalResponse extends Goal {
    linkUrl: string
    content: string
    teamId: string
    userId: number
    createdAt: string
    updatedAt: string
}

/**단일 목표 달성률 응답 */
export interface GoalProgress {
    progress: number
}

export interface GoalsListResponse {
    goals: GoalResponse[]
    totalCount: number
    nextCursor: number
}

// 무한스크롤 리스트
export interface GoalsAllListResponse {
    data: GoalResponse[]
    totalCount: number
    nextCursor: number
}
