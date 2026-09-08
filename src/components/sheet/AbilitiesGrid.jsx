import { ABILITIES } from '../../data/mm3e'

export default function AbilitiesGrid({ values, onChange, readOnly, onRoll }) {
  return (
    <div className="ability-grid">
      {ABILITIES.map((a) => (
        <div key={a.key} className="ability-box">
          <span>{a.label}</span>
          <input
            type="number"
            value={values[a.key] ?? 0}
            disabled={readOnly}
            onChange={(e) => onChange({ ...values, [a.key]: Number(e.target.value) })}
          />
          {onRoll && (
            <button
              type="button"
              className="dice-btn"
              title={`Rolar teste de ${a.label}`}
              onClick={() => onRoll(a.label, Number(values[a.key]) || 0)}
            >
              🎲
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
