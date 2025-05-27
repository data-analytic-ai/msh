'use client'

/**
 * CompletionPage - Página de finalización del servicio
 *
 * Muestra opciones al cliente después de completar un servicio:
 * - Calificar al contratista
 * - Ver recibo/factura
 * - Solicitar otro servicio
 * - Ver historial de servicios
 *
 * @returns {JSX.Element} Componente de página de finalización
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  Download,
  Plus,
  History,
  CheckCircle,
  MessageSquare,
  Share2,
  Home,
} from 'lucide-react'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'

export default function CompletionPage() {
  const router = useRouter()
  const { selectedContractor, resetServiceAndLocation } = useServiceRequest()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [serviceRequestId, setServiceRequestId] = useState<string | null>(null)

  useEffect(() => {
    // Obtener el ID del servicio completado
    const storedServiceRequestId = sessionStorage.getItem('serviceRequestId')
    if (storedServiceRequestId) {
      setServiceRequestId(storedServiceRequestId)
    }
  }, [])

  // Manejar envío de calificación
  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('Por favor selecciona una calificación')
      return
    }

    setIsSubmittingReview(true)

    try {
      // Aquí enviarías la calificación a tu API
      // await submitReview(serviceRequestId, selectedContractor?.id, rating, review)

      // Simular envío
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setReviewSubmitted(true)
      console.log('✅ Calificación enviada:', {
        rating,
        review,
        contractorId: selectedContractor?.id,
      })
    } catch (error) {
      console.error('Error al enviar calificación:', error)
      alert('Error al enviar la calificación. Inténtalo nuevamente.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Manejar descarga de recibo
  const handleDownloadReceipt = () => {
    // Aquí implementarías la generación y descarga del recibo
    console.log('📄 Descargando recibo para servicio:', serviceRequestId)
    alert('Funcionalidad de descarga de recibo próximamente')
  }

  // Manejar solicitud de nuevo servicio
  const handleNewService = () => {
    resetServiceAndLocation()
    router.push('/')
  }

  // Manejar ver historial
  const handleViewHistory = () => {
    router.push('/user/history')
  }

  // Manejar compartir experiencia
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Excelente servicio con Emergency Repair24',
        text: `Acabo de recibir un excelente servicio de ${selectedContractor?.name}. ¡Muy recomendado!`,
        url: window.location.origin,
      })
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const text = `Acabo de recibir un excelente servicio de ${selectedContractor?.name} a través de Emergency Repair24. ¡Muy recomendado! ${window.location.origin}`
      navigator.clipboard.writeText(text)
      alert('Enlace copiado al portapapeles')
    }
  }

  if (!selectedContractor) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <h2 className="text-xl font-semibold">No se encontró información del servicio</h2>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 dark:text-white">
      {/* Header de éxito */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Servicio completado exitosamente!</h1>
        <p className="text-muted-foreground">Gracias por confiar en Emergency Repair24</p>
        {serviceRequestId && (
          <Badge variant="outline" className="mt-2">
            Servicio #{serviceRequestId.slice(-8)}
          </Badge>
        )}
      </div>

      {/* Información del servicio completado */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Resumen del servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Contratista</h3>
              <p className="font-medium">{selectedContractor.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Servicios</h3>
              <p className="font-medium">{selectedContractor.services?.join(', ')}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Calificación del contratista
              </h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-medium">{selectedContractor.rating}</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Estado del pago</h3>
              <Badge variant="outline" className="bg-success/10 text-success border-success">
                Completado
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calificación del servicio */}
      {!reviewSubmitted ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Califica tu experiencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                ¿Cómo calificarías el servicio de {selectedContractor.name}?
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-warning fill-warning' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Comentarios (opcional)</label>
              <Textarea
                placeholder="Comparte tu experiencia con otros usuarios..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={rating === 0 || isSubmittingReview}
              className="w-full"
            >
              {isSubmittingReview ? 'Enviando...' : 'Enviar calificación'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="font-semibold mb-2">¡Gracias por tu calificación!</h3>
            <p className="text-sm text-muted-foreground">
              Tu opinión nos ayuda a mejorar nuestros servicios
            </p>
          </CardContent>
        </Card>
      )}

      {/* Acciones disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button variant="outline" onClick={handleDownloadReceipt} className="h-auto p-4">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Descargar recibo</div>
              <div className="text-sm text-muted-foreground">PDF con detalles del servicio</div>
            </div>
          </div>
        </Button>

        <Button variant="outline" onClick={handleShare} className="h-auto p-4">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Compartir experiencia</div>
              <div className="text-sm text-muted-foreground">Recomienda nuestro servicio</div>
            </div>
          </div>
        </Button>
      </div>

      <Separator className="my-6" />

      {/* Próximos pasos */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">¿Qué te gustaría hacer ahora?</h2>

        <Button onClick={handleNewService} className="w-full justify-start h-auto p-4">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Solicitar otro servicio</div>
              <div className="text-sm opacity-90">Encuentra contratistas para otros trabajos</div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={handleViewHistory}
          className="w-full justify-start h-auto p-4"
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Ver historial de servicios</div>
              <div className="text-sm text-muted-foreground">Revisa tus servicios anteriores</div>
            </div>
          </div>
        </Button>

        <Button variant="outline" asChild className="w-full justify-start h-auto p-4">
          <Link href="/">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Volver al inicio</div>
                <div className="text-sm text-muted-foreground">Explorar otros servicios</div>
              </div>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  )
}
