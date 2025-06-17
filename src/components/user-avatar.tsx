import { useUser } from '@clerk/clerk-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export function UserAvatar() {
  const { user } = useUser()

  if (!user) return null

  return (
    <Avatar>
      <AvatarImage src={user.imageUrl} alt={user.fullName || 'User Avatar'} />
      <AvatarFallback>{user.firstName?.charAt(0) || 'U'}</AvatarFallback>
    </Avatar>
  )
}
