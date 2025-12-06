'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import id from '@/lib/translations/id';
import en from '@/lib/translations/en';

const translations = { id, en };

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLanguage = 'en' }) {
    const [language, setLanguage] = useState(initialLanguage);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load user language on mount
    useEffect(() => {
        const loadUserLanguage = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const user = await res.json();
                    if (user.language) {
                        setLanguage(user.language);
                    }
                }
            } catch (error) {
                console.error('Failed to load user language:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadUserLanguage();
    }, []);

    // Translation function
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English if key not found
                let fallback = translations['en'];
                for (const fk of keys) {
                    if (fallback && fallback[fk]) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key if not found in any language
                    }
                }
                return fallback;
            }
        }
        return value;
    };

    // Change language and save to database
    const changeLanguage = async (newLanguage) => {
        setLanguage(newLanguage);

        try {
            await fetch('/api/user/language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: newLanguage })
            });
        } catch (error) {
            console.error('Failed to save language preference:', error);
        }
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage: changeLanguage,
            t,
            isLoaded
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
