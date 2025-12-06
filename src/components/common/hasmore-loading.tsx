export const HasmoreLoading = ({ref}: {ref: (node?: Element | null) => void}) => {
    return (
        <>
            <div ref={ref} style={{height: '1px'}} />
            <div className="z-30 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
        </>
    )
}
