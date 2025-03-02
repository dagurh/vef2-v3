import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const categorySchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z
    .string()
    .min(3, 'title must be at least 3 characters long')
    .max(50, 'title must be at most 50 characters long')
})

const categoryToCreatePatchDeleteSchema = z.object({
  title: z
    .string()
    .min(3, 'title must be at least 3 characters long')
    .max(50, 'title must be at most 50 characters long')
})

type Category = z.infer<typeof categorySchema>
type CategoryToCreatePatchDelete = z.infer<typeof categoryToCreatePatchDeleteSchema>

const mockCategories: Array<Category> = [
  { id: 1, slug: 'html', title: 'HTML' },
  { id: 2, slug: 'css', title: 'CSS' },
  { id: 3, slug: 'js', title: 'JavaScript' },
  { id: 4, slug: 'react', title: 'React' },
  { id: 5, slug: 'vue', title: 'Vue' },
  { id: 6, slug: 'svelte', title: 'Svelte' },
  { id: 7, slug: 'angular', title: 'Angular' },
  { id: 8, slug: 'node', title: 'Node' },
  { id: 9, slug: 'deno', title: 'Deno' },
  { id: 10, slug: 'typescript', title: 'TypeScript' }
]

const prisma = new PrismaClient()

export async function getCategories(limit: number = 10, offset: number = 0): Promise<Array<Category>> {
  console.log('getCategories was called')

  const categories = await prisma.categories.findMany({
    orderBy: { id: 'asc' }
  })

  return categories;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const category = await prisma.categories.findUnique({
    where: { slug }
  })

  return category ?? null;
}

export function validateCategory(categoryToValidate: unknown) {
  const result = categoryToCreatePatchDeleteSchema.safeParse(categoryToValidate)

  return result
}

export async function createCategory(categoryToCreate: CategoryToCreatePatchDelete): Promise<Category> {
  const createdCategory = await prisma.categories.create({
    data: {
      title: categoryToCreate.title,
      slug: categoryToCreate.title.toLowerCase().replace(' ', '-')
    }
  })

  return createdCategory
}

export async function updateCategory(categoryToPatch: CategoryToCreatePatchDelete, slug: string): Promise<Category> {
  const updatedCategory = await prisma.categories.update({
    where: { slug },
    data: {
      slug: categoryToPatch.title.toLowerCase().replace(' ', '-'),
      title: categoryToPatch.title
    }
  })

  return updatedCategory
}

export async function deleteCategory(slug: string): Promise<void> {
  await prisma.categories.delete({
    where: { slug }
  })
}
