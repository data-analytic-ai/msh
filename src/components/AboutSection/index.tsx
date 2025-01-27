import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function AboutSection() {
  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="relative h-[400px]">
          <Image
            src="/placeholder.svg?height=400&width=600"
            alt="About our company"
            fill
            className="rounded-lg object-cover"
          />
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About Our Company</h2>
          <p className="text-gray-600 mb-6">
            At RoofingSidingHub.com, we take pride in connecting homeowners with the best local roofing and siding
            contractors for their home improvement projects. As a trusted intermediary, we connect customers with a
            diverse network of professional and reliable contractors, ensuring the perfect match for every job. With
            years of industry experience behind us, our website, marketplace, and platform is designed to streamline the
            process of hiring skilled professionals who can deliver top-quality results every time. Through our
            dedication to friendly experience, we help you start free and effort in your search for the right
            contractor.
          </p>
          <Button variant="link" className="p-0">
            Our Story
          </Button>
        </div>
      </div>
    </section>
  )
}

