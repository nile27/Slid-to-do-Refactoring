export const handleChange = (setValue: (v: number) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replaceAll(/\D/g, '')
    if (!digits) {
        setValue(0)
        return
    }

    const lastTwo = digits.slice(-2)
    const parsed = Number.parseInt(lastTwo, 10)

    if (parsed > 59) {
        // 범위를 넘으면 마지막 한 자리만 반영
        const lastOne = lastTwo.slice(-1)
        setValue(Number.parseInt(lastOne, 10))
    } else {
        setValue(parsed)
    }
}
