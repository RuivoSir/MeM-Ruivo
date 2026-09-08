import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// Lista de linhas de uma tabela filtrada por uma coluna, atualizada em tempo
// real (equivalente ao onSnapshot de uma coleção no Firestore).
export function useSupabaseRows(table, column, value, { orderBy, ascending = true } = {}) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!value) {
      setRows([])
      return
    }
    let cancelled = false

    async function load() {
      let query = supabase.from(table).select('*').eq(column, value)
      if (orderBy) query = query.order(orderBy, { ascending })
      const { data, error: err } = await query
      if (cancelled) return
      if (err) setError(err.message)
      else setError('')
      setRows(data || [])
    }
    load()

    const channel = supabase
      .channel(`${table}-${column}-${value}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `${column}=eq.${value}` },
        load
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [table, column, value, orderBy, ascending])

  return { rows, error }
}

// Uma única linha, identificada por uma combinação de colunas (ex: chave
// composta), atualizada em tempo real.
export function useSupabaseRow(table, match) {
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const key = JSON.stringify(match)
  const ready = match && Object.values(match).every((v) => v !== undefined && v !== null)

  useEffect(() => {
    if (!ready) {
      setRow(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)

    async function load() {
      let query = supabase.from(table).select('*')
      Object.entries(match).forEach(([k, v]) => {
        query = query.eq(k, v)
      })
      const { data, error: err } = await query.maybeSingle()
      if (cancelled) return
      setError(err ? err.message : '')
      setRow(data || null)
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel(`row-${table}-${key}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        const affected = payload.new || payload.old
        const matches = Object.entries(match).every(([k, v]) => affected?.[k] === v)
        if (matches) load()
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, key, ready])

  return { row, loading, error }
}
