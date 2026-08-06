import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Envelope from './Envelope'
import { supabase } from './lib/supabase'
import brideGroomVideo from './assets/brideandgroom.mp4'
import decorative from './assets/decorative.png'
import drapes from './assets/drapes.png'
import dinner from './assets/dinner.jpeg'
import dateNight from './assets/date-night.jpeg'
import onABoat from './assets/onaboat.jpeg'
import proposal from './assets/proposal.jpeg'
import proposalOther from './assets/proposal-other.jpeg'
import dresscode from './assets/dresscode.png'
import gift from './assets/gift.png'
import ululation from './assets/ululation.mp3'

// ---------------------------------------------------------------------------
// All wedding details in one place — edit these.
// ---------------------------------------------------------------------------
const WEDDING = {
  bride: 'Mookamedi',
  groom: 'Kago',
  names: 'Mookamedi & Kago',
  dateLabel: '17 October 2026',
  dateTime: '2026-10-17T14:00:00',
  welcome:
    'We warmly invite you to celebrate our wedding day with us. We look forward to sharing this unforgettable moment with our most special people.',
  venue: {
    name: 'Molapo Gardens',
    address: 'Xhosa 1, Mahalapye',
    time: '14:00',
    mapsUrl: 'https://maps.google.com',
  },
  programme: [
    { time: '14:00', label: 'Arrival' },
    { time: '14:30', label: 'Ceremony' },
    { time: '16:00', label: 'Cocktails' },
    { time: '18:00', label: 'Dinner' },
    { time: '21:00', label: 'Dancing' },
  ],
  dressCode:
    'Dress to impress — anything from smart casual to formal attire is welcome',
  otherEvents: [
    {
      title: 'Welcome Drinks',
      date: 'Friday, 16 October 2026',
      time: '8:00 PM',
      place: 'To be announced',
    },
    {
      title: 'Farewell Brunch',
      date: 'Sunday, 18 October 2026',
      time: '12:00 PM',
      place: 'To be announced',
    },
  ],
  hotels: [
    {
      name: 'Hotel One',
      distance: '1.5 km from the venue',
      phone: '+00 000 000 000',
      email: 'reservations@hotelone.com',
      promo: 'WEDDING2026',
    },
    {
      name: 'Hotel Two',
      distance: '3 km from the venue',
      phone: '+00 000 000 000',
      email: 'stay@hoteltwo.com',
      promo: null,
    },
  ],
  gifts: {
    message:
      'Your presence is our greatest gift. If you wish to give us something, please find our details below:',
    mobileMoney: [
      { label: 'Pay2Cell', number: '74859633' },
      { label: 'Ewallet', number: '74859633' },
      { label: 'Cashsend', number: '74859633' },
      { label: 'InstantMoney', number: '74859633' },
      { label: 'Orange Money', number: '74859633' },
    ],
    bank: {
      name: 'Standard Chartered Bank Botswana',
      accountName: 'Kago S Makgatlhe',
      accountNumber: '01004 0254 0500',
      branch: '660167',
    },
  },
  gallery: [
    { image: dinner, caption: 'Dinner' },
    { image: dateNight, caption: 'Date night' },
    { image: onABoat, caption: 'On a boat' },
    { image: proposal, caption: 'The proposal' },
    { image: proposalOther, caption: 'The proposal' },
  ],
}

// ---------------------------------------------------------------------------

const heroGroupVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.25, delayChildren: 0.15 },
  },
}

const heroItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

// scroll-triggered fade-in used by every section as the user scrolls past it
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const fadeInUpDelayed = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut', delay: 0.15 },
  },
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  }
}

function Section({
  id,
  title,
  subtitle,
  subtitleClassName = '',
  className = '',
  contentClassName = 'mt-10',
  children,
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-xl px-6 py-8 sm:py-10 ${className}`}>
      <motion.div
        className="text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeInUp}
      >
        {title && (
          <h2 className="font-script text-4xl text-sage-dark sm:text-5xl">
            {title}
          </h2>
        )}
        {subtitle && (
          <p
            className={`mt-3 font-serif text-base uppercase tracking-[0.3em] text-sage-dark/70 sm:text-lg ${subtitleClassName}`}
          >
            {subtitle}
          </p>
        )}
      </motion.div>
      <motion.div
        className={contentClassName}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUpDelayed}
      >
        {children}
      </motion.div>
    </section>
  )
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl bg-beige-light/95 p-8 text-center font-serif text-sage-dark shadow-[0_10px_30px_rgba(0,0,0,0.12)] ${className}`}
    >
      {children}
    </div>
  )
}

