import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Engine from '@/components/Engine';
import CTA from '@/components/CTA';

export default function Home() {
  return (
    <main className="bg-white min-h-screen">
      <Navigation />
      <Hero />
      <Engine />
      <CTA />
      
      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                  AIClips
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Transform raw footage into viral-ready clips with AI-powered clipping, framing, and captions.
              </p>
            </div>
            
            {/* Links */}
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API', 'Integrations'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Terms'] },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold text-slate-900 mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Bottom */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © 2026 AIClips. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'YouTube'].map((item, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
