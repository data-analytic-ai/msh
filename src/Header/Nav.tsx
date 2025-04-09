'use client'

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import type { Header } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { useServiceRequest } from '@/context/ServiceRequestContext'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { getMe } from '@/lib/auth'

export const HeaderNav: React.FC<{ data: Header; isMobile?: boolean }> = ({
  data,
  isMobile = false,
}) => {
  const navItems = data?.navItems || []
  const { isAuthenticated, logout } = useServiceRequest()
  const [userName, setUserName] = useState<string | null>(null)

  // Fetch user details if authenticated
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated) {
        try {
          // Usar getMe para obtener detalles del usuario en vez de hacer una nueva petición
          // Ya que getMe está cacheado, esto evita peticiones adicionales
          const { user } = await getMe()
          if (user) {
            setUserName(user.name)
          }
        } catch (error) {
          console.error('Failed to fetch user details:', error)
        }
      } else {
        // Si no está autenticado, limpiar el nombre
        setUserName(null)
      }
    }

    fetchUserDetails()
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    // Redirect to home page or refresh
    window.location.href = '/'
  }

  return (
    <nav className={isMobile ? 'flex flex-col items-center gap-6' : 'flex items-center gap-4'}>
      <div className={`flex ${isMobile ? 'flex-col items-center gap-6' : 'items-center gap-4'}`}>
        {navItems.map(({ link }, i) => {
          return (
            <CMSLink
              className={`font-medium ${isMobile ? 'text-xl' : 'text-sm'} hover:opacity-80 transition-opacity`}
              key={i}
              {...link}
            />
          )
        })}
      </div>

      <div className={isMobile ? 'mt-6' : ''}>
        <ThemeSelector />
      </div>

      {isAuthenticated ? (
        <div className={`flex items-center gap-2 ${isMobile ? 'mt-6 flex-col w-full' : ''}`}>
          <div className="flex items-center gap-1 text-sm font-medium">
            <User size={16} />
            <span>Hi, {userName || 'User'}</span>
          </div>

          <Button
            className={`${isMobile ? 'mt-2 text-base w-full' : 'text-sm'} font-medium`}
            onClick={handleLogout}
            size="sm"
            variant="outline"
          >
            <LogOut size={16} className="mr-1" />
            Logout
          </Button>
        </div>
      ) : (
        <div className={`flex items-center gap-2 ${isMobile ? 'mt-6 flex-col w-full' : ''}`}>
          <Link href="/login" className="w-full">
            <Button
              className={`${isMobile ? 'text-base w-full' : 'text-sm'} font-medium`}
              size="sm"
              variant="outline"
            >
              Login
            </Button>
          </Link>

          <Link href="/register" className="w-full">
            <Button
              className={`${isMobile ? 'mt-2 text-base w-full' : 'text-sm'} font-medium`}
              size="sm"
            >
              Register
            </Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
