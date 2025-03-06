import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import xss from 'xss'

// slæmt workaround með eslint
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const prisma = new PrismaClient()

export async function getCategories(limit: number = 10, offset: number = 0): Promise<Array<Category>> {

  const categories = await prisma.categories.findMany({
    orderBy: { id: 'asc' },
    take: limit,
    skip: offset
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
  console.log(categoryToCreate.title)
  const sanitizedTitle = xss(categoryToCreate.title)
  console.log(sanitizedTitle)

  const createdCategory = await prisma.categories.create({
    data: {
      title: sanitizedTitle,
      slug: sanitizedTitle.toLowerCase().replace(' ', '-')
    }
  })

  return createdCategory
}

export async function updateCategory(categoryToPatch: CategoryToCreatePatchDelete, slug: string): Promise<Category> {
  const sanitizedTitle = xss(categoryToPatch.title)

  const updatedCategory = await prisma.categories.update({
    where: { slug },
    data: {
      slug: sanitizedTitle.toLowerCase().replace(' ', '-'),
      title: sanitizedTitle
    }
  })

  return updatedCategory
}

export async function deleteCategory(slug: string) {
  return await prisma.categories.delete({
    where: { slug: slug}
  })
}
