import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'

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

type CategoryWithModel = {
  category: BasicCategory
  model: Doc<'model'> | null
}

type ModelSelection =
  | {
      defaultModelSelection: 'auto'
    }
  | {
      defaultModelSelection: 'category'
      defaultCategory: BasicCategory
    }
  | {
      defaultModelSelection: 'model'
      defaultModelId: Id<'model'>
      defaultModel: Doc<'model'> | null
    }

type ModelSelectionContext = {
  displayName: string
  isFetching: boolean
  selection: ModelSelection
  categoriesWithModels: CategoryWithModel[]
  models: Doc<'model'>[]
  setAutoMode: () => void
  setCategoryMode: (category: BasicCategory) => void
  setModelMode: (modelId: Id<'model'>) => void
}

export const modelSelectionContext = createContext<ModelSelectionContext>(
  {} as ModelSelectionContext
)

export function ModelSelectionProvider({
  children
}: { children: React.ReactNode }) {
  const [optimisticSelection, setOptimisticSelection] =
    useState<ModelSelection | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const bestModels = useQuery(api.model.getBestModels)
  const models = useQuery(api.model.getModels)
  const userPreference = useQuery(api.userPreference.getUserPreference)
  const setUserPreference = useMutation(api.userPreference.setUserPreference)

  const selection = useMemo((): ModelSelection => {
    if (optimisticSelection) return optimisticSelection
    if (!userPreference) return { defaultModelSelection: 'auto' }

    switch (userPreference.defaultModelSelection) {
      case 'model': {
        if (!userPreference.defaultModelId) {
          return { defaultModelSelection: 'auto' }
        }

        if (!userPreference.defaultModel) {
          console.warn(
            'User preference has defaultModelId but no defaultModel, this is unexpected.'
          )

          return { defaultModelSelection: 'auto' }
        }

        return {
          defaultModelSelection: 'model',
          defaultModelId: userPreference.defaultModelId,
          defaultModel: userPreference.defaultModel
        }
      }
      case 'category':
        return {
          defaultModelSelection: 'category',
          defaultCategory: userPreference.defaultCategory ?? 'Roleplay'
        }
      default:
        return { defaultModelSelection: 'auto' }
    }
  }, [optimisticSelection, userPreference])

  const updateUserPreferences = useCallback(
    async (updates: ModelSelection) => {
      if (isUpdating) return

      setOptimisticSelection(updates)
      setIsUpdating(true)

      try {
        if (updates.defaultModelSelection === 'model') {
          // @ts-expect-error can't send defaultModel to the server
          updates.defaultModel = undefined
        }

        await setUserPreference(updates)
      } catch (error) {
        console.error('Failed to update user preferences:', error)
        toast.error('Failed to update preferences. Please try again later.')
      } finally {
        setOptimisticSelection(null)
        setIsUpdating(false)
      }
    },
    [setUserPreference, isUpdating]
  )

  const displayName = useMemo(() => {
    console.log('selection', selection)
    switch (selection.defaultModelSelection) {
      case 'auto':
        return 'Auto'
      case 'category':
        return selection.defaultCategory
      case 'model':
        return selection.defaultModel?.name || 'Unknown'
    }
  }, [selection])

  const setAutoMode = useCallback(() => {
    updateUserPreferences({
      defaultModelSelection: 'auto'
    })
  }, [updateUserPreferences])

  const setCategoryMode = useCallback(
    (category: BasicCategory) => {
      updateUserPreferences({
        defaultModelSelection: 'category',
        defaultCategory: category
      })
    },
    [updateUserPreferences]
  )

  const setModelMode = useCallback(
    (modelId: Id<'model'>) => {
      const model = models?.find((m) => m._id === modelId) || null

      updateUserPreferences({
        defaultModelSelection: 'model',
        defaultModelId: modelId,
        defaultModel: model
      })
    },
    [models, updateUserPreferences]
  )

  const isFetching = !bestModels || !models || !userPreference

  return (
    <modelSelectionContext.Provider
      value={{
        selection,
        setAutoMode,
        setCategoryMode,
        setModelMode,
        displayName,
        isFetching,
        categoriesWithModels: bestModels || [],
        models: models || []
      }}
    >
      {children}
    </modelSelectionContext.Provider>
  )
}

export function useModelSelection() {
  const context = useContext(modelSelectionContext)

  if (!context) {
    throw new Error(
      'useModelSelection must be used within a ModelSelectionProvider'
    )
  }

  return context
}
