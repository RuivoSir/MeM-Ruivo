import { useRef, useState } from 'react'
import { PHOTOS_BUCKET, supabase } from '../../supabaseClient'

export default function PhotoUpload({ path, value, onChange, shape = 'square', label }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande (máx. 5MB).')
      return
    }
    setError('')
    setUploading(true)
    try {
      const filePath = `${path}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(filePath)
      onChange(data.publicUrl)
    } catch (err) {
      setError('Falha ao enviar imagem: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className={`photo-upload photo-upload--${shape}`}>
      <div
        className="photo-upload__preview"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {value ? (
          <img src={value} alt={label || 'foto'} />
        ) : (
          <span className="photo-upload__placeholder">{uploading ? '...' : '📷'}</span>
        )}
        {uploading && <div className="photo-upload__spinner" />}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />
      <div className="photo-upload__actions">
        <button type="button" className="btn-link" onClick={() => inputRef.current?.click()}>
          {value ? 'Trocar foto' : 'Enviar foto'}
        </button>
        {value && (
          <button type="button" className="btn-link btn-link--danger" onClick={() => onChange('')}>
            Remover
          </button>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
