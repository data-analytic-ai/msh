export default function CTASection() {
    return (
      <section className="relative h-[500px]">
        <div className="absolute inset-0">
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}`}
            alt="Roofing background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
  
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Discover Solutions And Connect With Top Local Contractors Now!
            </h2>
            <p className="text-white/90 mb-8 max-w-xl">
              Don't waste time! Connect with trusted professionals for your roofing and siding needs. Discover a superior
              craftsmanship and exceptional service at RoofingSidingHub.com. Contact us today to get started on your home
              improvement journey.
            </p>
          </div>
        </div>
      </section>
    )
  }
  
  