// Striscia di testo in loop (TextLoop di React Bits): nastro lime con le parole chiave. Si ferma col mouse sopra.
import TextLoop from './TextLoop.jsx'
import { profile } from '../data/profile.js'

export default function Marquee() {
  return (
    <div className="marquee" role="presentation">
      <TextLoop
        className="marquee-loop"
        text={profile.keywords.join(' ✦ ')}
        separator="✦"
        shape="wave"
        speed={90}
        curviness={40}
        fontSize={28}
        fontWeight={800}
        letterSpacing={2}
        ribbon
        ribbonColor="#c4f25b"
        ribbonWidth={52}
        pauseOnHover
      />
    </div>
  )
}
