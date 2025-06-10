import { useUser } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import { useCallback, useMemo, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export type BasicCategory =
  | 'Programming'
  | 'Roleplay'
  | 'Marketing'
  | 'SEO'
  | 'Technology'
  | 'Science'
  | 'Translation'
  | 'Legal'
  | 'Finance'
  | 'Health'
  | 'Trivia'
  | 'Academia'

export type ModelSelectionMode = 'auto' | 'category' | 'model'

export interface ModelSelection {
  mode: ModelSelectionMode
  category?: BasicCategory
  modelId?: Id<'model'>
}

export interface UseModelSelectionReturn {
  // Current selection state
  selection: ModelSelection
  isLoading: boolean

  // Available options
  categories: BasicCategory[]
  models: Array<{
    _id: Id<'model'>
    name: string
    provider: string
    key: string
  }>

  // Actions
  setAutoMode: () => void
  setCategoryMode: (category: BasicCategory) => void
  setModelMode: (modelId: Id<'model'>) => void

  // Computed values
  selectedModel: {
    _id: Id<'model'>
    name: string
    provider: string
    key: string
  } | null
  displayName: string
}

export function useModelSelection(): UseModelSelectionReturn {
  const { user } = useUser()
  const [isUpdating, setIsUpdating] = useState(false)
  const [optimisticSelection, setOptimisticSelection] =
    useState<ModelSelection | null>(null)

  // Queries
  const userModelPreference = useQuery(api.model.getUserModelPreference)
  const models = useQuery(api.model.getAllModels)
  const categories = useQuery(api.model.getAllCategories)

  // Mutations
  const updatePreferences = useMutation(
    api.userPreference.upsertUserPreferences
  ) // Derive current selection from user preferences with optimistic updates
  const selection: ModelSelection = useMemo(() => {
    console.log('userModelPreference:', userModelPreference)
    console.log('optimisticSelection:', optimisticSelection)

    // Use optimistic selection if available
    if (optimisticSelection) {
      console.log('Using optimistic selection:', optimisticSelection)
      return optimisticSelection
    }

    if (!userModelPreference) {
      console.log('No user model preference, defaulting to auto')
      return { mode: 'auto' }
    }

    console.log('User preference type:', userModelPreference.type)

    switch (userModelPreference.type) {
      case 'favoriteModel':
        console.log(
          'Selected mode: model, modelId:',
          userModelPreference.model._id
        )
        return {
          mode: 'model',
          modelId: userModelPreference.model._id
        }
      case 'favoriteCategory':
        console.log(
          'Selected mode: category, category:',
          userModelPreference.category
        )
        return {
          mode: 'category',
          category: userModelPreference.category
        }
      default:
        console.log('Selected mode: auto (default case)')
        return { mode: 'auto' }
    }
  }, [userModelPreference, optimisticSelection])

  // Find selected model
  const selectedModel = useMemo(() => {
    if (selection.mode === 'model' && selection.modelId && models) {
      return models.find((m) => m._id === selection.modelId) || null
    }
    return null
  }, [selection, models])

  // Compute display name
  const displayName = useMemo(() => {
    switch (selection.mode) {
      case 'auto':
        return 'Auto'
      case 'category':
        return selection.category || 'Category'
      case 'model':
        return selectedModel?.name || 'Model'
      default:
        return 'Auto'
    }
  }, [selection, selectedModel]) // Update preferences helper with optimistic updates
  const updateUserPreferences = useCallback(
    async (updates: {
      isAuto?: boolean
      favoriteCategory?: BasicCategory
      favoriteModel?: Id<'model'>
    }) => {
      console.log('updateUserPreferences called with:', updates)
      console.log('User ID:', user?.id, 'isUpdating:', isUpdating)

      if (!user?.id || isUpdating) {
        console.log('Skipping update - no user or already updating')
        return
      }

      // Set optimistic state immediately
      if (updates.isAuto) {
        setOptimisticSelection({ mode: 'auto' })
      } else if (updates.favoriteCategory) {
        setOptimisticSelection({
          mode: 'category',
          category: updates.favoriteCategory
        })
      } else if (updates.favoriteModel) {
        setOptimisticSelection({
          mode: 'model',
          modelId: updates.favoriteModel
        })
      }

      try {
        setIsUpdating(true)
        console.log('Calling updatePreferences mutation...')
        await updatePreferences(updates)
        console.log('Update preferences completed successfully')
        // Clear optimistic state once mutation succeeds
        setOptimisticSelection(null)
      } catch (error) {
        console.error('Failed to update preferences:', error)
        // Revert optimistic update on error
        setOptimisticSelection(null)
      } finally {
        setIsUpdating(false)
      }
    },
    [user?.id, updatePreferences, isUpdating]
  )

  const setAutoMode = useCallback(() => {
    console.log('setAutoMode called')
    updateUserPreferences({
      isAuto: true,
      favoriteCategory: undefined,
      favoriteModel: undefined
    })
  }, [updateUserPreferences])

  const setCategoryMode = useCallback(
    (category: BasicCategory) => {
      console.log('setCategoryMode called with:', category)
      updateUserPreferences({
        favoriteCategory: category,
        favoriteModel: undefined,
        isAuto: false
      })
    },
    [updateUserPreferences]
  )

  const setModelMode = useCallback(
    (modelId: Id<'model'>) => {
      console.log('setModelMode called with:', modelId)
      updateUserPreferences({
        favoriteModel: modelId,
        favoriteCategory: undefined,
        isAuto: false
      })
    },
    [updateUserPreferences]
  )

  const isLoading = !userModelPreference && user?.id !== undefined

  return {
    selection,
    isLoading,
    categories: (categories || []) as BasicCategory[],
    models: models || [],
    setAutoMode,
    setCategoryMode,
    setModelMode,
    selectedModel,
    displayName
  }
}
