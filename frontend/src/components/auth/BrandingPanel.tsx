import { Leaf } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logoLeafnote from '../../assets/images/logo-leafnote.png'

export default function BrandingPanel() {
  const { t } = useTranslation()

  return (
    <div className="hidden sm:flex relative flex-col items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 overflow-hidden">
      {/* Decorative floating leaves */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[20%] w-8 h-8 text-white/10 animate-float">
          <Leaf className="w-full h-full" />
        </div>
        <div className="absolute top-[60%] left-[70%] w-6 h-6 text-white/10 animate-float" style={{ animationDelay: '2s' }}>
          <Leaf className="w-full h-full" />
        </div>
        <div className="absolute top-[30%] left-[80%] w-10 h-10 text-white/10 animate-float" style={{ animationDelay: '4s' }}>
          <Leaf className="w-full h-full" />
        </div>
        <div className="absolute top-[75%] left-[15%] w-5 h-5 text-white/10 animate-float" style={{ animationDelay: '1s' }}>
          <Leaf className="w-full h-full" />
        </div>
      </div>

      {/* Logo + tagline */}
      <div className="relative z-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <img src={logoLeafnote} alt="Leafnote" className="w-8 h-8 object-contain" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
          </div>
          <span className="font-serif text-3xl font-semibold text-white tracking-tight">
            Leafnote
          </span>
        </div>
        <p className="font-serif text-lg text-white/80 italic">
          {t('auth.branding.tagline')}
        </p>
      </div>
    </div>
  )
}
