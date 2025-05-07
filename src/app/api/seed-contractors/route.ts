/**
 * API Route: /api/seed-contractors
 *
 * Este endpoint se utiliza para poblar la base de datos con contratistas de ejemplo.
 * Útil para propósitos de desarrollo y demostración.
 */

import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'

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
    businessName: 'Quick Fix Plumbing',
    firstName: 'Robert',
    lastName: 'Johnson',
    services: ['plumbing', 'general'] as ServiceType[],
    isAvailable: true,
    isVerified: true,
    location: {
      formattedAddress: '123 Broadway, New York, NY 10007',
      coordinates: {
        lat: 40.7127,
        lng: -74.0059,
      },
      city: 'New York',
      state: 'NY',
      zipCode: '10007',
      neighborhood: 'Financial District',
    },
    contactInfo: {
      email: 'info@quickfixplumbing.com',
      phone: '(212) 555-1234',
      website: 'https://quickfixplumbing.example.com',
    },
    businessDetails: {
      description: 'Professional plumbing services for residential and commercial properties',
      yearsInBusiness: 15,
      employeeCount: 12,
      certifications: [
        {
          name: 'Certified Master Plumber',
        },
        {
          name: 'Licensed Contractor NYC',
        },
      ],
    },
    googleData: {
      rating: 4.8,
      reviewCount: 156,
      openingHours: [
        { day: 'monday', open: '8:00 AM - 6:00 PM' },
        { day: 'tuesday', open: '8:00 AM - 6:00 PM' },
        { day: 'wednesday', open: '8:00 AM - 6:00 PM' },
        { day: 'thursday', open: '8:00 AM - 6:00 PM' },
        { day: 'friday', open: '8:00 AM - 6:00 PM' },
        { day: 'saturday', open: '9:00 AM - 4:00 PM' },
        { day: 'sunday', open: 'Closed' },
      ],
    },
  },
  {
    businessName: 'Brooklyn Electrical Solutions',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    services: ['electrical', 'general'] as ServiceType[],
    isAvailable: true,
    isVerified: true,
    location: {
      formattedAddress: '456 Atlantic Ave, Brooklyn, NY 11217',
      coordinates: {
        lat: 40.684,
        lng: -73.9778,
      },
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11217',
      neighborhood: 'Fort Greene',
    },
    contactInfo: {
      email: 'contact@brooklynelectric.com',
      phone: '(718) 555-2345',
      website: 'https://brooklynelectric.example.com',
    },
    businessDetails: {
      description: 'Licensed electrical contractors specializing in residential wiring and repairs',
      yearsInBusiness: 8,
      employeeCount: 6,
      certifications: [
        {
          name: 'Licensed Master Electrician',
        },
        {
          name: 'NYC Electrical Contractor License',
        },
      ],
    },
    googleData: {
      rating: 4.6,
      reviewCount: 98,
      openingHours: [
        { day: 'monday', open: '7:30 AM - 7:00 PM' },
        { day: 'tuesday', open: '7:30 AM - 7:00 PM' },
        { day: 'wednesday', open: '7:30 AM - 7:00 PM' },
        { day: 'thursday', open: '7:30 AM - 7:00 PM' },
        { day: 'friday', open: '7:30 AM - 5:00 PM' },
        { day: 'saturday', open: '8:00 AM - 3:00 PM' },
        { day: 'sunday', open: 'Closed' },
      ],
    },
  },
  {
    businessName: 'MaxTemp HVAC Services',
    firstName: 'Carlos',
    lastName: 'Mendez',
    services: ['hvac', 'general'] as ServiceType[],
    isAvailable: true,
    isVerified: true,
    location: {
      formattedAddress: '789 Queens Blvd, Queens, NY 11375',
      coordinates: {
        lat: 40.7282,
        lng: -73.8696,
      },
      city: 'Queens',
      state: 'NY',
      zipCode: '11375',
      neighborhood: 'Forest Hills',
    },
    contactInfo: {
      email: 'service@maxtemphvac.com',
      phone: '(347) 555-3456',
      website: 'https://maxtemphvac.example.com',
    },
    businessDetails: {
      description: 'Complete heating, ventilation, and air conditioning installation and repair',
      yearsInBusiness: 12,
      employeeCount: 10,
      certifications: [
        {
          name: 'HVAC Excellence Certification',
        },
        {
          name: 'EPA 608 Certification',
        },
      ],
    },
    googleData: {
      rating: 4.7,
      reviewCount: 122,
      openingHours: [
        { day: 'monday', open: '8:00 AM - 8:00 PM' },
        { day: 'tuesday', open: '8:00 AM - 8:00 PM' },
        { day: 'wednesday', open: '8:00 AM - 8:00 PM' },
        { day: 'thursday', open: '8:00 AM - 8:00 PM' },
        { day: 'friday', open: '8:00 AM - 8:00 PM' },
        { day: 'saturday', open: '9:00 AM - 5:00 PM' },
        { day: 'sunday', open: '10:00 AM - 4:00 PM' },
      ],
    },
  },
  {
    businessName: 'PestAway Exterminators',
    firstName: 'Lisa',
    lastName: 'Chen',
    services: ['pests', 'general'] as ServiceType[],
    isAvailable: true,
    isVerified: true,
    location: {
      formattedAddress: '321 Staten Island Ave, Staten Island, NY 10301',
      coordinates: {
        lat: 40.6367,
        lng: -74.1181,
      },
      city: 'Staten Island',
      state: 'NY',
      zipCode: '10301',
      neighborhood: 'St. George',
    },
    contactInfo: {
      email: 'info@pestawaynyc.com',
      phone: '(718) 555-4567',
      website: 'https://pestawaynyc.example.com',
    },
    businessDetails: {
      description: 'Comprehensive pest control services for homes and businesses',
      yearsInBusiness: 6,
      employeeCount: 8,
      certifications: [
        {
          name: 'NYS DEC Pesticide Applicator License',
        },
        {
          name: 'Green Shield Certified',
        },
      ],
    },
    googleData: {
      rating: 4.5,
      reviewCount: 87,
      openingHours: [
        { day: 'monday', open: '8:00 AM - 6:00 PM' },
        { day: 'tuesday', open: '8:00 AM - 6:00 PM' },
        { day: 'wednesday', open: '8:00 AM - 6:00 PM' },
        { day: 'thursday', open: '8:00 AM - 6:00 PM' },
        { day: 'friday', open: '8:00 AM - 5:00 PM' },
        { day: 'saturday', open: '9:00 AM - 2:00 PM' },
        { day: 'sunday', open: 'Closed' },
      ],
    },
  },
  {
    businessName: 'Bronx Locksmith Experts',
    firstName: 'David',
    lastName: 'Williams',
    services: ['locksmith', 'general'] as ServiceType[],
    isAvailable: true,
    isVerified: true,
    location: {
      formattedAddress: '567 Grand Concourse, Bronx, NY 10451',
      coordinates: {
        lat: 40.8151,
        lng: -73.9265,
      },
      city: 'Bronx',
      state: 'NY',
      zipCode: '10451',
      neighborhood: 'Concourse',
    },
    contactInfo: {
      email: 'service@bronxlocksmith.com',
      phone: '(347) 555-5678',
      website: 'https://bronxlocksmith.example.com',
    },
    businessDetails: {
      description: '24/7 emergency locksmith services for residential and commercial properties',
      yearsInBusiness: 9,
      employeeCount: 5,
      certifications: [
        {
          name: 'Associated Locksmiths of America Certification',
        },
        {
          name: 'Safe and Vault Technicians Association Certification',
        },
      ],
    },
    googleData: {
      rating: 4.9,
      reviewCount: 143,
      openingHours: [
        { day: 'monday', open: '24 Hours' },
        { day: 'tuesday', open: '24 Hours' },
        { day: 'wednesday', open: '24 Hours' },
        { day: 'thursday', open: '24 Hours' },
        { day: 'friday', open: '24 Hours' },
        { day: 'saturday', open: '24 Hours' },
        { day: 'sunday', open: '24 Hours' },
      ],
    },
  },
  {
    businessName: 'Crystal Clear Windows',
    firstName: 'Michael',
    lastName: 'Thompson',
    services: ['glass', 'general'] as ServiceType[],
    isAvailable: true,
    isVerified: true,
    location: {
      formattedAddress: '890 5th Ave, New York, NY 10065',
      coordinates: {
        lat: 40.7672,
        lng: -73.9683,
      },
      city: 'New York',
      state: 'NY',
      zipCode: '10065',
      neighborhood: 'Upper East Side',
    },
    contactInfo: {
      email: 'info@crystalclearwindows.com',
      phone: '(212) 555-6789',
      website: 'https://crystalclearwindows.example.com',
    },
    businessDetails: {
      description: 'Professional window repair, replacement, and installation services',
      yearsInBusiness: 11,
      employeeCount: 7,
      certifications: [
        {
          name: 'National Glass Association Certification',
        },
        {
          name: 'InstallationMasters Certified Installer',
        },
      ],
    },
    googleData: {
      rating: 4.4,
      reviewCount: 76,
      openingHours: [
        { day: 'monday', open: '9:00 AM - 5:00 PM' },
        { day: 'tuesday', open: '9:00 AM - 5:00 PM' },
        { day: 'wednesday', open: '9:00 AM - 5:00 PM' },
        { day: 'thursday', open: '9:00 AM - 5:00 PM' },
        { day: 'friday', open: '9:00 AM - 5:00 PM' },
        { day: 'saturday', open: '10:00 AM - 3:00 PM' },
        { day: 'sunday', open: 'Closed' },
      ],
    },
  },
  {
    businessName: 'AllWeather Roofing',
    firstName: 'James',
    lastName: 'Martinez',
    services: ['roofing', 'general'] as ServiceType[],
    isAvailable: true,
    isVerified: true,
    location: {
      formattedAddress: '432 Woodhaven Blvd, Queens, NY 11421',
      coordinates: {
        lat: 40.6886,
        lng: -73.8512,
      },
      city: 'Queens',
      state: 'NY',
      zipCode: '11421',
      neighborhood: 'Woodhaven',
    },
    contactInfo: {
      email: 'contact@allweatherroofing.com',
      phone: '(718) 555-7890',
      website: 'https://allweatherroofing.example.com',
    },
    businessDetails: {
      description: 'Complete roofing installation, repair, and maintenance services',
      yearsInBusiness: 18,
      employeeCount: 15,
      certifications: [
        {
          name: 'GAF Master Elite Contractor',
        },
        {
          name: 'CertainTeed SELECT ShingleMaster',
        },
      ],
    },
    googleData: {
      rating: 4.6,
      reviewCount: 132,
      openingHours: [
        { day: 'monday', open: '7:00 AM - 5:00 PM' },
        { day: 'tuesday', open: '7:00 AM - 5:00 PM' },
        { day: 'wednesday', open: '7:00 AM - 5:00 PM' },
        { day: 'thursday', open: '7:00 AM - 5:00 PM' },
        { day: 'friday', open: '7:00 AM - 5:00 PM' },
        { day: 'saturday', open: '8:00 AM - 2:00 PM' },
        { day: 'sunday', open: 'Closed' },
      ],
    },
  },
  {
    businessName: 'Brooklyn Siding Pros',
    firstName: 'Sarah',
    lastName: 'Lewis',
    services: ['siding', 'general'] as ServiceType[],
    isAvailable: true,
    isVerified: true,
    location: {
      formattedAddress: '765 Flatbush Ave, Brooklyn, NY 11226',
      coordinates: {
        lat: 40.6528,
        lng: -73.9616,
      },
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11226',
      neighborhood: 'Flatbush',
    },
    contactInfo: {
      email: 'info@brooklynsidingpros.com',
      phone: '(347) 555-8901',
      website: 'https://brooklynsidingpros.example.com',
    },
    businessDetails: {
      description:
        'Professional siding installation, repair, and maintenance for all property types',
      yearsInBusiness: 10,
      employeeCount: 9,
      certifications: [
        {
          name: 'Vinyl Siding Institute Certified Installer',
        },
        {
          name: 'James Hardie Preferred Contractor',
        },
      ],
    },
    googleData: {
      rating: 4.5,
      reviewCount: 92,
      openingHours: [
        { day: 'monday', open: '8:00 AM - 6:00 PM' },
        { day: 'tuesday', open: '8:00 AM - 6:00 PM' },
        { day: 'wednesday', open: '8:00 AM - 6:00 PM' },
        { day: 'thursday', open: '8:00 AM - 6:00 PM' },
        { day: 'friday', open: '8:00 AM - 6:00 PM' },
        { day: 'saturday', open: '9:00 AM - 3:00 PM' },
        { day: 'sunday', open: 'Closed' },
      ],
    },
  },
]

