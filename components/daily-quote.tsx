"use client"

import { useState, useEffect } from "react"
import QuoteCard from "./quote-card"

const dailyQuotes = [
  {
    quote: "DISCIPLINE IS THE BRIDGE BETWEEN GOALS AND ACCOMPLISHMENT",
    author: "JIM ROHN",
    context:
      "Business philosopher Jim Rohn taught that success isn't about luck or talent—it's about building the bridge of discipline between where you are and where you want to be.",
  },
  {
    quote: "THE ONLY PERSON YOU ARE DESTINED TO BECOME IS THE PERSON YOU DECIDE TO BE",
    author: "RALPH WALDO EMERSON",
    context:
      "Emerson rejected the idea of predetermined fate. He believed that every person has the power to choose their destiny through conscious decisions and actions.",
  },
  {
    quote: "CHAMPIONS KEEP PLAYING UNTIL THEY GET IT RIGHT",
    author: "BILLIE JEAN KING",
    context:
      "Tennis legend Billie Jean King won 39 Grand Slam titles by refusing to quit when things got tough. She understood that mastery comes from persistence, not perfection.",
  },
  {
    quote: "THE FUTURE BELONGS TO THOSE WHO BELIEVE IN THE BEAUTY OF THEIR DREAMS",
    author: "ELEANOR ROOSEVELT",
    context:
      "As First Lady and human rights activist, Roosevelt transformed the role and fought for equality. She believed that believing in your dreams is the first step to achieving them.",
  },
  {
    quote: "IT IS DURING OUR DARKEST MOMENTS THAT WE MUST FOCUS TO SEE THE LIGHT",
    author: "ARISTOTLE",
    context:
      "The ancient Greek philosopher understood that our greatest challenges often reveal our greatest strengths. When everything seems dark, that's when we must look hardest for hope.",
  },
  {
    quote: "THE WAY TO GET STARTED IS TO QUIT TALKING AND BEGIN DOING",
    author: "WALT DISNEY",
    context:
      "Disney built an entertainment empire by turning dreams into reality. He knew that all the planning in the world means nothing without action.",
  },
  {
    quote: "LIFE IS WHAT HAPPENS TO YOU WHILE YOU'RE BUSY MAKING OTHER PLANS",
    author: "JOHN LENNON",
    context:
      "The Beatles songwriter reminded us that while planning is important, we can't let it prevent us from living. Sometimes the best moments are the unplanned ones.",
  },
]

export default function DailyQuote() {
  const [todaysQuote, setTodaysQuote] = useState(dailyQuotes[0])

  useEffect(() => {
    // Get today's date and use it to select a quote
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    const quoteIndex = dayOfYear % dailyQuotes.length
    setTodaysQuote(dailyQuotes[quoteIndex])
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight">TODAY'S DOSE OF TRUTH</h2>
          <p className="text-xl font-bold text-muted-foreground">
            A NEW QUOTE EVERY DAY TO FUEL YOUR SHAREVAULT JOURNEY
          </p>
        </div>

        <QuoteCard
          quote={todaysQuote.quote}
          author={todaysQuote.author}
          context={todaysQuote.context}
          variant="large"
          className="transform rotate-1"
        />

        <div className="text-center mt-12">
          <p className="text-lg font-bold leading-relaxed text-balance max-w-2xl mx-auto">
            BOOKMARK THIS PAGE AND COME BACK DAILY FOR YOUR DOSE OF MOTIVATION. SMALL DAILY INPUTS CREATE MASSIVE LIFE
            CHANGES.
          </p>
        </div>
      </div>
    </section>
  )
}
