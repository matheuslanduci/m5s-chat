import { api } from 'convex/_generated/api'
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
  selection: ModelSelection

  setAutoMode: () => void
}

export const modelSelectionContext = createContext<ModelSelectionContext>(
  {} as ModelSelectionContext
)

export function ModelSelectionProvider({
  children
}: { children: React.ReactNode }) {
  const [optimisticSelection, setOptimisticSelection] =
    useState<ModelSelection | null>(null)

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
      setOptimisticSelection(updates)

      try {
        await setUserPreference(updates)
      } catch (error) {
        console.error('Failed to update user preferences:', error)
        toast.error('Failed to update preferences. Please try again later.')
      } finally {
        setOptimisticSelection(null)
      }
    },
    [setUserPreference]
  )

  const setAutoMode = useCallback(() => {
    updateUserPreferences({
      defaultModelSelection: 'auto'
    })
  }, [updateUserPreferences])

  return (
    <modelSelectionContext.Provider
      value={{
        selection,
        setAutoMode
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
