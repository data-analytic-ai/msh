'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useState, useEffect } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

import type { Theme } from './types'

import { useTheme } from '..'
import { themeLocalStorageKey } from './types'

/**
 * ThemeSelector - Theme switching component
 *
 * Allows users to switch between light, dark, and auto (system preference) themes.
 * Persists the selected theme in localStorage and updates the UI accordingly.
 *
 * @returns {JSX.Element} - The rendered theme selector component
 */
export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [value, setValue] = useState<string>('auto')
  const [isInitialized, setIsInitialized] = useState(false)

  // Inicializar el valor del selector basado en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const preference = window.localStorage.getItem(themeLocalStorageKey)
      setValue(preference ?? 'auto')
      setIsInitialized(true)
    }
  }, [])

  const onThemeChange = (themeToSet: Theme & 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
    } else {
      setTheme(themeToSet)
    }
    setValue(themeToSet)
  }

  // Solo renderizar cuando ya se ha inicializado el valor
  if (!isInitialized) {
    return null
  }

  return (
    <Select onValueChange={onThemeChange} value={value} defaultValue={value}>
      <SelectTrigger
        aria-label="Select a theme"
        className=" bg-background text-foreground gap-2 pl-0 md:pl-3 border-none hover:bg-secondary/50 rounded-md"
      >
        <span className="text-foreground hidden md:inline">Theme</span>
        {value === 'light' && <Sun className="h-4 w-4" />}
        {value === 'dark' && <Moon className="h-4 w-4" />}
        {value === 'auto' && <Monitor className="h-4 w-4" />}
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        <SelectItem value="auto" className="flex items-center whitespace-nowrap">
          <Monitor className="h-4 w-4 mr-2 inline-flex" />
          <span className="inline-block">Auto</span>
        </SelectItem>
        <SelectItem value="light" className="flex items-center whitespace-nowrap">
          <Sun className="h-4 w-4 mr-2 inline-flex" />
          <span className="inline-block">Light</span>
        </SelectItem>
        <SelectItem value="dark" className="flex items-center whitespace-nowrap">
          <Moon className="h-4 w-4 mr-2 inline-flex" />
          <span className="inline-block">Dark</span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
