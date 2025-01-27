const features = [
    {
      title: "Quality Assurance And Trust",
      description:
        "Our platform roofingsidinghub.com ensures all contractors are reliable and highly skilled for the task, giving our customers confidence in the quality of the work provided.",
    },
    {
      title: "Wide Range Of Local Contractors",
      description:
        "RoofingSidingHub.com connects customers with a diverse network of local roofing and siding professionals, making it easy to find the right contractor for their work.",
    },
    {
      title: "Time-Saving Convenience",
      description:
        "RoofingSidingHub.com simplifies the process of hiring roofing and siding contractors, saving customers time and effort with hassle-free home improvement projects.",
    },
  ]
  
  export default function FeaturesSection() {
    return (
      <section className="py-16 md:py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
  
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  