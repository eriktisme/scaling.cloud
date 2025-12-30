import { ReactNode } from 'react'
import Link from 'next/link'
import { GalleryVerticalEnd } from 'lucide-react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center py-24">
      <Link
        href="/"
        className="focus-visible:shadow-xs-selected mb-8 inline-flex font-medium focus:outline-none"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md">
          <GalleryVerticalEnd className="size-4" />
        </div>
        Scaling
      </Link>
      {children}
    </div>
  )
}
