import Link from 'next/link'
import { GalleryVerticalEnd } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const LandingPage = () => {
  return (
    <>
      <header className="sticky top-0 isolate z-40">
        <div className="flex w-full items-center px-6 h-14 mx-auto justify-between max-w-6xl lg:px-0">
          <div>
            <Link
              aria-label="Home"
              href="/"
              className="flex shrink-0 items-center gap-2.5"
            >
              <GalleryVerticalEnd className="size-4" />
              <span>Scaling</span>
            </Link>
          </div>
          <nav className="flex items-center gap-2.5">
            <Link href="/sign-in">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="w-full mx-auto px-6 max-w-6xl lg:px-0">
        <div>
          <div className="text-center pb-20 pt-32">
            <h1 className="text-balance text-3xl/9 font-bold tracking-tight text-stone-950 md:font-bold lg:text-6xl">
              Subscription Analytics
            </h1>
            <p className="mx-auto mt-4 max-w-md text-pretty text-base/6 text-stone-600 sm:max-w-2xl sm:text-lg">
              Connect your billing provider and get insights on your finances.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
