'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  // Avoid reading localStorage during initial render to prevent hydration mismatches
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
      const initialIsDark = saved === 'dark';
      setIsDark(initialIsDark);
      if (initialIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // no-op
    }
  }, []);

  // Keep document class and localStorage in sync when toggling
  useEffect(() => {
    if (!mounted) return;
    if (isDark) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
  }, [isDark, mounted]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Defer rendering until after mount to avoid className hydration warnings
  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleTheme}
        className="w-16 h-16 hidden bg-black/20 dark:bg-white/20 backdrop-blur-md border border-white/30 dark:border-black/30 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group"
        aria-label="Toggle theme"
      >
        <div className="relative w-8 h-8">
          {/* Sun icon */}
          <Sun
            className={`absolute inset-0 w-8 h-8 text-yellow-500 transition-all duration-500 transform ${
              isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          {/* Moon icon */}
          <Moon
            className={`absolute inset-0 w-8 h-8 text-blue-300 transition-all duration-500 transform ${
              isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </div>

        {/* Ripple effect on hover */}
        <div className="absolute inset-0 rounded-full bg-white/10 dark:bg-black/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default ThemeToggle;