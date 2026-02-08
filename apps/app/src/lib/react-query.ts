/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DefaultOptions, UseMutationOptions } from '@tanstack/react-query'

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
  Awaited<ReturnType<FnType>>

export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>

export const queryConfig = {
  queries: {
    staleTime: 1000 * 120, // 120 seconds
  },
} satisfies DefaultOptions

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>
