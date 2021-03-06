import { DeviceType } from './deviceType'

type MemberType = {
  memberId: number,
  memberName: string,
  device: Array<DeviceType>,
  role?: Array<{ name: string, value: boolean }>
  disable: boolean,
}

const memberToString = (member: MemberType) => {
  if (member) {
    return {
      memberId: member.memberId,
      memberName: member.memberName,
      device: member.device,
      disable: member.disable,
      role: member.role,
    }
  }
}

const memberFromString = (member: any) => {
  if (member) {
    return {
      memberId: member.memberId,
      memberName: member.memberName,
      device: member.device,
      disable: member.disable,
      role: member.role,
    }
  }
}

const memberListToJson = (memberList: Array<MemberType>) => {
  if (memberList)
    return JSON.stringify(memberList.map(memberToString))
}

const memberListFromJson = (memberList: string | undefined) => {
  if (memberList)
    return JSON.parse(memberList).map(memberFromString)
}

const memberToJson = (member: MemberType) => {
  if (member)
    return JSON.stringify(memberToString(member))
}

const memberFromJson = (member: string | undefined) => {
  if (member)
    return memberFromString(JSON.parse(member))
}

export type { MemberType }
export {
  memberToString, memberFromString,
  memberListToJson, memberListFromJson,
  memberToJson, memberFromJson,
}
