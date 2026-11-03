import { motion, useReducedMotion } from 'motion/react'

// Titolo che sale riga per riga da una maschera. Serve a dare gerarchia: il titolo arriva per primo.
// `accent` = indici delle righe da colorare con l'accento.
// Importante: si osserva la riga-maschera (ferma), non la parola che si muove. Una parola spostata fuori
// dalla maschera risulta "non visibile" e l'animazione non partirebbe mai.
export default function Reveal({ as = 'h2', lines, className, delay = 0, accent = [] }) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag className={className} aria-label={lines.join(' ')}>
      {lines.map((line, i) => (
        <motion.span
          className="reveal-line"
          key={line}
          aria-hidden="true"
          initial={reduce ? 'show' : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.span
            className={accent.includes(i) ? 'accent' : undefined}
            style={{ display: 'block' }}
            variants={{
              hidden: { y: '110%' },
              show: { y: 0, transition: { type: 'spring', bounce: 0, duration: 0.9, delay: delay + i * 0.09 } },
            }}
          >
            {line}
          </motion.span>
        </motion.span>
      ))}
    </Tag>
  )
}
