import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Target, Zap, Heart, Users } from "lucide-react"
import { generateSEO } from "@/lib/seo"

export const metadata = generateSEO({
  title: "About SHAREVAULT - Our Mission & Values",
  description:
    "Learn about SHAREVAULT's mission to deliver raw, unfiltered motivation and brutal honesty for personal growth. No fluff, just actionable insights that work.",
  keywords: ["about mindshift", "motivational blog mission", "personal development philosophy", "brutal honesty"],
  url: "/about",
})

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none uppercase tracking-tight">
            <span className="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-2 mb-4">
              WHO
            </span>
            <br />
            <span className="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform rotate-1">
              WE
            </span>
            <br />
            <span className="bg-accent text-accent-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-1">
              ARE
            </span>
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card brutalist-border-thick brutalist-shadow p-8 md:p-12 transform rotate-1">
            <h2 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tight">OUR MISSION</h2>
            <p className="text-xl md:text-2xl font-bold leading-relaxed text-balance">
              WE'RE HERE TO CUT THROUGH THE NOISE AND DELIVER RAW, UNFILTERED MOTIVATION THAT ACTUALLY WORKS. NO FLUFF.
              NO FEEL-GOOD NONSENSE. JUST BRUTAL HONESTY AND ACTIONABLE INSIGHTS FOR PEOPLE WHO REFUSE TO SETTLE.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center uppercase tracking-tight">
            WHAT WE BELIEVE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card brutalist-border brutalist-shadow p-8 transform -rotate-1">
              <Target size={48} className="text-primary mb-6" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">BRUTAL HONESTY</h3>
              <p className="text-lg font-bold leading-relaxed">
                We tell you what you need to hear, not what you want to hear. Growth happens outside your comfort zone,
                and we're here to push you there.
              </p>
            </div>

            <div className="bg-card brutalist-border brutalist-shadow p-8 transform rotate-1">
              <Zap size={48} className="text-secondary mb-6" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">ACTION OVER THEORY</h3>
              <p className="text-lg font-bold leading-relaxed">
                Ideas without execution are worthless. Every piece of content comes with practical steps you can
                implement immediately.
              </p>
            </div>

            <div className="bg-card brutalist-border brutalist-shadow p-8 transform rotate-1">
              <Heart size={48} className="text-accent mb-6" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">TOUGH LOVE</h3>
              <p className="text-lg font-bold leading-relaxed">
                We care enough to challenge you. Real growth requires discomfort, and we're not here to coddle you
                through it.
              </p>
            </div>

            <div className="bg-card brutalist-border brutalist-shadow p-8 transform -rotate-1">
              <Users size={48} className="text-destructive mb-6" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">COMMUNITY FIRST</h3>
              <p className="text-lg font-bold leading-relaxed">
                Success is a team sport. We're building a community of people who push each other to be better every
                single day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center uppercase tracking-tight">OUR STORY</h2>

          <div className="space-y-8">
            <div className="bg-card brutalist-border brutalist-shadow p-8 transform -rotate-1">
              <p className="text-lg font-bold leading-relaxed">
                SHAREVAULT was born from frustration. Frustration with the endless stream of feel-good content that makes
                you feel better for five minutes but changes nothing. Frustration with motivational speakers who have
                never faced real adversity. Frustration with advice that sounds good but doesn't work.
              </p>
            </div>

            <div className="bg-card brutalist-border brutalist-shadow p-8 transform rotate-1">
              <p className="text-lg font-bold leading-relaxed">
                We believe that real motivation comes from truth, not fantasy. That lasting change comes from
                discipline, not inspiration. That the best advice often hurts to hear but transforms your life when you
                apply it.
              </p>
            </div>

            <div className="bg-card brutalist-border brutalist-shadow p-8 transform -rotate-1">
              <p className="text-lg font-bold leading-relaxed">
                Every quote we share has been battle-tested. Every piece of advice comes from people who have walked the
                walk. Every article is designed to challenge you, not comfort you. Because comfort is the enemy of
                growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tight">READY TO SHIFT?</h2>
          <p className="text-xl md:text-2xl font-bold mb-12 leading-relaxed text-balance">
            JOIN THOUSANDS OF PEOPLE WHO HAVE DECIDED TO STOP MAKING EXCUSES AND START MAKING PROGRESS.
          </p>
          <div className="bg-destructive text-destructive-foreground brutalist-border-thick brutalist-shadow p-8 md:p-12 transform rotate-1">
            <p className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              THE ONLY PERSON WHO CAN CHANGE YOUR LIFE IS YOU. WE'RE JUST HERE TO REMIND YOU HOW.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
