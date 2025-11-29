import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Mail, MapPin, Phone } from "lucide-react"
import { generateSEO } from "@/lib/seo"

export const metadata = generateSEO({
    title: "Contact SHAREVAULT - Get in Touch",
    description:
        "Have questions? Want to share your story? Contact SHAREVAULT. We're here to listen and help you on your journey.",
    keywords: ["contact sharevault", "customer support", "feedback", "inquiries"],
    url: "/contact",
})

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none uppercase tracking-tight">
                        <span className="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-2 mb-4">
                            GET
                        </span>
                        <br />
                        <span className="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform rotate-1">
                            IN
                        </span>
                        <br />
                        <span className="bg-accent text-accent-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-1">
                            TOUCH
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl font-bold mb-12 leading-relaxed text-balance">
                        GOT SOMETHING TO SAY? WE'RE LISTENING. BUT KEEP IT REAL.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-card brutalist-border brutalist-shadow p-8 transform -rotate-1 text-center">
                            <Mail size={48} className="text-primary mb-6 mx-auto" />
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">EMAIL US</h3>
                            <p className="text-lg font-bold">
                                <a href="mailto:blog.boopul@gmail.com" className="hover:text-primary transition-colors">
                                    blog.boopul@gmail.com
                                </a>
                            </p>
                        </div>

                        <div className="bg-card brutalist-border brutalist-shadow p-8 transform rotate-1 text-center">
                            <MapPin size={48} className="text-secondary mb-6 mx-auto" />
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">LOCATION</h3>
                            <p className="text-lg font-bold">
                                Digital Nomad HQ
                                <br />
                                Global
                            </p>
                        </div>

                        <div className="bg-card brutalist-border brutalist-shadow p-8 transform -rotate-1 text-center">
                            <Phone size={48} className="text-destructive mb-6 mx-auto" />
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">SUPPORT</h3>
                            <p className="text-lg font-bold">
                                Available 24/7 via Email
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-card brutalist-border-thick brutalist-shadow p-8 md:p-12">
                        <h2 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-tight text-center">
                            SEND A MESSAGE
                        </h2>
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-lg font-bold uppercase mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="w-full bg-background border-2 border-foreground p-4 font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 brutalist-shadow-sm"
                                    placeholder="YOUR NAME"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-lg font-bold uppercase mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full bg-background border-2 border-foreground p-4 font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 brutalist-shadow-sm"
                                    placeholder="YOUR EMAIL"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-lg font-bold uppercase mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={6}
                                    className="w-full bg-background border-2 border-foreground p-4 font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 brutalist-shadow-sm"
                                    placeholder="WHAT'S ON YOUR MIND?"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground py-4 text-xl font-black uppercase tracking-wide brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150"
                            >
                                SEND MESSAGE
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
