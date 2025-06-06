/**
 * Seed Service Request Form
 *
 * API endpoint for seeding the service request form configuration into PayloadCMS.
 * This creates the form structure that will be used by the ServiceRequestForm component.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import serviceRequestFormData from '@/data/service-request-form.json'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Check if the form already exists
    const existingForms = await payload.find({
      collection: 'forms',
      where: {
        title: {
          equals: 'Service Request Form',
        },
      },
    })

    if (existingForms.docs.length > 0) {
      return NextResponse.json(
        {
          message: 'Service Request Form already exists',
          formId: existingForms.docs[0].id,
        },
        { status: 200 },
      )
    }

    // Create the form
    const form = await payload.create({
      collection: 'forms',
      data: serviceRequestFormData,
    })

    return NextResponse.json(
      {
        message: 'Service Request Form created successfully',
        formId: form.id,
        form: form,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error seeding service request form:', error)
    return NextResponse.json(
      {
        error: 'Failed to seed service request form',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Find the service request form
    const forms = await payload.find({
      collection: 'forms',
      where: {
        title: {
          equals: 'Service Request Form',
        },
      },
    })

    if (forms.docs.length === 0) {
      return NextResponse.json({ message: 'Service Request Form not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        form: forms.docs[0],
        message: 'Service Request Form found',
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching service request form:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch service request form',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
