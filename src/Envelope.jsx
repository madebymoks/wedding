import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import envelopeGif from './assets/white_envelope.gif'
import envelopePoster from './assets/white_envelope_poster.png'

// at 2.5s into the gif, start fading a white layer in over it; once that's
// fully white, fade the whole envelope away to reveal the hero underneath —
// smoother than cutting straight from a mid-animation frame to transparent
const FADE_TO_WHITE_START_MS = 2500
const FADE_TO_WHITE_DURATION_S = 0.5
const FADE_AWAY_DURATION_S = 0.8

function Envelope({ onDismissed }) {
  const [opening, setOpening] = useState(false)
  const [whiteOut, setWhiteOut] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // warm the gif into the browser cache so playback starts instantly on tap
  useEffect(() => {
    const img = new Image()
    img.src = envelopeGif
  }, [])

  useEffect(() => {
    if (!opening) return
    const t = setTimeout(() => setWhiteOut(true), FADE_TO_WHITE_START_MS)
    return () => clearTimeout(t)
  }, [opening])

  return (
    <AnimatePresence onExitComplete={onDismissed}>
      {!dismissed && (
        <motion.div
          className="fixed inset-0 z-50 bg-beige-light"
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_AWAY_DURATION_S, ease: 'easeInOut' }}
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
            className="pointer-events-none absolute inset-x-0 bottom-14 text-center font-serif text-lg font-semibold uppercase tracking-[0.35em] text-black drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)] sm:text-xl"
            animate={
              opening
                ? { opacity: 0, y: 0 }
                : { opacity: [0.7, 1, 0.7], y: [0, -5, 0] }
            }
            transition={
              opening
                ? { duration: 0.3 }
                : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            Tap to open
          </motion.span>

          <motion.div
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: whiteOut ? 1 : 0 }}
            transition={{ duration: FADE_TO_WHITE_DURATION_S, ease: 'easeInOut' }}
            onAnimationComplete={() => {
              if (whiteOut) setDismissed(true)
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Envelope
