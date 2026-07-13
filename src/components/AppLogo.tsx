import type { ComponentPropsWithoutRef } from 'react'

type AppLogoProps = ComponentPropsWithoutRef<'div'> & {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showWordmark?: boolean
}

const sizeClasses = {
  sm: 'h-8 w-8 rounded-xl',
  md: 'h-10 w-10 rounded-2xl',
  lg: 'h-11 w-11 rounded-2xl',
  xl: 'h-[72px] w-[72px] rounded-3xl',
}

const wordmarkClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-lg',
  xl: 'text-xl',
}

export default function AppLogo({
  size = 'md',
  showWordmark = false,
  className = '',
  ...props
}: AppLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} {...props}>
      <div
        className={`${sizeClasses[size]} relative shrink-0 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 shadow-lg shadow-blue-600/20`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full"
          fill="none"
          role="img"
        >
          <path
            d="M18 12h20l10 10v30H18V12Z"
            fill="white"
            fillOpacity="0.94"
          />
          <path d="M38 12v11h10" fill="#DBEAFE" />
          <path
            d="M24 43c3.1-8.7 5.9-17.2 8-22 2.1 4.8 4.9 13.3 8 22"
            stroke="#2563EB"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27.4 35.5h9.2"
            stroke="#14B8A6"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <circle cx="24" cy="18" r="2.7" fill="#14B8A6" />
          <circle cx="31.5" cy="16.5" r="2.2" fill="#60A5FA" />
          <path
            d="M11 46c5 4.7 11.6 7.3 20.3 7.3 8.1 0 15-2.4 21.1-7.3"
            stroke="white"
            strokeOpacity="0.5"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-x-2 top-1 h-8 rounded-full bg-white/18 blur-md" />
      </div>
      {showWordmark && (
        <span className={`${wordmarkClasses[size]} font-black tracking-tight text-zinc-900 dark:text-white`}>
          AlifboAI
        </span>
      )}
    </div>
  )
}
