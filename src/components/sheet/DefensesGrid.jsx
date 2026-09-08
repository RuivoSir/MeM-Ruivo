import { ABILITIES, DEFENSES } from '../../data/mm3e'

// Defesa = graduação da habilidade base + graduações compradas na defesa —
// o total é sempre calculado, igual às perícias, então não dá pra digitar
// um número errado por engano.
export default function DefensesGrid({ ranks, abilities, onChange, readOnly }) {
  const abilityLabel = (key) => ABILITIES.find((a) => a.key === key)?.label.slice(0, 3)

  return (
    <div className="defense-grid">
      {DEFENSES.map((d) => {
        const abilityScore = Number(abilities[d.base]) || 0
        const rank = Number(ranks[d.key]) || 0
        const total = abilityScore + rank
        return (
          <div key={d.key} className="defense-box">
            <span>
              {d.label} <em>({abilityLabel(d.base)})</em>
            </span>
            <input
              type="number"
              value={rank}
              disabled={readOnly}
              onChange={(e) => onChange({ ...ranks, [d.key]: Number(e.target.value) })}
            />
            <span className="defense-box__total">= {total}</span>
          </div>
        )
      })}
    </div>
  )
}
