'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState({
        mode: 'light', // 'light', 'dark', 'system'
        glass: false,   // true, false
        accentColor: '#3B82F6'
    });

    useEffect(() => {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('theme_preference');
        if (savedTheme) {
            try {
                setTheme(JSON.parse(savedTheme));
            } catch (e) {
                console.error('Failed to parse theme preference', e);
            }
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'glass-mode');

        // Handle Mode - Always Light
        root.classList.add('light');

        // Handle Glass
        if (theme.glass) {
            root.classList.add('glass-mode');
        }

        // Handle Accent Color
        root.style.setProperty('--accent-color', theme.accentColor);

        localStorage.setItem('theme_preference', JSON.stringify(theme));
    }, [theme]);

    const updateTheme = (updates) => {
        setTheme(prev => ({ ...prev, ...updates }));
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
