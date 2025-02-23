"use client";

import React from "react";
import { Media } from "@/components/Media";
import RichText from "@/components/RichText";
import { FormBlock } from "@/blocks/Form/Component";

export type HeroSectionProps = {
  richText?: any;
  media?: any;
  form?: any; // Asegúrate de que coincida con FormType de FormBlock
};

const HeroSection: React.FC<HeroSectionProps> = ({ richText, media, form }) => {
  return (
    <section className="relative min-h-[600px] bg-[#072640]">
      {media && (
        <div className="absolute inset-0">
          <Media
            imgClassName="w-full h-full object-cover"
            resource={media}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/90 to-transparent" />
        </div>
      )}
      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          {richText && (
            <RichText
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              data={richText}
              enableGutter={false}
            />
          )}
        </div>
        {form && (
          <div className="w-full md:w-[450px]">
            <FormBlock enableIntro={true} form={form} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
