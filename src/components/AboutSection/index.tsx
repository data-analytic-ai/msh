import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function AboutSection() {
  return (
    <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-background dark:bg-background">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] order-1 md:order-none">
          <Image
            src="/placeholder.svg?height=400&width=600"
            alt="About our company"
            fill
            className="rounded-lg object-cover shadow-md"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="order-2 md:order-none">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground">About Our Company</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            At RoofingSidingHub.com, we take pride in connecting homeowners with the best local roofing and siding
            contractors for their home improvement projects. As a trusted intermediary, we connect customers with a
            diverse network of professional and reliable contractors, ensuring the perfect match for every job. With
            years of industry experience behind us, our website, marketplace, and platform is designed to streamline the
            process of hiring skilled professionals who can deliver top-quality results every time. Through our
            dedication to friendly experience, we help you start free and effort in your search for the right
            contractor.
          </p>
          <Button variant="outline" className="group">
            Our Story
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </div>
      </div>
    </section>
  )
}

