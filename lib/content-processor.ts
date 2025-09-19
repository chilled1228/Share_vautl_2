/**
 * Server-side content processing utilities
 * Optimized to extract quotes for React components instead of inline JavaScript
 */

export interface ExtractedQuote {
  text: string
  id: string
}

export function processContentAndExtractQuotes(content: string): {
  processedContent: string
  quotes: ExtractedQuote[]
} {
  if (!content) {
    return { processedContent: content, quotes: [] }
  }

  const quotes: ExtractedQuote[] = []
  let processedContent = content
  let quoteIndex = 0

  // Parse HTML and extract quotes, replacing with placeholder divs
  processedContent = processedContent.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    (match, quoteContent) => {
      // Extract clean text from the quote
      const cleanText = quoteContent
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Only process substantial quotes
      if (cleanText && cleanText.length >= 10) {
        const quoteId = `quote-${quoteIndex++}`
        quotes.push({ text: cleanText, id: quoteId })

        // Replace with a placeholder div where React component will be mounted
        return match.replace('</blockquote>', `<div id="${quoteId}" class="quote-actions-placeholder"></div></blockquote>`)
      }

      return match
    }
  )

  return { processedContent, quotes }
}

// Helper function to safely encode text for JavaScript
function encodeForJS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

// Generate inline JavaScript for quote actions
export function getQuoteActionsScript(): string {
  return `
    <script>
      window.copyQuote = function(text) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function() {
            showToast('Quote copied to clipboard!');
          }).catch(function(err) {
            console.error('Failed to copy text: ', err);
            fallbackCopyTextToClipboard(text);
          });
        } else {
          fallbackCopyTextToClipboard(text);
        }
      };

      window.shareQuote = function(text) {
        if (navigator.share) {
          navigator.share({
            title: 'Inspiring Quote from ShareVault',
            text: text + ' - ShareVault',
            url: window.location.href
          }).catch(function(err) {
            console.error('Error sharing:', err);
            fallbackShare(text);
          });
        } else {
          fallbackShare(text);
        }
      };

      function fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          var successful = document.execCommand('copy');
          if (successful) {
            showToast('Quote copied to clipboard!');
          } else {
            showToast('Failed to copy quote');
          }
        } catch (err) {
          console.error('Fallback: Unable to copy', err);
          showToast('Copy failed');
        }
        document.body.removeChild(textArea);
      }

      function fallbackShare(text) {
        var shareUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text + ' - ShareVault') + '&url=' + encodeURIComponent(window.location.href);
        window.open(shareUrl, '_blank');
      }

      function showToast(message) {
        var toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#1a0b2e;color:white;padding:12px 20px;border:3px solid #000;box-shadow:4px 4px 0 #000;font-weight:bold;z-index:10000;text-transform:uppercase;font-size:14px;';
        document.body.appendChild(toast);
        setTimeout(function() {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 3000);
      }
    </script>
  `
}

// Parse content and extract intro (optimized server-side version)
export function parseContentServer(content: string) {
  if (!content) {
    return {
      intro: '',
      fullContent: content,
      quotes: []
    }
  }

  // Remove HTML tags for intro text
  const textContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const intro = textContent.length > 200
    ? textContent.substring(0, 200) + '...'
    : textContent

  // Process content and extract quotes
  const { processedContent, quotes } = processContentAndExtractQuotes(content)

  return {
    intro,
    fullContent: processedContent,
    quotes
  }
}