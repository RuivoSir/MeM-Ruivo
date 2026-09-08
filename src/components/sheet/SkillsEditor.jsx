import { SKILLS } from '../../data/mm3e'

export default function SkillsEditor({ ranks, abilities, onChange, readOnly, onRoll }) {
  return (
    <div className="skills-editor">
      {SKILLS.map((s) => {
        const abilityScore = Number(abilities[s.base]) || 0
        const rank = Number(ranks[s.key]) || 0
        const total = abilityScore + rank
        return (
          <div className="skills-editor__row" key={s.key}>
            <span className="skills-editor__name">
              {s.label} <em>({s.base.slice(0, 3)})</em>
            </span>
            <input
              type="number"
              value={rank}
              disabled={readOnly}
              onChange={(e) => onChange({ ...ranks, [s.key]: Number(e.target.value) })}
            />
            <span className="skills-editor__total">= {total >= 0 ? `+${total}` : total}</span>
            {onRoll && (
              <button
                type="button"
                className="dice-btn"
                title={`Rolar ${s.label}`}
                onClick={() => onRoll(s.label, total)}
              >
                🎲
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
