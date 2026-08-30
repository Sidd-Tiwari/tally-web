import './TallyMarks.css'

/**
 * Renders a count as tally marks - groups of 5 strokes (four verticals +
 * one diagonal slash), the way anyone would count by hand. This is the
 * app's signature visual: it's used for habit streaks and for the small
 * entry-count indicators around the ledger, tying "count your money" and
 * "count your days" to the same underlying idea.
 *
 * @param {number} count - how many to draw
 * @param {number} max - cap how many groups render before switching to "+N more"
 * @param {boolean} animateLast - draw-in animation on the most recent stroke
 */
export default function TallyMarks({ count = 0, max = 25, animateLast = false }) {
  if (count <= 0) {
    return <span className="tally-empty mono">—</span>
  }

  const capped = Math.min(count, max)
  const overflow = count - capped
  const groups = []
  for (let i = 0; i < capped; i += 5) {
    groups.push(Math.min(5, capped - i))
  }

  let strokeIndex = 0

  return (
    <span className="tally-marks" aria-label={`${count} tally`}>
      {groups.map((sizeInGroup, gi) => (
        <span className="tally-group" key={gi}>
          {Array.from({ length: sizeInGroup }).map((_, si) => {
            strokeIndex += 1
            const isLast = animateLast && strokeIndex === capped
            const isSlash = si === 4
            return (
              <svg
                key={si}
                className={`tally-stroke ${isSlash ? 'tally-slash' : ''} ${isLast ? 'tally-draw-in' : ''}`}
                width="7"
                height="22"
                viewBox="0 0 7 22"
              >
                {isSlash ? (
                  <line x1="0" y1="22" x2="7" y2="0" />
                ) : (
                  <line x1="3.5" y1="0" x2="3.5" y2="22" />
                )}
              </svg>
            )
          })}
        </span>
      ))}
      {overflow > 0 && <span className="tally-overflow mono">+{overflow}</span>}
    </span>
  )
}
