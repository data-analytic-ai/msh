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
    <section className="relative min-h-[100vh] w-full bg-primary overflow-hidden flex items-center justify-center">
      {media && (
        <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full">
          <Media
            imgClassName="w-full h-full object-cover object-center"
            resource={media}
            priority
            fill
            size="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 dark:from-black/60 dark:to-black/30" />
        </div>
      )}
      <div className="relative container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mt-[-16vh] sm:mt-[-10vh] md:mt-[-6vh] lg:mt-[-16vh]">
        <div className="w-full md:w-1/2 lg:w-3/5 flex items-center justify-center">
          {richText && (
            <RichText
              className="text-1x1 sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md text-center mx-auto"
              data={richText}
              enableGutter={false}
            />
          )}
        </div>
        {form && (
          <div className="w-full md:w-1/2 lg:w-2/5 p-1 sm:p-2 flex items-center justify-center">
            <FormBlock enableIntro={true} form={form as Form} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
