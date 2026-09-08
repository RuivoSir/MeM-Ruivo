import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { SUPER_ADMIN_EMAIL } from '../supabaseConfig'
import { useAuth } from './AuthContext'

export const RoomContext = createContext(null)

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem O/0, I/1 (evita confusão)

function generateCode(length = 6) {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return out
}

const CURRENT_ROOM_KEY = 'mm-current-room'

export function RoomProvider({ children }) {
  const { user, profile } = useAuth()
  const [currentRoomId, setCurrentRoomIdState] = useState(
    () => localStorage.getItem(CURRENT_ROOM_KEY) || null
  )
  const [room, setRoom] = useState(null)
  const [membership, setMembership] = useState(null)
  const [loadingRoom, setLoadingRoom] = useState(false)
  const [myRooms, setMyRooms] = useState([])

  function setCurrentRoomId(id) {
    setCurrentRoomIdState(id)
    if (id) localStorage.setItem(CURRENT_ROOM_KEY, id)
    else localStorage.removeItem(CURRENT_ROOM_KEY)
  }

  useEffect(() => {
    if (!user) {
      setMyRooms([])
      return
    }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('room_members')
        .select('room_code, role, rooms(name)')
        .eq('user_id', user.id)
      if (!cancelled) {
        setMyRooms((data || []).map((r) => ({ id: r.room_code, name: r.rooms?.name, role: r.role })))
      }
    }
    load()

    const channel = supabase
      .channel(`my-rooms-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_members', filter: `user_id=eq.${user.id}` },
        load
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  useEffect(() => {
    if (!currentRoomId || !user) {
      setRoom(null)
      setMembership(null)
      return
    }
    setLoadingRoom(true)
    let cancelled = false

    async function loadRoom() {
      const { data } = await supabase.from('rooms').select('*').eq('code', currentRoomId).maybeSingle()
      if (!cancelled) setRoom(data ? { id: data.code, ...data } : null)
    }
    async function loadMembership() {
      const { data } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_code', currentRoomId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!cancelled) setMembership(data || null)
    }

    Promise.all([loadRoom(), loadMembership()]).finally(() => {
      if (!cancelled) setLoadingRoom(false)
    })

    const channel = supabase
      .channel(`room-${currentRoomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${currentRoomId}` },
        loadRoom
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_members', filter: `room_code=eq.${currentRoomId}` },
        loadMembership
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [currentRoomId, user?.id])

  async function createRoom(name) {
    if (!user) throw new Error('Não autenticado')
    let code = generateCode()
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data } = await supabase.from('rooms').select('code').eq('code', code).maybeSingle()
      if (!data) break
      code = generateCode()
    }
    const roomName = name || `Sala de ${profile?.display_name || 'Mestre'}`
    const { error: roomError } = await supabase
      .from('rooms')
      .insert({ code, name: roomName, owner_uid: user.id })
    if (roomError) throw roomError

    const { error: memberError } = await supabase.from('room_members').insert({
      room_code: code,
      user_id: user.id,
      display_name: profile?.display_name || user.email,
      role: 'gm',
    })
    if (memberError) throw memberError

    setCurrentRoomId(code)
    return code
  }

  async function joinRoom(rawCode) {
    if (!user) throw new Error('Não autenticado')
    const code = rawCode.trim().toUpperCase()

    const { data: roomData } = await supabase.from('rooms').select('*').eq('code', code).maybeSingle()
    if (!roomData) {
      throw new Error('Sala não encontrada. Confira o código com o mestre.')
    }

    const { data: existingMember } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_code', code)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existingMember) {
      const { error } = await supabase.from('room_members').insert({
        room_code: code,
        user_id: user.id,
        display_name: profile?.display_name || user.email,
        role: 'player',
      })
      if (error) throw error
    }

    setCurrentRoomId(code)
    return code
  }

  function selectRoom(id) {
    setCurrentRoomId(id)
  }

  function leaveCurrentRoom() {
    setCurrentRoomId(null)
  }

  const isSuperAdmin = !!user?.email && user.email === SUPER_ADMIN_EMAIL
  const isGM = isSuperAdmin || membership?.role === 'gm'

  const value = {
    currentRoomId,
    room,
    membership,
    isGM,
    isSuperAdmin,
    loadingRoom,
    myRooms,
    createRoom,
    joinRoom,
    selectRoom,
    leaveCurrentRoom,
  }

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export function useRoom() {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error('useRoom deve ser usado dentro de RoomProvider')
  return ctx
}
