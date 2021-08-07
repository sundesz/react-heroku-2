require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3001
const Note = require('./models/note')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log('---')

  next()
}

app.use(requestLogger)

// let notes = [
//   {
//     id: 1,
//     content: 'HTML is easy',
//     date: '2019-05-30T17:30:31.098Z',
//     important: true,
//   },
//   {
//     id: 2,
//     content: 'Browser can execute only Javascript',
//     date: '2019-05-30T18:39:34.091Z',
//     important: false,
//   },
//   {
//     id: 3,
//     content: 'GET and POST are the most important methods of HTTP protocol',
//     date: '2019-05-30T19:20:14.298Z',
//     important: true,
//   },
// ]

const generateId = () => {
  return notes.length ? Math.max(...notes.map((n) => n.id)) + 1 : 0
}

app.get('/', (request, response) => {
  const body = request.body
  console.log(body)
  response.send('<h1>Hello Sandesh</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({})
    .then((notes) => {
      response.json(notes)
    })
    .catch((e) => {
      console.log(e)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/notes/:id', (request, response, error) => {
  Note.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => {
      next(error)
    })
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    date: body.date || new Date(),
    important: body.important || false,
  })

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })
    .catch((error) => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body
  const note = {
    content: body.content,
    important: body.important,
  }

  //There is one important detail regarding the use of the findByIdAndUpdate method. By default, the updatedNote parameter of the event handler receives the original document without the modifications. We added the optional { new: true }parameter, which will cause our event handler to be called with the new modified document instead of the original.
  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then((updatedNote) => updatedNote.toJSON())
    .then((formattedNote) => response.json(formattedNote))
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  switch (error.name.toLowerCase()) {
    case 'casterror':
      return response.status(400).json({ error: 'malformatted id' })
    case 'validationerror':
      return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`)
})
