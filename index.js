const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log('---')

  next()
}

app.use(requestLogger)

let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    date: '2019-05-30T17:30:31.098Z',
    important: true,
  },
  {
    id: 2,
    content: 'Browser can execute only Javascript',
    date: '2019-05-30T18:39:34.091Z',
    important: false,
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    date: '2019-05-30T19:20:14.298Z',
    important: true,
  },
]

const generateId = () => {
  return notes.length ? Math.max(...notes.map((n) => n.id)) + 1 : 0
}

app.get('/', (request, response) => {
  const body = request.body
  console.log(body)
  response.send('<h1>Hello Sandesh</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find((n) => n.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find((n) => n.id === id)
  notes = notes.filter((n) => n.id !== id)

  if (note) {
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

app.post('/api/notes', (request, response) => {
  const body = request.body
  console.log(body)

  if (!body.content) {
    return response.status(400).json({ error: 'missing content' })
  }

  const note = {
    id: generateId(),
    content: body.content,
    date: body.date || new Date(),
    important: body.important || false,
  }

  // notes = [...notes, note]
  notes = notes.concat(note)
  response.json(note)
})

app.put('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find((n) => n.id === id)

  if (note) {
    notes = notes.map((n) => (n.id === id ? request.body : n))
    response.json(request.body)
  } else {
    response.status(404).end()
  }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`)
})
