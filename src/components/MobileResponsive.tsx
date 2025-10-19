import React from 'react'

interface MobileResponsiveProps {
  children: React.ReactNode
}

/**
 * Mobile Responsive Wrapper Component
 * Ensures mobile-first design compliance
 * 
 * Constitutional Compliance:
 * - Article IV: Technical & Architectural Mandates (Mobile-first)
 */

const MobileResponsive: React.FC<MobileResponsiveProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      {/* Mobile-first responsive container */}
      <div className="w-full max-w-full overflow-x-hidden">
        {children}
      </div>
      
      {/* Mobile-specific optimizations */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-optimized {
            padding: 1rem;
            font-size: 14px;
          }
          
          .mobile-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        
        @media (min-width: 769px) {
          .desktop-enhanced {
            padding: 2rem;
            font-size: 16px;
          }
          
          .desktop-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
          }
        }
      `}</style>
    </div>
  )
}

export default MobileResponsive
