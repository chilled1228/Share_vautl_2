'use client'

import { useState, useEffect } from 'react'
import { Copy, Heart, Check, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ExtractedQuote } from '@/lib/content-processor'

interface QuoteFlashCardsProps {
    quotes: ExtractedQuote[]
}

export default function QuoteFlashCards({ quotes }: QuoteFlashCardsProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set())
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [hasInteracted, setHasInteracted] = useState(false)

    // Card colors cycle - neo-brutalist palette (using hex for inline styles)
    const cardColors = [
        '#FDE047', // yellow
        '#F472B6', // pink
        '#38BDF8', // blue
        '#4ADE80', // green
        '#C084FC'  // purple
    ]

    const getCardColor = (idx: number) => cardColors[idx % cardColors.length]

    const handleNext = () => {
        if (!hasInteracted) setHasInteracted(true)
        if (currentIndex < quotes.length - 1) {
            setDirection(1)
            setCurrentIndex((prev) => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1)
            setCurrentIndex((prev) => prev - 1)
        }
    }

    const handleReset = () => {
        setDirection(-1)
        setCurrentIndex(0)
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext()
            if (e.key === 'ArrowLeft') handlePrev()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentIndex, quotes.length, hasInteracted])

    if (!quotes || quotes.length === 0) return null

    const currentQuote = quotes[currentIndex]
    const isLiked = likedQuotes.has(currentIndex)
    const isCopied = copiedIndex === currentIndex
    const progress = ((currentIndex + 1) / quotes.length) * 100

    const toggleLike = (index: number) => {
        const next = new Set(likedQuotes)
        if (next.has(index)) next.delete(index)
        else next.add(index)
        setLikedQuotes(next)
    }

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedIndex(index)
            setTimeout(() => setCopiedIndex(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!hasInteracted) setHasInteracted(true)
        const threshold = 50
        if (info.offset.x < -threshold) {
            handleNext()
        } else if (info.offset.x > threshold) {
            handlePrev()
        }
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95,
            rotate: direction > 0 ? 5 : -5
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 30
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95,
            rotate: direction < 0 ? -5 : 5,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 30
            }
        })
    }

    return (
        <div className="w-full flex flex-col items-center py-8">
            {/* Section Header */}
            <div className="text-center mb-6">
                <span className="bg-foreground text-background px-4 py-2 brutalist-border text-sm font-bold uppercase tracking-wide">
                    Featured Quotes
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-lg mb-6 flex items-center gap-4 font-mono text-xs font-bold px-4">
                <span>{currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}</span>
                <div className="flex-grow h-2 bg-muted border-2 border-foreground relative">
                    <div
                        className="absolute top-0 left-0 h-full bg-foreground transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <span>{quotes.length < 10 ? `0${quotes.length}` : quotes.length}</span>
            </div>

            {/* Card Stage */}
            <div className="relative w-full max-w-lg aspect-[4/5] md:aspect-square px-4">
                {/* Background Stack Decoration */}
                {currentIndex < quotes.length - 1 && (
                    <div
                        className="absolute inset-4 top-7 left-7 md:top-10 md:left-10 border-2 border-black rotate-2 z-0 opacity-100 transition-colors duration-300"
                        style={{ backgroundColor: getCardColor(currentIndex + 1) }}
                    >
                        <div className="w-full h-full bg-black/5"></div>
                    </div>
                )}

                {/* Shadow Block */}
                <div className="absolute inset-4 bg-foreground translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 z-0"></div>

                {/* Active Card */}
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragEnd={onDragEnd}
                        className="absolute inset-4 border-2 border-black p-6 md:p-10 flex flex-col justify-between z-10 text-black"
                        style={{ backgroundColor: getCardColor(currentIndex), cursor: 'grab' }}
                        whileTap={{ cursor: 'grabbing' }}
                    >
                        {/* Card Header */}
                        <div className="flex justify-between items-start opacity-70">
                            <span className="font-mono text-xs font-bold uppercase tracking-widest">
                                Quote No. {currentIndex + 1}
                            </span>
                            <span className="text-4xl font-serif leading-none">"</span>
                        </div>

                        {/* Quote Text */}
                        <div className="flex-grow flex items-center justify-center my-4 overflow-y-auto select-none touch-none">
                            <p className="text-xl md:text-2xl lg:text-3xl font-black leading-tight tracking-tight text-center uppercase pointer-events-none text-balance">
                                {currentQuote.text}
                            </p>
                        </div>

                        {/* Card Footer */}
                        <div className="border-t-2 border-black pt-4 flex items-center justify-between">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider">
                                — ShareVault
                            </span>
                            <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => handleCopy(currentQuote.text, currentIndex)}
                                    className="w-10 h-10 border-2 border-transparent hover:border-black flex items-center justify-center rounded-full transition-all active:scale-95"
                                    title="Copy"
                                >
                                    {isCopied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                                <button
                                    onClick={() => toggleLike(currentIndex)}
                                    className="w-10 h-10 border-2 border-transparent hover:border-black flex items-center justify-center rounded-full transition-all active:scale-95"
                                    title="Like"
                                >
                                    <Heart
                                        size={20}
                                        className={isLiked ? 'fill-black' : ''}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Swipe Tooltip Hint */}
                        {!hasInteracted && currentIndex === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                            >
                                <div className="bg-foreground/90 text-background px-4 py-2 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-sm">
                                    <motion.div
                                        animate={{ x: [-5, 5, -5] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                    >
                                        <ArrowRight size={16} className="rotate-180" />
                                    </motion.div>
                                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                                        Swipe
                                    </span>
                                    <motion.div
                                        animate={{ x: [-5, 5, -5] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                    >
                                        <ArrowRight size={16} />
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-6 mt-8">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="w-12 h-12 border-2 border-foreground bg-background flex items-center justify-center brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px] disabled:cursor-not-allowed group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Navigate
                </div>

                {currentIndex === quotes.length - 1 ? (
                    <button
                        onClick={handleReset}
                        className="w-12 h-12 border-2 border-foreground bg-neo-green flex items-center justify-center brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
                        title="Start Over"
                    >
                        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="w-12 h-12 border-2 border-foreground bg-background flex items-center justify-center brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
                    >
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            {/* Keyboard Hint (Desktop only) */}
            <div className="hidden md:flex items-center gap-4 mt-6 text-muted-foreground">
                <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="bg-muted border border-foreground px-2 py-1 rounded">←</span>
                    <span className="bg-muted border border-foreground px-2 py-1 rounded">→</span>
                    <span className="uppercase tracking-wider ml-2">to navigate</span>
                </div>
            </div>
        </div>
    )
}
