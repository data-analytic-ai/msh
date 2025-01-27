import Image from "next/image"
import { Button } from "@/components/ui/button"

const services = [
  {
    title: "Roof Installation & Replacement",
    description:
      "Our team of experts provides high-quality roof installation and replacement services, ensuring proper protection against the elements. Choose from a variety of roofing materials, including ceramic shingles, metal roofing, and more to find the best fit for your home's needs.",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Siding Installation & Replacement",
    description:
      "Enhance the beauty and durability of your home with our top-notch siding installation and replacement services. We offer a wide range of siding materials, such as vinyl, fiber cement, and wood, to suit your taste and budget.",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Storm Damage Repair",
    description:
      "When severe weather strikes causing roofing and siding storm repair repairs, Our experienced professionals will quickly assess the damage, recommend the appropriate repairs, and take action to restore your home's integrity and prevent it from further damage.",
    image: "/placeholder.svg?height=300&width=400",
  },
]

export default function ServicesSection() {
  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Our Services</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          At RoofingSidingHub.com, we focus on providing reliable roofing and siding services to meet your home's
          exterior requirements. Our experienced team delivers quality workmanship for durable protection and improved
          appearance. Explore our range of roofing and siding options for your property today.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="flex flex-col">
              <div className="relative h-48 mb-4">
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 flex-grow">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="secondary">View All Services</Button>
        </div>
      </div>
    </section>
  )
}

