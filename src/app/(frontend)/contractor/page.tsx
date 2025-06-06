import type React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Star, CheckCircle, Clock, BadgeDollarSign, Users } from 'lucide-react'

export default function ContractorLandingPage() {
  return (
    <div className="flex flex-col min-h-screen dark:text-white dark:bg-background">
      <main className="flex-1">
        <section className="bg-background py-12 px-4 md:pb-0 md:pt-24">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Join our network of professional contractors
            </h1>
            <p className="mx-auto max-w-2xl text-lg">
              We connect qualified contractors with clients who need emergency services. Increase
              your income and build your business on our platform.
            </p>
            <Button asChild size="lg" className="bg-secondary text-primary hover:bg-secondary/50">
              <Link href="/contractor/register">Get Started Today</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-12">Why join us?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BadgeDollarSign className="h-8 w-8 text-primary" />}
                title="Increase your income"
                description="Receive service requests constantly and increase your monthly income."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Expand your clientele"
                description="Connect with new clients in your area who need your specialized services."
              />
              <FeatureCard
                icon={<Clock className="h-8 w-8 text-primary" />}
                title="Flexible hours"
                description="Work when you want. You decide which requests to accept."
              />
              <FeatureCard
                icon={<CheckCircle className="h-8 w-8 text-primary" />}
                title="Easy verification"
                description="Simple verification process to start working quickly."
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-primary" />}
                title="Secure payments"
                description="Receive payments securely directly to your bank account."
              />
              <FeatureCard
                icon={<Star className="h-8 w-8 text-primary" />}
                title="Build your reputation"
                description="Build your profile with reviews and positive ratings from satisfied clients."
              />
            </div>
          </div>
        </section>

        <section className="bg-background py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-6">How it works?</h2>
            <div className="space-y-8 mt-10">
              <Step
                number="1"
                title="Register as a contractor"
                description="Complete your profile with your personal information, specialties, and service area."
              />
              <Step
                number="2"
                title="Verify your identity"
                description="Upload your documents and certifications to verify your identity and skills."
              />
              <Step
                number="3"
                title="Receive requests"
                description="Start receiving service requests from clients near your location."
              />
              <Step
                number="4"
                title="Provide quality services"
                description="Handle emergencies, solve problems, and earn positive ratings."
              />
            </div>
            <div className="mt-12 text-center">
              <Button asChild className="bg-secondary text-primary hover:bg-secondary/50">
                <Link href="/register?type=contractor">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 dark:text-white">
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
          {number}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
