/**
 * UserProfileExample - Example component demonstrating user profile functionality
 *
 * This component shows how to integrate the user profile system with auto-population,
 * address management, and form integration. It serves as a reference implementation
 * for other developers working on similar features.
 *
 * @returns {JSX.Element} - Example component
 */
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserProfileCard } from '@/components/UserProfileCard'
import { UserAddressManager } from '@/components/UserAddressManager'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useAuth } from '@/providers/AuthProvider'
import { User, MapPin, RefreshCw, CheckCircle2, AlertCircle, Info } from 'lucide-react'

export const UserProfileExample: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const {
    profileData,
    hasBeenAutoPopulated,
    isLoading,
    error,
    autoPopulateFromLastRequest,
    getFormInitialValues,
  } = useUserProfile()

  const [showFormValues, setShowFormValues] = useState(false)

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Login Required</h3>
          <p className="text-muted-foreground">
            Please log in to see your profile information and saved addresses.
          </p>
        </CardContent>
      </Card>
    )
  }

  const formInitialValues = getFormInitialValues()

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile System Demo
            {hasBeenAutoPopulated && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Auto-populated
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <p className="text-sm">
                <strong>User:</strong> {user?.name || 'N/A'} ({user?.email})
              </p>
              <p className="text-sm">
                <strong>Auto-populated:</strong> {hasBeenAutoPopulated ? 'Yes' : 'No'}
              </p>
              <p className="text-sm">
                <strong>Saved Addresses:</strong> {profileData?.addresses?.length || 0}
              </p>
            </div>

            {!hasBeenAutoPopulated && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-blue-800 dark:text-blue-200 text-sm">
                  <p className="font-medium mb-1">Auto-population available</p>
                  <p>
                    Click the button below to auto-fill your profile from your last service request.
                    This will save time when filling out forms.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={autoPopulateFromLastRequest}
                    className="mt-2 border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Auto-populate Now
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <UserProfileCard />

      {/* Address Management */}
      {profileData && profileData.addresses.length > 0 && <UserAddressManager />}

      {/* Form Integration Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Form Integration Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This shows how the user profile system integrates with forms. When a user has
              auto-populated data, forms can be pre-filled with their information.
            </p>

            <Button variant="outline" onClick={() => setShowFormValues(!showFormValues)}>
              {showFormValues ? 'Hide' : 'Show'} Form Initial Values
            </Button>

            {showFormValues && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Generated Form Initial Values:</h4>
                <pre className="text-xs overflow-auto bg-background p-3 rounded border">
                  {JSON.stringify(formInitialValues, null, 2)}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  These values would be passed to a form component as defaultValues or
                  initialValues.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="grid gap-3">
            <div>
              <strong>Auto-population:</strong> Only happens once per user session. Data is pulled
              from the user&apos;s most recent service request and cached in sessionStorage.
            </div>
            <div>
              <strong>Address Management:</strong> Users can save multiple addresses from their
              service requests and reuse them. The system automatically extracts unique addresses.
            </div>
            <div>
              <strong>Form Integration:</strong> The getFormInitialValues() function provides
              formatted data ready to be used as form defaults, including proper field name mapping.
            </div>
            <div>
              <strong>Privacy:</strong> Auto-population only occurs for authenticated users and
              respects user preferences. All data remains client-side until explicitly submitted.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
