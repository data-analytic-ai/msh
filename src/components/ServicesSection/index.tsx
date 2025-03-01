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
    <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-card dark:bg-card">
      <div className="container mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Our Services</h2>
        <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          At RoofingSidingHub.com, we focus on providing reliable roofing and siding services to meet your home's
          exterior requirements. Our experienced team delivers quality workmanship for durable protection and improved
          appearance. Explore our range of roofing and siding options for your property today.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="flex flex-col bg-background dark:bg-background rounded-lg shadow-sm overflow-hidden transition-transform hover:translate-y-[-4px] hover:shadow-md"
            >
              <div className="relative h-48 mb-0">
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 sm:p-6 flex-grow">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{service.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{service.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Button variant="secondary">
            View All Services
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
              className="ml-2 h-4 w-4"
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

