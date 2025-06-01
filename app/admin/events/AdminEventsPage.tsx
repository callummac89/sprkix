

'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminEventsPage() {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    date: '',
    promotion: '',
    posterUrl: '',
    description: '',
    type: 'tv',
    tmdbId: ''
  })
  const [message, setMessage] = useState('')
  const [events, setEvents] = useState<{ id: string; title: string; date: string }[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    }
    fetchEvents()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const body = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    }

    const res = await fetch('/api/admin/add-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (res.ok) {
      setMessage('✅ Event added!')
      setForm({
        title: '',
        slug: '',
        date: '',
        promotion: '',
        posterUrl: '',
        description: '',
        type: 'tv',
        tmdbId: ''
      })
      const updatedRes = await fetch('/api/events')
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json()
        setEvents(updatedData)
      }
    } else {
      setMessage('❌ Error adding event')
    }
  }

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <h1 className="text-3xl font-extrabold mb-6 text-black">Add New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow border border-gray-300 max-w-xl">
        <input className="w-full border p-2 text-black" placeholder="Title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
        <input className="w-full border p-2 text-black" placeholder="Slug (optional)" value={form.slug} onChange={(e) => update('slug', e.target.value)} />
        <input className="w-full border p-2 text-black" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} required />
        <input className="w-full border p-2 text-black" placeholder="Promotion (e.g. WWE)" value={form.promotion} onChange={(e) => update('promotion', e.target.value)} required />
        <select className="w-full border p-2 text-black" value={form.type} onChange={(e) => update('type', e.target.value)}>
          <option value="tv">TV</option>
          <option value="ppv">PPV</option>
        </select>
        <input className="w-full border p-2 text-black" placeholder="TMDb ID (optional)" value={form.tmdbId} onChange={(e) => update('tmdbId', e.target.value)} />
        <input className="w-full border p-2 text-black" placeholder="Poster URL" value={form.posterUrl} onChange={(e) => update('posterUrl', e.target.value)} />
        <input
          type="file"
          accept="image/*"
          className="w-full border p-2 text-black"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              update('posterUrl', `/posters/${file.name}`)
            }
          }}
        />
        <textarea className="w-full border p-2 text-black" placeholder="Description" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded shadow" type="submit">Add Event</button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>

      <hr className="my-10 border-gray-300" />

      <h2 className="text-2xl font-bold mb-4 text-black">All Events</h2>
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-xl mb-4 p-2 border border-gray-300 rounded text-black"
      />
      <ul className="space-y-2 max-w-xl">
        {events
          .filter(event => event.title.toLowerCase().includes(search.toLowerCase()))
          .map(event => (
            <li key={event.id} className="flex justify-between items-center bg-white p-3 rounded shadow border border-gray-200 gap-4">
              <div>
                <p className="text-black font-semibold">{event.title}</p>
                <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/events/${event.id}/edit`} title="Edit" className="text-yellow-500 hover:text-yellow-700">
                  ✏️
                </Link>
                <button
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
                      const res = await fetch(`/api/admin/delete-event/${event.id}`, { method: 'DELETE' })
                      if (res.ok) {
                        setEvents(events.filter(e => e.id !== event.id))
                      } else {
                        alert('Failed to delete event.')
                      }
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}