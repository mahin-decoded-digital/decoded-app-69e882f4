import { Router } from 'express'
import { db } from '../lib/db.js'

type RecordStatus = 'draft' | 'active' | 'archived'

interface RecordBody {
  title?: string
  description?: string
  status?: string
  owner?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

interface RecordDoc {
  id: string
  title: string
  description: string
  status: RecordStatus
  owner: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

const router = Router()

const VALID_STATUSES: RecordStatus[] = ['draft', 'active', 'archived']

const toRecord = (doc: Record<string, unknown> | null): RecordDoc | null => {
  if (!doc) return null

  return {
    id: String(doc._id ?? ''),
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    status: VALID_STATUSES.includes(String(doc.status ?? '') as RecordStatus)
      ? (String(doc.status) as RecordStatus)
      : 'draft',
    owner: String(doc.owner ?? ''),
    createdAt: String(doc.createdAt ?? ''),
    updatedAt: String(doc.updatedAt ?? ''),
    deletedAt: doc.deletedAt == null ? null : String(doc.deletedAt),
  }
}

const validateInput = (body: RecordBody): { error: string | null; value: Omit<RecordDoc, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> } => {
  const title = String(body.title ?? '').trim()
  const description = String(body.description ?? '').trim()
  const owner = String(body.owner ?? '').trim()
  const status = String(body.status ?? '').trim()

  if (!title) {
    return { error: 'Title is required.', value: { title: '', description, status: 'draft', owner } }
  }

  if (title.length < 3) {
    return { error: 'Title must be at least 3 characters.', value: { title, description, status: 'draft', owner } }
  }

  if (!VALID_STATUSES.includes(status as RecordStatus)) {
    return { error: 'Status is invalid.', value: { title, description, status: 'draft', owner } }
  }

  if (description.length > 1000) {
    return { error: 'Description must be under 1000 characters.', value: { title, description, status: status as RecordStatus, owner } }
  }

  if (owner.length > 80) {
    return { error: 'Owner must be under 80 characters.', value: { title, description, status: status as RecordStatus, owner } }
  }

  return {
    error: null,
    value: {
      title,
      description,
      status: status as RecordStatus,
      owner,
    },
  }
}

async function seedIfEmpty(): Promise<void> {
  const collection = db.collection('records')
  const existing = await collection.find()
  if (existing.length > 0) return

  const now = Date.now()
  const samples = [
    {
      title: 'Q2 onboarding checklist',
      description: 'Tracks cross-functional setup steps for new operations hires and their handoff milestones.',
      status: 'active' as RecordStatus,
      owner: 'Maya Patel',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 12).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 45).toISOString(),
      deletedAt: null,
    },
    {
      title: 'Vendor audit log',
      description: 'Central record for compliance updates, audit findings, and remediation owners.',
      status: 'draft' as RecordStatus,
      owner: 'Jordan Kim',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 24).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
      deletedAt: null,
    },
    {
      title: 'Release readiness notes',
      description: 'Live operational status, launch blockers, and go/no-go notes for the upcoming release.',
      status: 'archived' as RecordStatus,
      owner: 'Alex Rivera',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 42).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      deletedAt: null,
    },
    {
      title: 'Customer escalation tracker',
      description: 'High-priority customer issues, escalation owners, next actions, and due dates.',
      status: 'active' as RecordStatus,
      owner: 'Chris Wong',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 15).toISOString(),
      deletedAt: null,
    },
    {
      title: 'Procurement policy refresh',
      description: 'Draft updates to approval thresholds, review cadence, and stakeholder sign-off notes.',
      status: 'draft' as RecordStatus,
      owner: 'Maya Patel',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 18).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 7).toISOString(),
      deletedAt: null,
    },
  ]

  for (const sample of samples) {
    await collection.insertOne(sample)
  }
}

router.get('/', async (_req, res, next) => {
  try {
    await seedIfEmpty()
    const docs = await db.collection('records').find()
    const items = docs.map((doc) => toRecord(doc)).filter((item): item is RecordDoc => item !== null)
    res.json(items)
    return
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const item = toRecord(await db.collection('records').findById(String(req.params.id)))
    if (!item) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json(item)
    return
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const body = req.body as RecordBody
    const parsed = validateInput(body)
    if (parsed.error) {
      res.status(400).json({ error: parsed.error })
      return
    }

    const now = new Date().toISOString()
    const id = await db.collection('records').insertOne({
      ...parsed.value,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })
    const item = toRecord(await db.collection('records').findById(id))
    res.status(201).json(item)
    return
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const body = req.body as RecordBody
    const existing = toRecord(await db.collection('records').findById(String(req.params.id)))
    if (!existing) {
      res.status(404).json({ error: 'Not found' })
      return
    }

    const parsed = validateInput(body)
    if (parsed.error) {
      res.status(400).json({ error: parsed.error })
      return
    }

    const ok = await db.collection('records').updateOne(String(req.params.id), {
      ...parsed.value,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      deletedAt: existing.deletedAt,
    })
    if (!ok) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    const item = toRecord(await db.collection('records').findById(String(req.params.id)))
    res.json(item)
    return
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const item = toRecord(await db.collection('records').findById(String(req.params.id)))
    if (!item) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    const ok = await db.collection('records').deleteOne(String(req.params.id))
    if (!ok) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json({ success: true, deleted: item })
    return
  } catch (error) {
    next(error)
  }
})

export default router