import { useState, useEffect } from 'react';

const accentColors = [
    { name: 'cyan', value: '#3DF5E0', glow: 'rgba(61, 245, 224, 0.4)' },
    { name: 'purple', value: '#C77DFF', glow: 'rgba(199, 125, 255, 0.4)' },
    { name: 'pink', value: '#FF006E', glow: 'rgba(255, 0, 110, 0.4)' },
    { name: 'green', value: '#39FF14', glow: 'rgba(57, 255, 20, 0.4)' },
    { name: 'orange', value: '#FF6B35', glow: 'rgba(255, 107, 53, 0.4)' },
    { name: 'blue', value: '#00D9FF', glow: 'rgba(0, 217, 255, 0.4)' },
];

export default function ThemeCustomizer() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [accentColor, setAccentColor] = useState(accentColors[0]);

    useEffect(() => {
        // Load preferences from localStorage
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        const savedAccent = localStorage.getItem('accentColor');

        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        if (savedAccent) {
            const accent = accentColors.find(c => c.value === savedAccent) || accentColors[0];
            setAccentColor(accent);
            document.documentElement.style.setProperty('--accent-color', accent.value);
            document.documentElement.style.setProperty('--accent-glow', accent.glow);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const changeAccentColor = (color: typeof accentColors[0]) => {
        setAccentColor(color);
        document.documentElement.style.setProperty('--accent-color', color.value);
        document.documentElement.style.setProperty('--accent-glow', color.glow);
        localStorage.setItem('accentColor', color.value);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-text-secondary hover:text-accent transition-colors"
                aria-label="Theme settings"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m9.66-9.66l-4.24 4.24M10.58 13.42l-4.24 4.24M23 12h-6m-6 0H1m20.66 9.66l-4.24-4.24M10.58 10.58l-4.24-4.24" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-2xl z-50 p-4">
                        <h3 className="text-sm font-bold text-text-primary mb-4 font-mono">
                            theme_settings
                        </h3>

                        {/* Theme Toggle */}
                        <div className="mb-4">
                            <label className="text-xs text-text-secondary font-mono mb-2 block">
                                mode
                            </label>
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center justify-between px-3 py-2 bg-bg border border-border rounded hover:border-accent transition-colors"
                            >
                                <span className="text-sm font-mono text-text-primary">
                                    {theme === 'dark' ? '🌙 dark' : '☀️ light'}
                                </span>
                                <span className="text-xs text-text-secondary font-mono">
                                    toggle
                                </span>
                            </button>
                        </div>

                        {/* Accent Color Picker */}
                        <div>
                            <label className="text-xs text-text-secondary font-mono mb-2 block">
                                accent_color
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {accentColors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => changeAccentColor(color)}
                                        className={`aspect-square rounded border-2 transition-all hover:scale-110 ${accentColor.value === color.value
                                                ? 'border-white shadow-lg'
                                                : 'border-border'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                        aria-label={`Set accent color to ${color.name}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs text-text-secondary font-mono">
                                preferences saved locally
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

