// Testo che scorre in loop con CSS puro. Si ferma quando ci passi sopra col mouse.
import { profile } from '../data/profile.js'

const WORDS = profile.keywords

function Row() {
  return (
    <span aria-hidden="true">
      {Array.from({ length: 4 }).map((_, k) =>
        WORDS.map((w) => (
          <span key={`${k}-${w}`}>
            {w} <b>/</b>{' '}
          </span>
        ))
      )}
    </span>
  )
}

export default function Marquee() {
  return (
    <div className="marquee" role="presentation">
      <div className="marquee-track">
        <Row />
        <Row />
      </div>
    </div>
  )
}
