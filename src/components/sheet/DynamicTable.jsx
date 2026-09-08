// Tabela genérica de linhas editáveis, usada para Ataques, Vantagens,
// Poderes e Equipamento na ficha de personagem.
let uid = 0
function nextId() {
  uid += 1
  return `row-${Date.now()}-${uid}`
}

export function newRow(columns) {
  const row = { _id: nextId() }
  columns.forEach((c) => {
    row[c.key] = ''
  })
  return row
}

export default function DynamicTable({
  columns,
  rows,
  onChange,
  addLabel,
  readOnly,
  onRoll,
  rollKey,
  labelKey,
}) {
  const safeRows = rows && rows.length ? rows : []

  function updateCell(rowId, key, value) {
    onChange(safeRows.map((r) => (r._id === rowId ? { ...r, [key]: value } : r)))
  }

  function addRow() {
    onChange([...safeRows, newRow(columns)])
  }

  function removeRow(rowId) {
    onChange(safeRows.filter((r) => r._id !== rowId))
  }

  return (
    <div className="dyn-table">
      {safeRows.map((row) => (
        <div className="dyn-table__row" key={row._id}>
          {columns.map((col) => (
            <div className="dyn-table__cell" key={col.key} data-label={col.label}>
              {col.multiline ? (
                <textarea
                  value={row[col.key] || ''}
                  placeholder={col.label}
                  disabled={readOnly}
                  onChange={(e) => updateCell(row._id, col.key, e.target.value)}
                />
              ) : (
                <input
                  list={col.datalist ? `${col.key}-datalist` : undefined}
                  value={row[col.key] || ''}
                  placeholder={col.label}
                  disabled={readOnly}
                  onChange={(e) => updateCell(row._id, col.key, e.target.value)}
                />
              )}
            </div>
          ))}
          {onRoll && rollKey && (
            <button
              type="button"
              className="dice-btn"
              title={`Rolar ${row[labelKey] || 'dado'}`}
              onClick={() => onRoll(row[labelKey] || 'Ataque', row[rollKey])}
            >
              🎲
            </button>
          )}
          {!readOnly && (
            <button
              type="button"
              className="dyn-table__remove"
              onClick={() => removeRow(row._id)}
              aria-label="Remover linha"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {columns
        .filter((c) => c.datalist)
        .map((c) => (
          <datalist id={`${c.key}-datalist`} key={c.key}>
            {c.datalist.map((opt) => (
              <option value={opt} key={opt} />
            ))}
          </datalist>
        ))}

      {!readOnly && (
        <button type="button" className="btn-link" onClick={addRow}>
          + {addLabel || 'Adicionar linha'}
        </button>
      )}
      {safeRows.length === 0 && readOnly && <p className="muted">Nada por aqui.</p>}
    </div>
  )
}
