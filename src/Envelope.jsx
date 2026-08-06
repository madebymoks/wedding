import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import envelopeGif from './assets/envelope_animation.gif'
import envelopePoster from './assets/envelope_poster.png'

// the gif runs ~3.94s and fades to white near the end; start dismissing at
// the 2.5s mark so the fade-out finishes before the white frames appear
const GIF_DURATION_MS = 2500

function Envelope({ onDismissed }) {
  const [opening, setOpening] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // warm the gif into the browser cache so playback starts instantly on tap
  useEffect(() => {
    const img = new Image()
    img.src = envelopeGif
  }, [])

  useEffect(() => {
    if (!opening) return
    const t = setTimeout(() => setDismissed(true), GIF_DURATION_MS)
    return () => clearTimeout(t)
  }, [opening])

  return (
    <AnimatePresence onExitComplete={onDismissed}>
      {!dismissed && (
        <motion.div
          className="fixed inset-0 z-50 bg-sage-dark"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <img
            src={opening ? envelopeGif : envelopePoster}
            alt=""
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            aria-label="Open invitation"
            onClick={() => setOpening(true)}
            className="absolute inset-0 h-full w-full"
          />
          <motion.span
            className="pointer-events-none absolute inset-x-0 bottom-14 text-center font-serif text-lg uppercase tracking-[0.35em] text-beige-light/80 sm:text-xl"
            animate={
              opening
                ? { opacity: 0, y: 0 }
                : { opacity: [0.4, 1, 0.4], y: [0, -5, 0] }
            }
            transition={
              opening
                ? { duration: 0.3 }
                : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            Tap to open
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Envelope
