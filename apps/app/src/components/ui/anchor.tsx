import type { LinkProps } from 'next/link'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { ButtonProps } from './button'
import { Button } from './button'

export interface AnchorProps extends LinkProps {
  target?: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  iconRight?: ButtonProps['iconRight']
  iconLeft?: ButtonProps['iconLeft']
  children?: ReactNode
}

export const Anchor = ({
  href,
  size = 'default',
  variant = 'link',
  target = '_blank',
  iconLeft,
  iconRight,
  children,
  ...props
}: AnchorProps) => {
  if (href === '#') {
    return (
      <Button
        variant={variant}
        size={size}
        iconLeft={iconLeft}
        iconRight={iconRight}
      >
        {children}
      </Button>
    )
  }

  return (
    <Link href={href} target={target} rel="noopener noreferrer" {...props}>
      <Button
        variant={variant}
        size={size}
        iconLeft={iconLeft}
        iconRight={iconRight}
      >
        {children}
      </Button>
    </Link>
  )
}
