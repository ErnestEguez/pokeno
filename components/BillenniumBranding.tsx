import Image from 'next/image'
import Link from 'next/link'

export function BillenniumBranding() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-3 px-4 mt-auto">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 flex-wrap">

        {/* Logo a colores */}
        <div className="flex-shrink-0">
          <Image
            src="/billennium.jpg"
            alt="Billennium System"
            width={44}
            height={44}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
            priority
          />
        </div>

        {/* Texto de contacto */}
        <div className="text-center sm:text-left leading-tight">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Desarrollado por
          </p>
          <p className="text-sm font-bold text-gray-800">Billennium System</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <Link
              href="https://www.billenniumsystem.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              www.billenniumsystem.com
            </Link>
            <span className="text-xs text-gray-400">·</span>
            <a
              href="tel:+593980136389"
              className="text-xs text-gray-500 hover:text-blue-600 transition"
            >
              +593 980 136 389
            </a>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">Guayaquil — Ecuador</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
