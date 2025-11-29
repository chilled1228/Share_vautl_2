import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { generateSEO } from "@/lib/seo"

export const metadata = generateSEO({
    title: "Terms and Conditions - SHAREVAULT",
    description: "Terms and Conditions for using SHAREVAULT. Please read these terms carefully before using our website.",
    keywords: ["terms and conditions", "terms of use", "user agreement", "sharevault terms"],
    url: "/terms",
})

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black mb-12 uppercase tracking-tight text-center">
                        <span className="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform rotate-1">
                            TERMS & CONDITIONS
                        </span>
                    </h1>

                    <div className="bg-card brutalist-border brutalist-shadow p-8 md:p-12 prose prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-p:font-medium">
                        <p className="lead font-bold text-xl">Last updated: {new Date().toLocaleDateString()}</p>

                        <h3>1. Introduction</h3>
                        <p>
                            Welcome to SHAREVAULT! These terms and conditions outline the rules and regulations for the use of
                            SHAREVAULT's Website, located at https://sharevault.com.
                        </p>

                        <p>
                            By accessing this website we assume you accept these terms and conditions. Do not continue to use
                            SHAREVAULT if you do not agree to take all of the terms and conditions stated on this page.
                        </p>

                        <h3>2. Cookies</h3>
                        <p>
                            We employ the use of cookies. By accessing SHAREVAULT, you agreed to use cookies in agreement with the
                            SHAREVAULT's Privacy Policy.
                        </p>

                        <h3>3. License</h3>
                        <p>
                            Unless otherwise stated, SHAREVAULT and/or its licensors own the intellectual property rights for all
                            material on SHAREVAULT. All intellectual property rights are reserved. You may access this from SHAREVAULT
                            for your own personal use subjected to restrictions set in these terms and conditions.
                        </p>

                        <p>You must not:</p>
                        <ul>
                            <li>Republish material from SHAREVAULT</li>
                            <li>Sell, rent or sub-license material from SHAREVAULT</li>
                            <li>Reproduce, duplicate or copy material from SHAREVAULT</li>
                            <li>Redistribute content from SHAREVAULT</li>
                        </ul>

                        <h3>4. User Comments</h3>
                        <p>
                            Parts of this website offer an opportunity for users to post and exchange opinions and information in
                            certain areas of the website. SHAREVAULT does not filter, edit, publish or review Comments prior to their
                            presence on the website. Comments do not reflect the views and opinions of SHAREVAULT,its agents and/or
                            affiliates. Comments reflect the views and opinions of the person who post their views and opinions.
                        </p>

                        <h3>5. Hyperlinking to our Content</h3>
                        <p>
                            The following organizations may link to our Website without prior written approval:
                        </p>
                        <ul>
                            <li>Government agencies;</li>
                            <li>Search engines;</li>
                            <li>News organizations;</li>
                        </ul>

                        <h3>6. Content Liability</h3>
                        <p>
                            We shall not be hold responsible for any content that appears on your Website. You agree to protect and
                            defend us against all claims that is rising on your Website. No link(s) should appear on any Website that
                            may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates
                            the infringement or other violation of, any third party rights.
                        </p>

                        <h3>7. Reservation of Rights</h3>
                        <p>
                            We reserve the right to request that you remove all links or any particular link to our Website. You
                            approve to immediately remove all links to our Website upon request. We also reserve the right to amen
                            these terms and conditions and it's linking policy at any time. By continuously linking to our Website,
                            you agree to be bound to and follow these linking terms and conditions.
                        </p>

                        <h3>8. Disclaimer</h3>
                        <p>
                            To the maximum extent permitted by applicable law, we exclude all representations, warranties and
                            conditions relating to our website and the use of this website. Nothing in this disclaimer will:
                        </p>
                        <ul>
                            <li>limit or exclude our or your liability for death or personal injury;</li>
                            <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                            <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                            <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
