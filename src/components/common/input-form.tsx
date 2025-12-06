'use client'

import React from 'react'

import clsx from 'clsx'

import ButtonStyle from '../style/button-style'
import InputStyle from '../style/input-style'

import type {InputFormProperties} from '@/types/login'

const InputForm = <T extends Record<string, unknown>>({
    fields,
    submitText,
    bottomText,
    bottomLink,
    register,
    errors,
    handleSubmit,
    onSubmit,
    validationRules,
    isLoading,
}: InputFormProperties<T>) => {
    return (
        <div className="flex flex-col items-center justify-center bg-white px-4">
            <div className="tablet:hidden mobile:hidden relative w-[260px] h-[48px] mb-2 text-center">
                <span className="text-lg font-semibold text-gray-800">하루를 계획하고, 성취하는 습관💪</span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl flex flex-col gap-6">
                {fields.map((field, index) => (
                    <div key={index} className="flex flex-col gap-1">
                        <label htmlFor={field.name} className="text-custom_slate-800 font-semibold">
                            {field.label}
                        </label>
                        <InputStyle
                            id={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            {...register(field.name, {
                                ...validationRules?.[field.name],
                                setValueAs: (v: string) => (typeof v === 'string' ? v.trim() : v),
                            })}
                            className={clsx('w-full', errors?.[field.name] && 'border border-red-500')}
                        />
                        {errors?.[field.name] && (
                            <span className="text-sm text-red-500 mt-1">{errors[field.name]?.message as string}</span>
                        )}
                    </div>
                ))}

                <ButtonStyle
                    type="submit"
                    size="full"
                    color="default"
                    disabled={isLoading}
                    aria-disabled={isLoading}
                    className="mt-6"
                >
                    {submitText}
                </ButtonStyle>
            </form>

            <div className="mt-6 text-sm text-custom_slate-800">
                {bottomText}{' '}
                <a href={bottomLink?.href} className="text-blue-500 underline">
                    {bottomLink?.text}
                </a>
            </div>
        </div>
    )
}

export default InputForm
