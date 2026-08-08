import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-[#16191d] border-t border-base-300 py-4 mt-auto z-10 print:hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="flex-1 text-center sm:text-left order-3 sm:order-1">
          <Link to="/contact" className="text-sm font-medium text-base-content/50 hover:text-indigo-400 transition-colors">İletişim</Link>
        </div>

        <div className="flex-1 text-center text-sm font-medium text-base-content/50 order-1 sm:order-2">
          made by <span className="text-indigo-500 font-black tracking-wide">m3rt</span>
        </div>

        <div className="flex-1 flex justify-center sm:justify-end order-2 sm:order-3">
          <a
            href="https://instagram.com/merutou"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-base-content/50 hover:text-pink-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span className="text-sm font-semibold tracking-wide">@merutou</span>
          </a>
        </div>
        
      </div>
    </footer>
  );
}