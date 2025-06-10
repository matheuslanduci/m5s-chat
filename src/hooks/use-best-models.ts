import { useQuery } from 'convex/react'
import {
  Brain,
  Code,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Lightbulb,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react'
import { useMemo } from 'react'
import { api } from '../../convex/_generated/api'
import type { BasicCategory } from './use-model-selection'

// Map categories to their respective icons and descriptions
const categoryMeta = {
  Programming: {
    icon: Code,
    description: 'Optimized for coding and technical tasks'
  },
  Roleplay: {
    icon: Users,
    description: 'Creative character interactions and storytelling'
  },
  Marketing: {
    icon: TrendingUp,
    description: 'Content creation and marketing strategies'
  },
  SEO: {
    icon: Globe,
    description: 'Search engine optimization and web content'
  },
  Technology: {
    icon: Lightbulb,
    description: 'Tech discussions and innovations'
  },
  Science: {
    icon: Brain,
    description: 'Scientific research and analysis'
  },
  Translation: {
    icon: FileText,
    description: 'Language translation and localization'
  },
  Legal: {
    icon: Shield,
    description: 'Legal advice and document analysis'
  },
  Finance: {
    icon: DollarSign,
    description: 'Financial planning and analysis'
  },
  Health: {
    icon: Heart,
    description: 'Health and wellness information'
  },
  Trivia: {
    icon: HelpCircle,
    description: 'Fun facts and general knowledge'
  },
  Academia: {
    icon: GraduationCap,
    description: 'Academic research and education'
  }
} as const

export interface CategoryWithModel {
  name: BasicCategory
  icon: React.ComponentType<{ className?: string }>
  description: string
  provider: 'openai' | 'google' | 'anthropic' | 'deepseek'
  model: string
}

export function useBestModels() {
  const bestModelsData = useQuery(api.model.getAllBestModels)

  const categoriesWithModels = useMemo(() => {
    if (!bestModelsData) {
      return []
    }

    return bestModelsData
      .filter((item) => item.model !== null)
      .map((item) => {
        const meta = categoryMeta[item.category as BasicCategory] || {
          icon: HelpCircle,
          description: 'Category description'
        }

        const model = item.model
        if (!model) return null

        return {
          name: item.category as BasicCategory,
          icon: meta.icon,
          description: meta.description,
          provider: model.provider as
            | 'openai'
            | 'google'
            | 'anthropic'
            | 'deepseek',
          model: model.name
        }
      })
      .filter(Boolean) as CategoryWithModel[]
  }, [bestModelsData])

  return useMemo(
    () => ({
      categoriesWithModels,
      isLoading: bestModelsData === undefined
    }),
    [categoriesWithModels, bestModelsData]
  )
}
