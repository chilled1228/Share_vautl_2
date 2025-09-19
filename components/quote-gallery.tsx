import QuoteCard from "./quote-card"

const inspirationalQuotes = [
  {
    quote: "THE CAVE YOU FEAR TO ENTER HOLDS THE TREASURE YOU SEEK",
    author: "JOSEPH CAMPBELL",
    context:
      "Mythologist Joseph Campbell spent his life studying hero's journeys across cultures. He discovered that every great story involves facing what we fear most—and that's where transformation happens.",
  },
  {
    quote: "WHAT LIES BEHIND US AND WHAT LIES BEFORE US ARE TINY MATTERS COMPARED TO WHAT LIES WITHIN US",
    author: "RALPH WALDO EMERSON",
    context:
      "Emerson, a leader of the transcendentalist movement, believed that human potential was limitless. He taught that our inner strength and character matter more than our circumstances.",
  },
  {
    quote: "THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO",
    author: "STEVE JOBS",
    context:
      "Jobs revolutionized multiple industries by following his passion relentlessly. He believed that loving your work wasn't just nice to have—it was essential for achieving greatness.",
  },
  {
    quote: "SUCCESS IS NOT FINAL, FAILURE IS NOT FATAL: IT IS THE COURAGE TO CONTINUE THAT COUNTS",
    author: "WINSTON CHURCHILL",
    context:
      "Churchill led Britain through its darkest hour in WWII. He understood that both success and failure are temporary—what matters is having the courage to keep moving forward.",
  },
  {
    quote: "THE BEST TIME TO PLANT A TREE WAS 20 YEARS AGO. THE SECOND BEST TIME IS NOW",
    author: "CHINESE PROVERB",
    context:
      "This ancient wisdom reminds us that while we can't change the past, we can always start building a better future. The perfect time to begin is always now.",
  },
  {
    quote: "YOU MISS 100% OF THE SHOTS YOU DON'T TAKE",
    author: "WAYNE GRETZKY",
    context:
      "The greatest hockey player of all time understood that opportunity requires action. You can't succeed if you don't try, and you can't fail if you don't risk.",
  },
]

export default function QuoteGallery() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-8 uppercase tracking-tight">WISDOM THAT HITS DIFFERENT</h2>
          <p className="text-2xl md:text-3xl font-bold max-w-4xl mx-auto leading-relaxed text-balance">
            QUOTES THAT DON'T JUST SOUND GOOD—THEY CHANGE LIVES.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {inspirationalQuotes.map((quote, index) => (
            <QuoteCard
              key={index}
              quote={quote.quote}
              author={quote.author}
              context={quote.context}
              variant="default"
              className={index % 2 === 0 ? "transform rotate-1" : "transform -rotate-1"}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
