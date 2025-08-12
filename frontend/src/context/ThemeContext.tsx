import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Get saved theme from localStorage or use system preference, default to light
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme
        }

        // Check for system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark'
        }

        return 'light'
    })

    // Toggle between light and dark
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
    }

    // Update localStorage and document class when theme changes
    useEffect(() => {
        localStorage.setItem('theme', theme)
        document.documentElement.setAttribute('data-theme', theme)

        // Add or remove dark class to html element for Tailwind dark mode
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
