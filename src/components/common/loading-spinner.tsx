const LoadingSpinner = () => {
    return (
        <div className="z-30 flex items-center justify-center pointer-events-none w-full h-full">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
    )
}

export default LoadingSpinner
