/**
 * API Route: /api/seed-contractors
 *
 * Este endpoint se utiliza para poblar la base de datos con contratistas de ejemplo.
 * Útil para propósitos de desarrollo y demostración.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Define los tipos de servicios permitidos
type ServiceType =
  | 'plumbing'
  | 'electrical'
  | 'glass'
  | 'hvac'
  | 'pests'
  | 'locksmith'
  | 'roofing'
  | 'siding'
  | 'general'
type DayType = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

// Contratistas de ejemplo para New York
const sampleContractors = [
  {
    name: 'Pro Plumbing Solutions',
    description: 'Professional plumbing services with 24/7 emergency availability',
    contactEmail: 'service@proplumbing.com',
    contactPhone: '(212) 555-1234',
    website: 'https://proplumbing.example.com',
    address: '123 Main St, New York, NY 10001',
    location: {
      lat: 40.7505,
      lng: -73.9934,
    },
    servicesOffered: ['plumbing', 'general'] as string[],
    yearsExperience: 15,
    rating: 4.8,
    reviewCount: 156,
    specialties: [
      { specialty: 'Emergency Plumbing' },
      { specialty: 'Pipe Installation' },
      { specialty: 'Drain Cleaning' },
    ],
    workingHours: {
      monday: '24 Hours',
      tuesday: '24 Hours',
      wednesday: '24 Hours',
      thursday: '24 Hours',
      friday: '24 Hours',
      saturday: '24 Hours',
      sunday: '24 Hours',
    },
    verified: true,
    dataSource: 'manual' as const,
    invitationStatus: 'not_invited' as const,
  },
  {
    name: 'Elite Electric NYC',
    description: 'Licensed electrical contractors serving NYC with quality and reliability',
    contactEmail: 'info@eliteelectric.com',
    contactPhone: '(718) 555-2345',
    website: 'https://eliteelectric.example.com',
    address: '456 Broadway, Brooklyn, NY 11211',
    location: {
      lat: 40.7081,
      lng: -73.9571,
    },
    servicesOffered: ['electrical', 'general'] as string[],
    yearsExperience: 12,
    rating: 4.6,
    reviewCount: 89,
    specialties: [
      { specialty: 'Electrical Repairs' },
      { specialty: 'Panel Upgrades' },
      { specialty: 'Commercial Wiring' },
    ],
    workingHours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '9:00 AM - 4:00 PM',
      sunday: 'Emergency Only',
    },
    verified: true,
    dataSource: 'manual' as const,
    invitationStatus: 'not_invited' as const,
  },
  {
    name: 'MaxTemp HVAC Services',
    description: 'Complete heating, ventilation, and air conditioning installation and repair',
    contactEmail: 'service@maxtemphvac.com',
    contactPhone: '(347) 555-3456',
    website: 'https://maxtemphvac.example.com',
    address: '789 Queens Blvd, Queens, NY 11375',
    location: {
      lat: 40.7282,
      lng: -73.8696,
    },
    servicesOffered: ['hvac', 'general'] as string[],
    yearsExperience: 12,
    rating: 4.7,
    reviewCount: 122,
    specialties: [
      { specialty: 'HVAC Installation' },
      { specialty: 'Air Conditioning Repair' },
      { specialty: 'Heating System Maintenance' },
    ],
    workingHours: {
      monday: '8:00 AM - 8:00 PM',
      tuesday: '8:00 AM - 8:00 PM',
      wednesday: '8:00 AM - 8:00 PM',
      thursday: '8:00 AM - 8:00 PM',
      friday: '8:00 AM - 8:00 PM',
      saturday: '9:00 AM - 5:00 PM',
      sunday: '10:00 AM - 4:00 PM',
    },
    verified: true,
    dataSource: 'manual' as const,
    invitationStatus: 'not_invited' as const,
  },
  {
    name: 'Crystal Clear Windows',
    description: 'Professional window repair, replacement, and installation services',
    contactEmail: 'info@crystalclearwindows.com',
    contactPhone: '(212) 555-6789',
    website: 'https://crystalclearwindows.example.com',
    address: '890 5th Ave, New York, NY 10065',
    location: {
      lat: 40.7672,
      lng: -73.9683,
    },
    servicesOffered: ['glass', 'general'] as string[],
    yearsExperience: 11,
    rating: 4.4,
    reviewCount: 76,
    specialties: [
      { specialty: 'Window Replacement' },
      { specialty: 'Glass Installation' },
      { specialty: 'Emergency Glass Repair' },
    ],
    workingHours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 3:00 PM',
      sunday: 'Closed',
    },
    verified: true,
    dataSource: 'manual' as const,
    invitationStatus: 'not_invited' as const,
  },
  {
    name: 'Quick Lock Solutions',
    description: '24/7 locksmith services for residential and commercial properties',
    contactEmail: 'emergency@quicklock.com',
    contactPhone: '(646) 555-7890',
    website: 'https://quicklock.example.com',
    address: '321 2nd Ave, New York, NY 10003',
    location: {
      lat: 40.7295,
      lng: -73.9885,
    },
    servicesOffered: ['locksmith', 'general'] as string[],
    yearsExperience: 8,
    rating: 4.5,
    reviewCount: 203,
    specialties: [
      { specialty: 'Emergency Lockout' },
      { specialty: 'Lock Installation' },
      { specialty: 'Security Systems' },
    ],
    workingHours: {
      monday: '24 Hours',
      tuesday: '24 Hours',
      wednesday: '24 Hours',
      thursday: '24 Hours',
      friday: '24 Hours',
      saturday: '24 Hours',
      sunday: '24 Hours',
    },
    verified: true,
    dataSource: 'manual' as const,
    invitationStatus: 'not_invited' as const,
  },
]

/**
 * GET handler para el endpoint /api/seed-contractors
 *
 * Pobla la base de datos con contratistas de ejemplo
 */
export async function GET() {
  try {
    // Get payload instance
    const payload = await getPayload({ config })

    // Verificar si ya existen contratistas
    const existingContractors = await payload.find({
      collection: 'contractors',
      limit: 1,
    })

    if (existingContractors.totalDocs > 0) {
      return NextResponse.json({
        message: 'Contractors already exist in database',
        count: existingContractors.totalDocs,
      })
    }

    // Crear contratistas de ejemplo
    const results = []
    for (const contractor of sampleContractors) {
      try {
        const created = await payload.create({
          collection: 'contractors',
          data: contractor,
        })
        results.push(created)
        console.log(`✅ Contratista creado: ${contractor.name}`)
      } catch (error) {
        console.error(`❌ Error al crear contratista ${contractor.name}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Contratistas de ejemplo creados exitosamente',
      count: results.length,
      contractors: results.map((c) => ({ id: c.id, name: c.name })),
    })
  } catch (error) {
    console.error('Error al poblar la base de datos con contratistas:', error)
    return NextResponse.json(
      {
        error: 'Error creando contratistas de ejemplo',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
