import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/common/ThemeToggle'

export default function LoginPage() {
  const { user, login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/salas" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!displayName.trim()) throw new Error('Escolha um nome de herói/jogador.')
        const { needsEmailConfirmation } = await register(email, password, displayName.trim())
        if (needsEmailConfirmation) {
          setInfo('Conta criada! Confirme seu e-mail (veja a caixa de entrada) e depois faça login.')
          setMode('login')
        }
      }
    } catch (err) {
      setError(traduzErro(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <ThemeToggle className="theme-toggle--corner" />
        <div className="auth-logo">
          <span>🦸</span>
          <h1>Mutantes &amp; Malfeitores</h1>
          <p>Fichas, contatos, mapas e notícias da sua mesa de RPG.</p>
        </div>

        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => setMode('login')}
            type="button"
          >
            Entrar
          </button>
          <button
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => setMode('register')}
            type="button"
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <label>
              Nome de exibição
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como quer ser chamado na mesa"
                required
              />
            </label>
          )}
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </label>

          {info && <p className="muted">{info}</p>}
          {error && <p className="field-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}

function traduzErro(err) {
  const msg = err?.message || ''
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar (veja o link que enviamos na sua caixa de entrada).'
  }
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'Este e-mail já está cadastrado.'
  }
  if (msg.includes('Password should be at least')) return 'Senha muito curta (mínimo 6 caracteres).'
  if (msg.includes('Unable to validate email')) return 'E-mail inválido.'
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Não foi possível conectar ao Supabase. Confira src/supabaseConfig.js.'
  }
  return msg || 'Algo deu errado, tente novamente.'
}
