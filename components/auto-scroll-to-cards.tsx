'use client'

import { useEffect } from 'react'

export default function AutoScrollToCards() {
    useEffect(() => {
        // Small delay to ensure the page is fully loaded
        const timer = setTimeout(() => {
            const cardsSection = document.getElementById('quote-cards')
            if (cardsSection) {
                cardsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [])

    return null
}
