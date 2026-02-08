import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props extends PropsWithChildren {
  title?: ReactNode
  titleAction?: ReactNode
  titleClassName?: HTMLAttributes<HTMLDivElement>['className']
  containerClassName?: HTMLAttributes<HTMLDivElement>['className']
  description?: string
}

export const PageTemplate = (props: Props) => {
  return (
    <div
      className="flex-1 touch-pan-y overflow-y-scroll overscroll-contain"
      style={{
        scrollbarGutter: 'stable',
      }}
    >
      <div className={cn('mx-auto w-full max-w-4xl', props.containerClassName)}>
        <div className="flex flex-col gap-4 py-4 md:py-8 md:gap-6">
          {props.title ? (
            <header className="w-full flex flex-col gap-2 md:gap-4 px-4 md:px-0">
              <div
                className={cn(
                  'flex flex-wrap items-center gap-4',
                  props.titleClassName
                )}
              >
                {typeof props.title === 'string' ? (
                  <h1 className="truncate text-2xl font-medium tracking-tight">
                    {props.title}
                  </h1>
                ) : (
                  props.title
                )}
                {props.titleAction}
              </div>
              {props.description ? (
                <p className="mb-2 truncate text-base text-neutral-900">
                  {props.description}
                </p>
              ) : null}
            </header>
          ) : null}
          <div className="w-full flex flex-col gap-4 md:gap-6 px-4 md:px-0">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  )
}
