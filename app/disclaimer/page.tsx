import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { generateSEO } from "@/lib/seo"

export const metadata = generateSEO({
    title: "Disclaimer - SHAREVAULT",
    description: "Disclaimer for SHAREVAULT. Please read this disclaimer carefully.",
    keywords: ["disclaimer", "legal disclaimer", "website disclaimer"],
    url: "/disclaimer",
})

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black mb-12 uppercase tracking-tight text-center">
                        <span className="bg-accent text-accent-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-1">
                            DISCLAIMER
                        </span>
                    </h1>

                    <div className="bg-card brutalist-border brutalist-shadow p-8 md:p-12 prose prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-p:font-medium">
                        <p className="lead font-bold text-xl">Last updated: {new Date().toLocaleDateString()}</p>

                        <h3>General Disclaimer</h3>
                        <p>
                            The information provided by SHAREVAULT ("we," "us," or "our") on https://sharevault.com (the "Site") is
                            for general informational purposes only. All information on the Site is provided in good faith, however we
                            make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy,
                            validity, reliability, availability, or completeness of any information on the Site.
                        </p>

                        <p className="font-bold uppercase">
                            Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a
                            result of the use of the site or reliance on any information provided on the site. Your use of the site
                            and your reliance on any information on the site is solely at your own risk.
                        </p>

                        <h3>AI-Generated Content Disclaimer</h3>
                        <p>
                            Please be aware that images featured on SHAREVAULT are generated using artificial intelligence (<span className="bg-accent text-accent-foreground px-2 py-1 font-black">AI</span>) technology.
                            These <span className="bg-accent text-accent-foreground px-2 py-1 font-black">AI</span>-generated images are created for illustrative and aesthetic purposes to enhance your browsing experience.
                        </p>

                        <p>
                            Additionally, quotes displayed on the Site are a combination of hand-picked selections and <span className="bg-accent text-accent-foreground px-2 py-1 font-black">AI</span>-generated content.
                            While we strive to provide meaningful and inspiring quotes, some are curated by our team while others are
                            generated using <span className="bg-accent text-accent-foreground px-2 py-1 font-black">AI</span> technology. We make no guarantee regarding the originality or attribution of <span className="bg-accent text-accent-foreground px-2 py-1 font-black">AI</span>-generated quotes.
                        </p>

                        <h3>External Links Disclaimer</h3>
                        <p>
                            The Site may contain (or you may be sent through the Site) links to other websites or content belonging to
                            or originating from third parties or links to websites and features in banners or other advertising. Such
                            external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability,
                            availability, or completeness by us.
                        </p>

                        <p>
                            We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any
                            information offered by third-party websites linked through the site or any website or feature linked in
                            any banner or other advertising. We will not be a party to or in any way be responsible for monitoring any
                            transaction between you and third-party providers of products or services.
                        </p>

                        <h3>Professional Disclaimer</h3>
                        <p>
                            The Site cannot and does not contain professional advice. The information is provided for general
                            informational and educational purposes only and is not a substitute for professional advice. Accordingly,
                            before taking any actions based upon such information, we encourage you to consult with the appropriate
                            professionals. We do not provide any kind of professional advice.
                        </p>

                        <p>
                            The use or reliance of any information contained on the site is solely at your own risk.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
