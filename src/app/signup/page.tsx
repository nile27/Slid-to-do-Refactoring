'use client'

import Image from 'next/image'
import {useRouter} from 'next/navigation'

import {useForm} from 'react-hook-form'

import InputForm from '@/components/common/input-form'
import {useCustomMutation} from '@/hooks/use-custom-mutation'
import useToast from '@/hooks/use-toast'
import {signupApi} from '@/lib/auth/signup-api'

import type {ApiError} from '@/types/api'
import type {SignupFormData} from '@/types/signup'

const SignPage = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: {errors},
        setError,
    } = useForm<SignupFormData>()

    const password = watch('password')
    const router = useRouter()

    const {showToast} = useToast()

    const {mutate: signup, isPending: loading} = useCustomMutation<void, ApiError, SignupFormData>(signupApi, {
        errorDisplayType: 'form',
        setError,
        onValidationError: (error) => {
            if (error.status === 400 || error.status === 404 || error.status === 409) {
                return [{name: 'email', message: error.message}]
            }
            return []
        },
        onSuccess: () => {
            showToast('회원가입이 완료되었습니다!', {type: 'success'})
            router.push('/')
        },
    })

    return (
        <div className="flex items-center justify-center desktop:flex-row flex-col desktop-layout mx-auto gap-2 desktop:gap-12 min-h-screen">
            <div className="mobile:mt-4">
                <div className="flex flex-col desktop:items-start items-center">
                    <div className="flex items-center gap-2 text-4xl font-bold">
                        <Image src="/common/icon-todo-check.svg" alt="check" width={28} height={28} />
                        Slid <span className="text-custom_blue-500">to-do</span>
                    </div>
                    <div className="desktop:hidden mt-2 text-xl font-medium text-gray-700">
                        하루를 계획하고, 성취하는 습관💪
                    </div>

                    <div className="mt-2 text-gray-500 desktop:text-gray-700 text-base desktop:text-lg ">
                        당신만의 스마트한 할 일 관리 웹앱
                    </div>
                </div>
                <Image src="/common/login-cover.svg" alt="로그인 커버" width={400} height={400} />
            </div>
            <div className="desktop:w-[500px] w-full desktop:p-6 py-6 px-2 border border-gray-200 rounded-4xl">
                <InputForm<SignupFormData>
                    onSubmit={(data) => signup(data)}
                    handleSubmit={handleSubmit}
                    register={register}
                    errors={errors}
                    isLoading={loading}
                    validationRules={{
                        name: {
                            required: '이름은 필수입니다.',
                        },
                        email: {
                            required: '이메일은 필수입니다.',
                            pattern: {
                                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                message: '이메일 형식이 올바르지 않습니다.',
                            },
                        },
                        password: {
                            required: '비밀번호는 필수입니다.',
                            minLength: {
                                value: 8,
                                message: '비밀번호는 최소 8자 이상이어야 합니다.',
                            },
                        },
                        confirmPassword: {
                            required: '비밀번호 확인은 필수입니다.',
                            validate: (value: string) => value === password || '비밀번호가 일치하지 않습니다.',
                        },
                    }}
                    fields={[
                        {name: 'name', label: '이름', type: 'text', placeholder: '이름을 입력해주세요'},
                        {name: 'email', label: '이메일', type: 'text', placeholder: '이메일을 입력해주세요'},
                        {name: 'password', label: '비밀번호', type: 'password', placeholder: '비밀번호를 입력해주세요'},
                        {
                            name: 'confirmPassword',
                            label: '비밀번호 확인',
                            type: 'password',
                            placeholder: '비밀번호를 다시 입력해주세요',
                        },
                    ]}
                    submitText={loading ? '가입 중...' : '회원가입하기'}
                    bottomText="이미 회원이신가요?"
                    bottomLink={{href: '/login', text: '로그인'}}
                />
            </div>
        </div>
    )
}

export default SignPage
