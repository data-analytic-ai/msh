/**
 * UserProfileCard - User profile information display and editing component
 *
 * Shows user profile information with auto-populated data indicator
 * and allows inline editing of profile fields. Integrates with the
 * user profile management system.
 *
 * @param {UserProfileCardProps} props - Component props
 * @returns {JSX.Element} - User profile card component
 */
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Edit3, Check, X, Mail, Phone, RefreshCw, Info } from 'lucide-react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useAuth } from '@/providers/AuthProvider'

export interface UserProfileCardProps {
  showEditActions?: boolean
  compact?: boolean
  className?: string
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  showEditActions = true,
  compact = false,
  className = '',
}) => {
  const { user } = useAuth()
  const {
    profileData,
    isLoading,
    error,
    hasBeenAutoPopulated,
    updateProfile,
    autoPopulateFromLastRequest,
  } = useUserProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  })

  // Initialize edit data when entering edit mode
  const handleStartEdit = () => {
    if (profileData) {
      setEditedData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      })
      setIsEditing(true)
    }
  }

  // Save profile changes
  const handleSaveEdit = async () => {
    if (!profileData) return

    setIsSaving(true)
    try {
      const success = await updateProfile(editedData)
      if (success) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedData({
      firstName: '',
      lastName: '',
      phone: '',
    })
  }

  // Manually trigger auto-population
  const handleAutoPopulate = async () => {
    await autoPopulateFromLastRequest()
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="text-sm text-muted-foreground">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-sm text-red-600 dark:text-red-400">
            Error loading profile: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profileData) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <User className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium">Profile not available</p>
              <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {!compact && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>

            {hasBeenAutoPopulated && (
              <Badge variant="secondary" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                Auto-filled
              </Badge>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="space-y-4">
          {/* Auto-population status */}
          {hasBeenAutoPopulated && !compact && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Information auto-filled
                  </p>
                  <p className="text-blue-600 dark:text-blue-300">
                    We've pre-filled your information from your last service request. You can edit
                    it if needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile fields */}
          <div className="grid gap-4">
            {/* First Name */}
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={editedData.firstName}
                  onChange={(e) =>
                    setEditedData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">
                  {profileData.firstName || 'Not provided'}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={editedData.lastName}
                  onChange={(e) =>
                    setEditedData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">
                  {profileData.lastName || 'Not provided'}
                </p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-3 w-3" />
                Email
              </Label>
              <p className="text-sm py-2 px-3 bg-muted rounded-md text-muted-foreground">
                {profileData.email}
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-3 w-3" />
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={editedData.phone}
                  onChange={(e) =>
                    setEditedData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">
                  {profileData.phone || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {showEditActions && (
            <div className="flex items-center gap-2 pt-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSaveEdit} disabled={isSaving} className="flex-1">
                    {isSaving ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={handleStartEdit} className="flex-1">
                    <Edit3 className="h-3 w-3 mr-2" />
                    Edit Profile
                  </Button>

                  {!hasBeenAutoPopulated && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleAutoPopulate}
                      title="Auto-fill from last request"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
