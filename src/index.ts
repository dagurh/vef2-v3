import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory, validateCategory } from './categories.db.js'

const app = new Hono()

app.get('/', (c) => {

  return c.text('Hello Hono!')
})

app.get('/categories', async (c) => {

  const categories = await getCategories()

  return c.json(categories, 200)
})

app.get('/categories/:slug', async (c) => {
  const slug = c.req.param('slug')

  const category = await getCategory(slug)

  if (!category) {
    return c.json({ message: 'Category not found' }, 404)
  }

  return c.json(category, 200)
  
})

app.post('/categories', async (c) => {

  let categoryToCreate: unknown

  try {
    categoryToCreate = await c.req.json()
  } catch (e) {
    return c.json({ message: 'Invalid JSON' }, 400)
  }

  const validCategory = validateCategory(categoryToCreate)

  if (!validCategory.success) {
    return c.json({error: 'Invalid data', errors: validCategory.error.flatten() }, 400)
  }

  const createdCategory = await createCategory(validCategory.data)

  return c.json(createdCategory, 201)
})

app.patch('/categories/:slug', async (c) => {
  const slug = c.req.param('slug')

  const category = await getCategory(slug)

  if (!category) {
    return c.json({ message: 'Category not found' }, 404)
  }

  let categoryToPatch: unknown

  try {
    categoryToPatch = await c.req.json()
  } catch (e) {
    return c.json({ message: 'Invalid JSON' }, 400)
  }

  const validCategory = validateCategory(categoryToPatch)

  if (!validCategory.success) {
    return c.json({ error: 'Invalid data', errors: validCategory.error.flatten() }, 400)
  }

  const updatedCategory = await updateCategory(validCategory.data, slug)

  return c.json(updatedCategory, 200)

})

app.delete('/categories/:slug', async (c) => {
  const slug = c.req.param('slug')

  const category = await getCategory(slug)

  if (!category) {
    return c.json({ message: 'Category not found' }, 404)
  }

  deleteCategory(slug)

  return c.status(204)
})

app.onError((err, c) => {
  console.error(err)
  return c.json({ message: 'Internal Server Error' }, 500)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

