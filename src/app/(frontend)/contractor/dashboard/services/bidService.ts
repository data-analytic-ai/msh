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
  if (!requestId || !contractorId) {
    console.error('❌ Missing required parameters: requestId or contractorId')
    return false
  }

  try {
    console.log('💰 Submitting bid:', { requestId, contractorId, amount, description })

    // Use the custom contractor quotes endpoint
    const response = await fetch('/api/contractor-quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        requestId,
        contractorId,
        amount,
        description,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Error response:', errorData)

      // Handle specific error types
      if (response.status === 400) {
        throw new Error(errorData.message || 'Datos inválidos para la cotización')
      } else if (response.status === 404) {
        throw new Error('Solicitud de servicio no encontrada')
      } else {
        throw new Error(errorData.message || 'Error al enviar cotización')
      }
    }

    const result = await response.json()
    console.log('✅ Quote submission successful:', result.message)
    return true
  } catch (err) {
    console.error('❌ Error submitting bid:', err)
    return false
  }
}

/**
 * getContractorQuotes - Retrieves all quotes submitted by a contractor
 *
 * @param {string} contractorId - ID of the contractor
 * @returns {Promise<any[]>} - Array of quotes or empty array on error
 */
export const getContractorQuotes = async (contractorId: string): Promise<any[]> => {
  if (!contractorId) {
    console.error('❌ Missing contractorId parameter')
    return []
  }

  try {
    const response = await fetch(`/api/contractor-quotes?contractorId=${contractorId}`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      console.error('❌ Error fetching contractor quotes:', response.status)
      return []
    }

    const data = await response.json()
    return data.quotes || []
  } catch (err) {
    console.error('❌ Error fetching contractor quotes:', err)
    return []
  }
}