/**
 * GET handler para el endpoint /api/seed-contractors
 *
 * Pobla la base de datos con contratistas de ejemplo
 */
export async function GET() {
  try {
    // Verificar si ya existen contratistas
    const existingContractors = await payload.find({
      collection: 'contractor-directory',
      limit: 1,
    })

    // Si ya hay contratistas, informar que ya existe data
    if (existingContractors.docs.length > 0) {
      return NextResponse.json({
        message: 'La base de datos ya contiene contratistas. No se crearon nuevos registros.',
        count: existingContractors.totalDocs,
      })
    }

    // Crear los contratistas de ejemplo
    const createdContractors = []

    for (const contractor of sampleContractors) {
      try {
        // Corregir el tipado de googleData.openingHours
        const formattedContractor = {
          ...contractor,
          googleData: {
            ...contractor.googleData,
            openingHours: contractor.googleData.openingHours.map((hour) => ({
              day: hour.day as DayType,
              open: hour.open,
            })),
          },
        }

        const created = await payload.create({
          collection: 'contractor-directory',
          data: formattedContractor,
        })
        createdContractors.push(created)
      } catch (error) {
        console.error(`Error al crear contratista ${contractor.businessName}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Contratistas de ejemplo creados exitosamente',
      count: createdContractors.length,
    })
  } catch (error) {
    console.error('Error al poblar la base de datos con contratistas:', error)
    return NextResponse.json({ error: 'Error creando contratistas de ejemplo' }, { status: 500 })
  }
}
