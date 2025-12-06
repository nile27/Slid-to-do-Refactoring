import {clsx, type ClassValue} from 'clsx'
import {twMerge} from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs))
}

export const dateformat = (createAt?: string): string => {
    if (!createAt) return ''

    const dateObject = new Date(createAt)

    const year = dateObject.getFullYear()
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0')
    const date = dateObject.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${date}`
}
