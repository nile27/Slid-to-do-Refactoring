import React from 'react'

import Sidebar from '@/components/navigation/sidebar-container'

export const metadata = {
    title: 'DashBoard',
}

const layout = ({
    children,
}: Readonly<{
    children: React.ReactNode
}>) => {
    return (
        <main className="flex  w-screen h-screen   mobile:flex-col  bg-custom_slate-100    ">
            <Sidebar />
            {children}
        </main>
    )
}

export default layout
