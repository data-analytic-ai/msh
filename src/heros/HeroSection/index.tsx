'use client';

import React, { useEffect } from 'react';
import { useState } from 'react';

import type { Page } from '@/payload-types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Media } from '@/components/Media';
import RichText from '@/components/RichText';

type HeroSectionType =
  | {
      children?: React.ReactNode;
      richText?: never;
      media?: never;
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never;
      richText?: Page['hero']['richText'];
      media?: Page['hero']['media'];
    });

export const HeroSection: React.FC<HeroSectionType> = ({ children, richText, media }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    details: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData); // Manejo del envío del formulario
  };

  useEffect(() => {
    console.log('HeroSection mounted'); // Si necesitas algún efecto secundario
  }, []);

  return (
    <section className="relative min-h-[600px] bg-gradient-to-r from-blue-100 to-transparent">
      {/* Fondo dinámico con Payload Media */}
      <div className="absolute inset-0">
        {media && (
          <Media
            fill
            imgClassName="w-full h-full object-cover"
            resource={media}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/90 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          {/* RichText dinámico o hijos pasados como props */}
          {children || (richText && <RichText className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data={richText} enableGutter={false} />)}
        </div>

        {/* Formulario */}
        <div className="w-full md:w-[450px] bg-white/95 backdrop-blur rounded-lg shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Your name*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone/Mobile*</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="details">Project Details</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="h-24"
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Project
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
