export const getRole = async <Type>(
  item: {
    role: {
      memberId: number,
      role: Type
    }[]
  },
  memberId: number
) => {
  const role = item.role.filter(
    (role) => role.memberId === memberId
  ).map((role) => {
    return role.role
  })
  if (role.length > 0) {
    return role[0]
  }
}

export const setRole = async <Type>(
  item: {
    role: {
      memberId: number,
      role: Type
    }[]
    incVersion: () => void
  },
  memberId: number,
  role: any
) => {
  const roleSet = item.role.filter(
    (memberRole) => memberRole.memberId === memberId
  ).map(
    (memberRole) => {
      memberRole.role = role
      return role
    }
  )
  if (roleSet.length === 0) {
    item.role.push(
      {
        memberId,
        role,
      })
  }
  item.incVersion()
}
