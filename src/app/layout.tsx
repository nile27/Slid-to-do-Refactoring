import {pretendard} from '@/font/pretendard-variable'

import ModalProvider from './providers/modal-provider'
import QueryProvider from './providers/query-provider'
import TimerProvider from './providers/timer-provider'
import ToastProvider from './providers/toast-provider'

import 'react-toastify/dist/ReactToastify.css'

import 'highlight.js/styles/atom-one-dark.css'

import type {Metadata} from 'next'

import './globals.css'

export const metadata: Metadata = {
    title: {
        template: '%s | Slid-to-do',
        default: 'Slid-to-do',
    },
    description: 'Slid-to-do',
    icons: {
        icon: '/ic-favicon.svg',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${pretendard.variable} antialiased`}>
                <QueryProvider>
                    {children}
                    <ModalProvider />
                    <ToastProvider />
                    <TimerProvider />
                </QueryProvider>
            </body>
        </html>
    )
}
