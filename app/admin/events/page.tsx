'use client'
import { useState } from 'react'

export default function AdminEventsPage() {
    const [form, setForm] = useState({
        title: '',
        slug: '',
        date: '',
        promotion: '',
        posterUrl: '',
        description: '',
        profightdbUrl: '',
    })
    const [message, setMessage] = useState('')

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
                title: '', slug: '', date: '', promotion: '',
                posterUrl: '', description: '', profightdbUrl: ''
            })
        } else {
            setMessage('❌ Error adding event')
        }
    }

    const update = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Add New Event</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow max-w-xl">
                <input className="w-full border p-2" placeholder="Title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
                <input className="w-full border p-2" placeholder="Slug (optional)" value={form.slug} onChange={(e) => update('slug', e.target.value)} />
                <input className="w-full border p-2" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} required />
                <input className="w-full border p-2" placeholder="Promotion (e.g. WWE)" value={form.promotion} onChange={(e) => update('promotion', e.target.value)} required />
                <input className="w-full border p-2" placeholder="Poster URL" value={form.posterUrl} onChange={(e) => update('posterUrl', e.target.value)} />
                <textarea className="w-full border p-2" placeholder="Description" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
                <input className="w-full border p-2" placeholder="ProfightDB URL" value={form.profightdbUrl} onChange={(e) => update('profightdbUrl', e.target.value)} />
                <button className="bg-black text-white px-4 py-2 rounded" type="submit">Add Event</button>
                {message && <p className="text-sm mt-2">{message}</p>}
            </form>
        </div>
    )
}