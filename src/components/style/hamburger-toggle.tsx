'use client'

import React from 'react'

const HamburgerToggle = ({group}: {group: boolean | 'noState'}) => {
    return (
        <div className=" w-full h-full flex flex-col justify-center items-center gap-1  ">
            <span
                className={`
          block w-1/2 h-[2px] bg-black rounded transition-all duration-300 origin
          ${group === true ? 'translate-y-[9px] rotate-45' : 'translate-y-0 rotate-0'}
        `}
            />

            {/* 중간 바 */}
            <span
                className={`
          block w-1/2 h-[2px] bg-black rounded transition-opacity duration-300
          ${group === true ? 'opacity-0' : 'opacity-100'}
        `}
            />
            {/* 하단 바 */}
            <span
                className={`
          block w-1/2 h-[2px] bg-black rounded transition-all duration-300
          ${group === true ? '-translate-y-[3px] -rotate-45' : 'translate-y-0 rotate-0'}
        `}
            />
        </div>
    )
}
export default HamburgerToggle
