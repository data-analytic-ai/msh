"use client";

import React from "react";
import { Media } from "@/components/Media";
import RichText from "@/components/RichText";
import { FormBlock } from "@/blocks/Form/Component";
import { Page } from "@/payload-types";
import type { Form } from '@payloadcms/plugin-form-builder/types'
// export type HeroSectionProps = {
//   richText?: any;
//   media?: any;
//   form?: any; // Asegúrate de que coincida con FormType de FormBlock
// };

const HeroSection: React.FC<Page['hero']> = ({ richText, media, form }) => {
  return (
    <section className="relative min-h-[80vh] bg-primary">
      {media && (
        <div className="absolute inset-0">
          <Media
            imgClassName="w-full h-full object-cover"
            resource={media}
            priority
          />
          {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-100/90 to-transparent" /> */}
        </div>
      )}
      <div className="relative max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12 lg:py-24 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1">
          {richText && (
            <RichText
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6"
              data={richText}
              enableGutter={false}
            />
          )}
        </div>
        {form && (
          <div className="w-full max-w-md mx-auto">
            <FormBlock enableIntro={true} form={form as Form} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
