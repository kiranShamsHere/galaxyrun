import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import type { MissionDesign } from '../engine/types.ts'
import { supabase } from '../utils/supabase.ts'

const SharedDesign = z.object({
  scenarioId: z.string(), busId: z.string(), launchVehicleId: z.string(), orbitId: z.string(), propulsionId: z.string(),
  propellantMassKg: z.number(), developmentDurationDays: z.number(), missionDurationDays: z.number(),
  difficulty: z.enum(['easy', 'normal', 'hard']), playMode: z.enum(['mission', 'sandbox']), teamMode: z.boolean().optional(),
  instrumentIds: z.array(z.string()).min(3).max(5), solarPanelAreaM2: z.number().min(0.5).max(5),
})

export function OnlineCrewRoom({ design, onDesignChange }: { design: MissionDesign; onDesignChange: (design: MissionDesign) => void }) {
  const [room, setRoom] = useState('')
  const [draft, setDraft] = useState('')
  const [pilots, setPilots] = useState(0)
  const [status, setStatus] = useState('')
  const [isHost, setIsHost] = useState(false)
  const lastRemote = useRef('')
  const designRef = useRef(design)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)
  const pilotId = useRef(crypto.randomUUID().slice(0, 8))

  useEffect(() => {
    designRef.current = design
  }, [design])

  useEffect(() => {
    if (!supabase || !room) return
    let live = true
    const channel = supabase.channel(`crew:${room}`, { config: { presence: { key: pilotId.current }, broadcast: { self: false } } })
    channelRef.current = channel
    channel.on('presence', { event: 'sync' }, () => { if (live) setPilots(Object.keys(channel.presenceState()).length) })
      .on('broadcast', { event: 'join' }, async () => {
        if (isHost) await channel.send({ type: 'broadcast', event: 'design', payload: { design: designRef.current } })
      })
      .on('broadcast', { event: 'design' }, ({ payload }) => {
        if (!payload || typeof payload !== 'object' || !('design' in payload)) return
        const validated = SharedDesign.safeParse(payload.design)
        if (!validated.success) return
        const next = validated.data as MissionDesign
        lastRemote.current = JSON.stringify(next)
        if (live) onDesignChange(next)
      })
      .subscribe(async (state) => {
        if (state === 'SUBSCRIBED') {
          setStatus(isHost ? 'Room open · share the code with your crew' : 'Connected · asking crew for shared design')
          await channel.track({ pilot: pilotId.current, role: isHost ? 'host' : 'pilot' })
          if (isHost) await channel.send({ type: 'broadcast', event: 'design', payload: { design: designRef.current } })
          else await channel.send({ type: 'broadcast', event: 'join', payload: { pilot: pilotId.current } })
        } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') setStatus('Connection failed · try again')
      })
    return () => { live = false; channelRef.current = null; void supabase?.removeChannel(channel) }
  }, [room, isHost, onDesignChange])

  useEffect(() => {
    if (!room || !supabase) return
    const snapshot = JSON.stringify(design)
    if (snapshot === lastRemote.current) { lastRemote.current = ''; return }
    void channelRef.current?.send({ type: 'broadcast', event: 'design', payload: { design } })
  }, [design, room])

  function createRoom() {
    const code = crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase()
    setDraft(code); setIsHost(true); setPilots(0); setStatus('Connecting…'); setRoom(code)
  }
  function joinRoom() {
    const code = draft.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
    if (code.length < 4) { setStatus('Enter a room code with at least 4 characters.'); return }
    setIsHost(false); setPilots(0); setStatus('Connecting…'); setRoom(code)
  }

  async function copyRoomCode() {
    if (!room) return
    try { await navigator.clipboard.writeText(room); setStatus('Room code copied · send it to your crew') }
    catch { setStatus(`Share this room code with your crew: ${room}`) }
  }

  return <section className="panel online-crew"><div className="section-heading"><div><p className="eyebrow">LIVE CO-OP</p><h2>Online crew</h2></div><span className="live-indicator"><i />{room ? `${pilots} online` : 'Ready'}</span></div>
    {!supabase ? <p className="why-intro">Add Supabase keys to turn on shared rooms.</p> : <>
      <div className="online-room-controls"><input aria-label="Crew room code" placeholder="ROOM CODE" value={draft} maxLength={12} onChange={(e) => setDraft(e.target.value.toUpperCase())} /><button className="secondary-button" type="button" onClick={joinRoom}>Join</button><button className="secondary-button" type="button" onClick={createRoom}>New room</button></div>
      <p className="why-intro" role="status">{status || 'Create a room or enter a crew code.'} {room && <b>· {pilots} pilot{pilots === 1 ? '' : 's'}</b>}</p>
      {room && <div className="online-room-actions"><code>{room}</code><button className="secondary-button" type="button" onClick={() => void copyRoomCode()}>Copy room code</button><button className="text-button" type="button" onClick={() => { setRoom(''); setPilots(0); setStatus('Left the room.') }}>Leave room</button></div>}
    </>}
  </section>
}
