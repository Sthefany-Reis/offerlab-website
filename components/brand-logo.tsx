import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * OfferLab brand mark — the transparent flask + chart icon. Pairs with a text
 * wordmark in compact placements like the header and dashboard nav.
 */
export function BrandMark({
  className,
  size = 32,
  priority = false,
}: {
  className?: string
  size?: number
  priority?: boolean
}) {
  return (
    <Image
      src="/offerlab-mark.png"
      alt="OfferLab logo"
      width={size}
      height={size}
      priority={priority}
      className={cn('object-contain', className)}
    />
  )
}

/**
 * Full OfferLab lockup (mark + wordmark + tagline) on a white rounded chip so
 * the light-background artwork stays crisp against the dark theme. Used where
 * there's room to breathe, like the auth screens.
 */
export function BrandLockup({
  className,
  size = 200,
  priority = false,
}: {
  className?: string
  size?: number
  priority?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-grid place-items-center overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-black/5 shadow-sm',
        className,
      )}
    >
      <Image
        src="/offerlab-logo.png"
        alt="OfferLab — Experiment. Optimize. Land your next offer."
        width={size}
        height={size}
        priority={priority}
        className="h-auto w-full object-contain"
      />
    </span>
  )
}
