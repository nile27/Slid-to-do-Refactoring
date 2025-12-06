'use client'

import Image from 'next/image'
import Link from 'next/link'

type Menu = Record<string, string>

const GoalList = () => {
    const menuList: Menu[] = [
        {
            name: '대시 보드',
            href: '/',
            src: '/sidebar/ic-home.svg',
        },
        {
            name: '모든 노트 모아보기',
            href: '/notes',
            src: '/sidebar/document.svg',
        },
        {
            name: '할일 리스트',
            href: '/todos',
            src: '/sidebar/sidebar-todo.svg',
        },
        {
            name: '목표 리스트',
            href: '/goals',
            src: '/sidebar/sidebar-goal.svg',
        },
    ]

    return (
        <nav aria-labelledby="goals-heading" className=" border-[#E2E8F0]   flex flex-col mt-4  h-[300px] ">
            <p className=" border-b-1 border-custom_slate-300 p-2 pl-4 mb-2 text-body-base">Menu</p>

            <ul className="w-full h-auto  space-y-2.5">
                {menuList.map((item: Menu) => (
                    <Link
                        href={item.href}
                        key={item.name}
                        className="w-full items-center  hover:bg-custom_blue-100 h-[40px] flex gap-2 pl-2 py-1 rounded-sm group  "
                    >
                        <li className="w-full flex  gap-2 border-l-4 pl-2 border-transparent group-hover:border-l-4 group-hover:border-custom_blue-400 ">
                            <Image src={item.src} alt="image" width={26} height={26} />
                            <span className="w-full h-auto p-2">{item.name}</span>
                        </li>
                    </Link>
                ))}
            </ul>
        </nav>
    )
}

export default GoalList
