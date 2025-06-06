/**
 * Bid Service
 *
 * Service for managing contractor bids on service requests.
 * Handles submission and updating of quote information.
 */

/**
 * submitBid - Submits a bid on a service request
 *
 * @param {string} requestId - ID of the service request
 * @param {string} contractorId - ID of the contractor submitting the bid
 * @param {number} amount - Bid amount
 * @param {string} description - Details of the bid/quote
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const submitBid = async (
  requestId: string,
  contractorId: string,
  amount: number,
  description: string,
): Promise<boolean> => {
  if (!requestId || !contractorId) return false

  try {
    // Obtener la información actual del request para actualizar
    const getResponse = await fetch(`/api/service-requests/${requestId}`, {
      credentials: 'include',
    })

    if (!getResponse.ok) {
      throw new Error('Error al obtener la solicitud')
    }

    const requestData = await getResponse.json()

    // Verificar si el contratista ya hizo una oferta
    const existingQuoteIndex = requestData.quotes?.findIndex(
      (q: any) => q.contractor === contractorId,
    )

    let updatedQuotes = requestData.quotes || []

    // Prepara la nueva cotización
    const newQuote = {
      contractor: contractorId,
      amount,
      description,
      status: 'pending',
    }

    if (existingQuoteIndex >= 0) {
      // Actualizar cotización existente
      updatedQuotes[existingQuoteIndex] = newQuote
    } else {
      // Agregar nueva cotización
      updatedQuotes = [...updatedQuotes, newQuote]
    }

    // Enviar actualización
    const updateResponse = await fetch(`/api/service-requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        quotes: updatedQuotes,
      }),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      throw new Error(errorData.errors?.[0]?.message || 'Error al enviar cotización')
    }

    return true
  } catch (err) {
    console.error('Error al enviar cotización:', err)
    return false
  }
}
