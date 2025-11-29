import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { generateSEO } from "@/lib/seo"

export const metadata = generateSEO({
    title: "DMCA Policy - SHAREVAULT",
    description: "DMCA Policy for SHAREVAULT. Procedure for making claims of copyright infringement.",
    keywords: ["DMCA", "copyright", "infringement", "sharevault dmca"],
    url: "/dmca",
})

export default function DmcaPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black mb-12 uppercase tracking-tight text-center">
                        <span className="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-1">
                            DMCA POLICY
                        </span>
                    </h1>

                    <div className="bg-card brutalist-border brutalist-shadow p-8 md:p-12 prose prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-p:font-medium">
                        <p className="lead font-bold text-xl">Last updated: {new Date().toLocaleDateString()}</p>

                        <p>
                            SHAREVAULT respects the intellectual property rights of others. It is our policy to respond to any claim that Content posted on the Service infringes on the copyright or other intellectual property rights ("Infringement") of any person or entity.
                        </p>

                        <p>
                            If you are a copyright owner, or authorized on behalf of one, and you believe that the copyrighted work has been copied in a way that constitutes copyright infringement, please submit your claim via email to blog.boopul@gmail.com, with the subject line: "Copyright Infringement" and include in your claim a detailed description of the alleged Infringement as detailed below, under "DMCA Notice and Procedure for Copyright Infringement Claims".
                        </p>

                        <p>
                            You may be held accountable for damages (including costs and attorneys' fees) for misrepresentation or bad-faith claims on the infringement of any Content found on and/or through the Service on your copyright.
                        </p>

                        <h3>DMCA Notice and Procedure for Copyright Infringement Claims</h3>
                        <p>
                            You may submit a notification pursuant to the Digital Millennium Copyright Act (DMCA) by providing our Copyright Agent with the following information in writing (see 17 U.S.C 512(c)(3) for further detail):
                        </p>

                        <ul>
                            <li>An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright's interest;</li>
                            <li>A description of the copyrighted work that you claim has been infringed, including the URL (i.e., web page address) of the location where the copyrighted work exists or a copy of the copyrighted work;</li>
                            <li>Identification of the URL or other specific location on the Service where the material that you claim is infringing is located;</li>
                            <li>Your address, telephone number, and email address;</li>
                            <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law;</li>
                            <li>A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf.</li>
                        </ul>

                        <p>
                            You can contact our Copyright Agent via email at blog.boopul@gmail.com.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
