// Avanzamento reale del caricamento della scena 3D, letto dal loader (percentuale vera invece di una curva a tempo).
// trackLoader si passa a useGLTF (4o argomento): intercetta i byte scaricati di ogni modello.
const state = { bytes: {}, mounted: false }
const subs = new Set()
const emit = () => subs.forEach((fn) => fn())

export function trackLoader(loader) {
  const load = loader.load.bind(loader)
  loader.load = (url, onLoad, onProgress, onError) =>
    load(
      url,
      (gltf) => {
        const b = state.bytes[url]
        if (b) state.bytes[url] = [b[1], b[1]]
        emit()
        onLoad?.(gltf)
      },
      (e) => {
        if (e.lengthComputable && e.total > 0) {
          state.bytes[url] = [e.loaded, e.total]
          emit()
        }
        onProgress?.(e)
      },
      onError,
    )
}

// Il personaggio e' decodificato e messo in posa
export function markMounted() {
  state.mounted = true
  emit()
}

// 0..1: byte scaricati dei modelli noti (peso 70%), modelli montati (20%). L'ultimo 10% e' il primo frame disegnato (lo da' il loader).
export function realProgress() {
  let loaded = 0
  let total = 0
  for (const [l, t] of Object.values(state.bytes)) {
    loaded += l
    total += t
  }
  const assets = total ? loaded / total : 0
  return 0.7 * assets + (state.mounted ? 0.2 : 0)
}