const SLIDE_INTERVAL_MS = 3500
const SLIDE_WIDTH_RATIO = 0.76 // center slide's width as a fraction of the carousel
const SLIDE_GAP = 16 // px
const SLIDE_TRANSITION = { duration: 0.65, ease: 'easeInOut' }

// peek carousel: the current slide sits centered and full-height, with the
// previous/next slides peeking in from the edges — looks and loops like the
// reference site's photo gallery (real slides padded with one clone on each
// end so advancing past the last slide wraps to the first with no visible cut)
function Carousel({ slides }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [index, setIndex] = useState(1)
  const [instant, setInstant] = useState(false)

  const extended = [slides[slides.length - 1], ...slides, slides[0]]

  useEffect(() => {
    const measure = () => setContainerWidth(containerRef.current?.offsetWidth ?? 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setInstant(false)
      setIndex((i) => i + 1)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  // once we've slid onto the trailing clone, snap back to the real first
  // slide without animating so the loop reads as seamless
  useEffect(() => {
    if (index !== extended.length - 1) return
    const t = setTimeout(() => {
      setInstant(true)
      setIndex(1)
    }, SLIDE_TRANSITION.duration * 1000)
    return () => clearTimeout(t)
  }, [index, extended.length])

  const slideWidth = containerWidth * SLIDE_WIDTH_RATIO
  const step = slideWidth + SLIDE_GAP
  const centerOffset = (containerWidth - slideWidth) / 2
  const x = -(index * step) + centerOffset

  return (
    <div>
      <div ref={containerRef} className="overflow-hidden">
        {containerWidth > 0 && (
          <motion.div
            className="flex"
            style={{ gap: SLIDE_GAP }}
            animate={{ x }}
            transition={instant ? { duration: 0 } : SLIDE_TRANSITION}
          >
            {extended.map((slide, i) => (
              <div
                key={i}
                style={{ width: slideWidth }}
                className="relative aspect-[3/4] shrink-0 overflow-hidden rounded-2xl bg-sage-light/50"
              >
                <img
                  src={slide.image}
                  alt={slide.caption}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function Countdown() {
  const { days, hours, minutes, seconds } = useCountdown(WEDDING.dateTime)
  const units = [
    [days, 'Days'],
    [hours, 'Hours'],
    [minutes, 'Minutes'],
    [seconds, 'Seconds'],
  ]
  return (
    <div className="flex justify-center gap-6">
      {units.map(([value, label]) => (
        <div key={label} className="text-center">
          <div className="font-serif text-4xl text-sage-dark tabular-nums">
            {String(value).padStart(2, '0')}
          </div>
          <div className="mt-1 font-serif text-sm uppercase tracking-[0.25em] text-sage-dark/70">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

// leaves the panels resting inward over the card's edges rather than sliding
// fully off it, so the idle pendulum sway stays visible instead of animating off-screen
const CURTAIN_OPEN_X = 58
const CURTAIN_OPEN_TRANSITION = { duration: 1.4, ease: [0.22, 1, 0.36, 1] }
const CURTAIN_SWING_TRANSITION = {
  duration: 5.5,
  repeat: Infinity,
  ease: 'easeInOut',
}

// the countdown card starts hidden behind two mirrored drape panels that
// slide apart to reveal it, then settle into a gentle pendulum-like sway
function CountdownCard() {
  const [opened, setOpened] = useState(false)
  const [swinging, setSwinging] = useState(false)

  return (
    <motion.div
      className="relative"
      onViewportEnter={() => setOpened(true)}
      viewport={{ once: true, amount: 0.6 }}
    >
      <div className="pt-12 text-center">
        <h2 className="font-script text-4xl text-sage-dark sm:text-5xl">
          Counting down
        </h2>
        <p className="mt-3 font-serif text-base uppercase tracking-[0.3em] text-sage-dark/70 sm:text-lg">
          Until we say yes
        </p>
        <div className="mt-8">
          <Countdown />
        </div>
      </div>

      <motion.img
        src={drapes}
        alt=""
        className="pointer-events-none absolute left-0 top-0 z-20 w-[38%] origin-top select-none"
        style={{ scaleX: -1 }}
        initial={{ x: '0%', rotate: 0 }}
        animate={
          swinging
            ? { x: `-${CURTAIN_OPEN_X}%`, rotate: [0, -3, 2.5, -1.5, 0] }
            : { x: opened ? `-${CURTAIN_OPEN_X}%` : '0%', rotate: 0 }
        }
        transition={swinging ? CURTAIN_SWING_TRANSITION : CURTAIN_OPEN_TRANSITION}
        onAnimationComplete={() => {
          if (opened && !swinging) setSwinging(true)
        }}
      />
      <motion.img
        src={drapes}
        alt=""
        className="pointer-events-none absolute right-0 top-0 z-20 w-[38%] origin-top select-none"
        initial={{ x: '0%', rotate: 0 }}
        animate={
          swinging
            ? { x: `${CURTAIN_OPEN_X}%`, rotate: [0, 3, -2.5, 1.5, 0] }
            : { x: opened ? `${CURTAIN_OPEN_X}%` : '0%', rotate: 0 }
        }
        transition={
          swinging
            ? { ...CURTAIN_SWING_TRANSITION, delay: 0.25 }
            : { ...CURTAIN_OPEN_TRANSITION, delay: 0.1 }
        }
      />
    </motion.div>
  )
}

const rsvpSchema = Yup.object({
  name: Yup.string().trim().required('Please enter your name'),
  attending: Yup.string()
    .oneOf(['yes', 'no'])
    .required('Please let us know if you can make it'),
  partySize: Yup.number()
    .min(1, 'At least 1 person')
    .max(10, 'Max 10 people')
    .required('Please enter your party size'),
  mobileNumber: Yup.string()
    .trim()
    .matches(/^[0-9+()\- ]{7,20}$/, 'Enter a valid mobile number')
    .required('Please enter your mobile number'),
  message: Yup.string().max(500, 'Keep it under 500 characters'),
})

function Rsvp() {
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const formik = useFormik({
    initialValues: {
      name: '',
      attending: 'yes',
      partySize: 1,
      mobileNumber: '',
      message: '',
    },
    validationSchema: rsvpSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError('')
      const { error } = await supabase.from('rsvps').insert({
        name: values.name.trim(),
        attending: values.attending,
        party_size: values.partySize,
        mobile_number: values.mobileNumber.trim(),
        message: values.message.trim() || null,
      })
      setSubmitting(false)
      if (error) {
        setSubmitError('Something went wrong sending your RSVP. Please try again.')
        return
      }
      setSent(true)
    },
  })

  const setPartySize = (next) => {
    formik.setFieldValue('partySize', Math.min(10, Math.max(1, next)))
  }

  if (sent) {
    return (
      <Card>
        <p className="font-script text-4xl">Thank you!</p>
        <p className="mt-4 text-xl">
          {formik.values.attending === 'yes'
            ? "Your RSVP has been received. We can't wait to celebrate with you."
            : "Your RSVP has been received. You'll be missed on the day!"}
        </p>
      </Card>
    )
  }

  return (
    <Card className="text-left">
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6" noValidate>
        <label className="block">
          <span className="mb-1 block text-lg uppercase tracking-widest text-sage-dark/70">
            Name
          </span>
          <input
            type="text"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Full name"
            className="w-full rounded-lg border border-sage-dark/30 bg-white/80 px-4 py-2"
          />
          {formik.touched.name && formik.errors.name && (
            <span className="mt-1 block text-lg text-red-700">
              {formik.errors.name}
            </span>
          )}
        </label>

        <fieldset>
          <legend className="mb-3 text-xl font-medium">
            Will you be attending?
          </legend>
          {[
            ['yes', "Yes, I'll be there"],
            ['no', "Unfortunately, I can't make it"],
          ].map(([value, label]) => (
            <label key={value} className="mb-2 flex items-center gap-3">
              <input
                type="radio"
                name="attending"
                value={value}
                checked={formik.values.attending === value}
                onChange={formik.handleChange}
                className="accent-sage-dark"
              />
              {label}
            </label>
          ))}
        </fieldset>

        <div>
          <span className="mb-3 block text-xl font-medium">
            Number of people in your party
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPartySize(formik.values.partySize - 1)}
              className="h-10 w-10 rounded-lg border border-sage-dark/30 text-xl"
              aria-label="Fewer people"
            >
              −
            </button>
            <span className="w-6 text-center text-xl tabular-nums">
              {formik.values.partySize}
            </span>
            <button
              type="button"
              onClick={() => setPartySize(formik.values.partySize + 1)}
              className="h-10 w-10 rounded-lg border border-sage-dark/30 text-xl"
              aria-label="More people"
            >
              +
            </button>
          </div>
          {formik.touched.partySize && formik.errors.partySize && (
            <span className="mt-1 block text-lg text-red-700">
              {formik.errors.partySize}
            </span>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-lg uppercase tracking-widest text-sage-dark/70">
            Mobile number
          </span>
          <input
            type="tel"
            name="mobileNumber"
            value={formik.values.mobileNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. 072 123 4567"
            className="w-full rounded-lg border border-sage-dark/30 bg-white/80 px-4 py-2"
          />
          {formik.touched.mobileNumber && formik.errors.mobileNumber && (
            <span className="mt-1 block text-lg text-red-700">
              {formik.errors.mobileNumber}
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-lg uppercase tracking-widest text-sage-dark/70">
            Message for the bride and groom
          </span>
          <textarea
            rows={4}
            name="message"
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Is there anything you'd like to tell us? (optional)"
            className="w-full rounded-lg border border-sage-dark/30 bg-white/80 px-4 py-2"
          />
          {formik.touched.message && formik.errors.message && (
            <span className="mt-1 block text-lg text-red-700">
              {formik.errors.message}
            </span>
          )}
        </label>

        {submitError && (
          <span className="block text-center text-lg text-red-700">{submitError}</span>
        )}

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="rounded-xl bg-sage-dark py-3 font-serif text-xl tracking-widest text-beige-light disabled:opacity-60"
        >
          {formik.isSubmitting ? 'Sending…' : 'Send RSVP'}
        </button>
      </form>
    </Card>
  )
}

const ULULATION_REPEAT_MS = 30000
// matches the `lg:hidden` breakpoint the envelope/hero are wrapped in —
// desktop never shows an envelope, so it counts as "past" it immediately
const DESKTOP_QUERY = '(min-width: 1024px)'

function App() {
  const [heroVisible, setHeroVisible] = useState(false)
  const [muted, setMuted] = useState(false)
  const [pastEnvelope, setPastEnvelope] = useState(false)
  const audioRef = useRef(null)

  // every load/reload should start at the very top — on mobile that means
  // the envelope, on desktop the top of the two-column layout — never
  // wherever the browser last remembered the user had scrolled to
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  const playUlulation = () => {
    audioRef.current?.play().catch(() => {})
  }

  // desktop has no envelope to dismiss, so the user counts as "past" it
  // as soon as the page loads; mobile flips this from the envelope's
  // onDismissed handler instead, once the tap gives us a clear user gesture
  useEffect(() => {
    if (window.matchMedia(DESKTOP_QUERY).matches) setPastEnvelope(true)
  }, [])

  // once past the envelope, play immediately, then every 30s after that
  useEffect(() => {
    if (!pastEnvelope) return
    playUlulation()
    const id = setInterval(playUlulation, ULULATION_REPEAT_MS)
    return () => clearInterval(id)
  }, [pastEnvelope])

  const toggleMuted = () => {
    setMuted((wasMuted) => {
      const next = !wasMuted
      if (!next) playUlulation()
      return next
    })
  }

  return (
    <motion.div className="relative overflow-x-hidden bg-beige-light">
      <audio ref={audioRef} src={ululation} muted={muted} />

      <button
        type="button"
        onClick={toggleMuted}
        aria-label={muted ? 'Unmute sound' : 'Mute sound'}
        className="fixed bottom-6 right-6 z-60 flex h-12 w-12 items-center justify-center rounded-full bg-sage-dark text-beige-light shadow-lg transition-transform hover:scale-105"
      >
        {muted ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9v6h4l5 5V4L7 9H3Z" />
            <path d="M17 9l5 6M22 9l-5 6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9v6h4l5 5V4L7 9H3Z" />
            <path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" />
          </svg>
        )}
      </button>

      {/* mobile/tablet only: tap-to-open envelope, then the full-screen hero.
          computers skip straight to the two-column layout below */}
      <div className="lg:hidden">
      <Envelope
        onDismissed={() => {
          setHeroVisible(true)
          setPastEnvelope(true)
        }}
      />

      {/* 1. Hero — looping video */}
      <section
        id="hero"
        className="relative flex min-h-screen flex-col overflow-hidden"
      >
        <video
          src={brideGroomVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />

        <motion.div
          className="contents"
          variants={heroGroupVariants}
          initial="hidden"
          animate={heroVisible ? 'visible' : 'hidden'}
        >
          {/* top: eyebrow + couple's names */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 pt-36 text-center text-beige-light sm:gap-10 sm:pt-44">
            <motion.p
              variants={heroItemVariants}
              className="font-serif text-base uppercase tracking-[0.4em] sm:text-lg"
            >
              We&apos;re getting married
            </motion.p>
            <motion.h1
              variants={heroItemVariants}
              className="font-script leading-[1.15]"
            >
              <span className="block text-5xl sm:text-7xl">{WEDDING.bride}</span>
              <span className="block text-2xl sm:text-3xl">&amp;</span>
              <span className="block text-5xl sm:text-7xl">{WEDDING.groom}</span>
            </motion.h1>
          </div>

          {/* bottom: divider, date, RSVP */}
          <div className="relative z-10 mt-auto px-6 pb-6 text-center text-beige-light sm:pb-10">
            <motion.hr
              variants={heroItemVariants}
              className="mx-auto w-16 border-beige-light/50"
            />
            <motion.p
              variants={heroItemVariants}
              className="mt-4 font-serif text-xl font-medium tracking-[0.15em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] sm:text-3xl"
            >
              {WEDDING.dateLabel}
            </motion.p>
            <motion.a
              variants={heroItemVariants}
              href="#rsvp"
              className="mt-6 inline-block rounded-full border border-beige-light bg-black/25 px-8 py-3 font-serif text-lg uppercase tracking-[0.3em] shadow-lg backdrop-blur-sm transition-colors hover:bg-beige-light/20"
            >
              RSVP
            </motion.a>
            <a
              href="#welcome"
              aria-label="Scroll down"
              className="mt-4 block animate-bounce text-3xl text-beige-light drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            >
              ↓
            </a>
          </div>
        </motion.div>
      </section>
      </div>

      {/* computers: two-column layout — content sections on the left,
          RSVP pinned on the right. Mobile/tablet just stacks everything
          in document order, same as before */}
      <div className="lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-2 lg:items-start lg:gap-x-16 lg:px-6 lg:py-16">
        <div>

      {/* 2. Welcome */}
      <Section id="welcome" title="Join Us To Celebrate Our Wedding" className="mt-6">
        <p className="text-center font-serif text-2xl leading-relaxed text-sage-dark italic">
          {WEDDING.welcome}
        </p>
      </Section>

      {/* 3. Venue */}
      <Section id="venue" title="The Venue" subtitle="Where we celebrate">
        <div className="relative">
          <img
            src={decorative}
            alt=""
            className="pointer-events-none absolute -left-12 -top-16 z-10 w-28 -rotate-90 select-none sm:-left-16 sm:-top-20 sm:w-36"
          />
          <img
            src={decorative}
            alt=""
            className="pointer-events-none absolute -bottom-16 -right-12 z-10 w-28 rotate-90 select-none sm:-bottom-20 sm:-right-16 sm:w-36"
          />
          <Card>
            <p className="font-script text-4xl">{WEDDING.venue.name}</p>
            <p className="mt-6 text-xl italic">
              {WEDDING.dateLabel} · {WEDDING.venue.time}
            </p>
            <hr className="mx-auto my-6 w-24 border-sage-dark/20" />
            <p className="text-xl">{WEDDING.venue.address}</p>
            {/* <a
              href={WEDDING.venue.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block font-serif text-lg uppercase tracking-[0.3em] text-sage underline underline-offset-4"
            >
              Google Maps
            </a> */}
          </Card>
        </div>
      </Section>

      {/* 4. Countdown */}
      <Section id="countdown" contentClassName="mt-2">
        <CountdownCard />
      </Section>

      {/* 5. Day programme — vertical timeline
      <Section
        id="programme"
        title="Day Programme"
        subtitle={WEDDING.dateLabel}
        subtitleClassName="text-base sm:text-lg"
      >
        <div className="relative mx-auto max-w-md">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-sage-dark/30" />
          {WEDDING.programme.map((item, i) => (
            <div
              key={item.time}
              className={`relative mb-10 w-1/2 ${i % 2 === 0 ? 'left-1/2 pl-8 text-left' : 'pr-8 text-right'}`}
            >
              <span className="absolute top-2 h-2 w-2 rounded-full bg-sage-dark"
                style={i % 2 === 0 ? { left: -4 } : { right: -4 }}
              />
              <p className="font-serif text-2xl text-sage-dark">{item.time}</p>
              <p className="font-serif text-sm uppercase tracking-[0.25em] text-sage-dark/80">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Section>
      */}

      {/* 6. Dress code */}
      <Section id="dress-code" contentClassName="mt-2">
        <div className="flex flex-col items-center gap-6">
          <img
            src={dresscode}
            alt=""
            className="w-1/3 max-w-32 select-none"
          />
          <h2 className="font-script text-4xl text-sage-dark sm:text-5xl">
            Dress Code
          </h2>
          <p className="text-center text-xl italic text-sage-dark">
            {WEDDING.dressCode}
          </p>
        </div>
      </Section>

      {/* 7. Other events
      <Section id="events" title="Join us also">
        <div className="flex flex-col gap-6">
          {WEDDING.otherEvents.map((ev) => (
            <Card key={ev.title}>
              <p className="font-script text-4xl">{ev.title}</p>
              <p className="mt-4 text-lg">{ev.date}</p>
              <p className="text-lg">{ev.time}</p>
              <p className="mt-2 italic text-sage-dark/80">{ev.place}</p>
            </Card>
          ))}
        </div>
      </Section>
      */}

      {/* 8. Getting there — removed */}

      {/* 9. Accommodation
      <Section id="hotels" title="Where to stay">
        <div className="flex flex-col gap-6">
          {WEDDING.hotels.map((h) => (
            <Card key={h.name}>
              <p className="font-serif text-xl uppercase tracking-[0.2em]">
                {h.name}
              </p>
              <p className="mt-2 italic">{h.distance}</p>
              <p className="mt-4">{h.phone}</p>
              <p>{h.email}</p>
              {h.promo && (
                <p className="mt-3 text-sm uppercase tracking-widest">
                  Promo code: {h.promo}
                </p>
              )}
            </Card>
          ))}
        </div>
      </Section>
      */}

      {/* 10. Gifts */}
      <Section id="gifts" contentClassName="mt-2">
        <div className="flex flex-col items-center">
          <img src={gift} alt="" className="w-1/3 max-w-32 select-none" />
          <h2 className="mt-6 font-script text-4xl text-sage-dark sm:text-5xl">
            Gifts
          </h2>
          <Card className="mt-10 px-10 sm:px-14">
            <p className="text-xl italic leading-relaxed">
              {WEDDING.gifts.message}
            </p>
            <div className="mt-6 space-y-2 text-left font-serif text-lg tracking-wide">
              {WEDDING.gifts.mobileMoney.map((m) => (
                <p key={m.label}>
                  {m.label} - {m.number}
                </p>
              ))}
            </div>
            <hr className="mx-auto my-6 w-24 border-sage-dark/20" />
            <div className="space-y-2 text-left font-serif text-lg tracking-wide">
              <p>Bank Name - {WEDDING.gifts.bank.name}</p>
              <p>Acc Name - {WEDDING.gifts.bank.accountName}</p>
              <p>Acc Number - {WEDDING.gifts.bank.accountNumber}</p>
              <p>Branch - {WEDDING.gifts.bank.branch}</p>
            </div>
          </Card>
        </div>
      </Section>

        </div>

        {/* 11. Gallery — auto-looping carousel; hidden on computers */}
        <div className="lg:hidden">
          <Section id="gallery" title="Our moments">
            <Carousel slides={WEDDING.gallery} />
          </Section>
        </div>

        {/* 12. RSVP — pinned in the right column on computers */}
        <div className="lg:sticky lg:top-16 lg:self-start">
          <Section id="rsvp" title="RSVP" subtitle="Let us know if you can make it">
            <Rsvp />
          </Section>
        </div>
      </div>

      {/* 13. Footer */}
      <footer className="bg-sage-dark px-6 pb-16 pt-16 text-center text-beige-light">
        <motion.p
          className="font-script text-5xl sm:text-6xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeInUp}
        >
          {WEDDING.names}
        </motion.p>
      </footer>
    </motion.div>
  )
}

export default App
