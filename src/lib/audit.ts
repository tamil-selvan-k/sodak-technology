import { db } from './db'

interface AuditParams {
  actorId:    string
  action:     string
  entityType: string
  entityId:   string
  oldValue?:  unknown
  newValue?:  unknown
}

export async function writeAuditLog(params: AuditParams) {
  await db.auditLog.create({
    data: {
      actorId:    params.actorId,
      action:     params.action,
      entityType: params.entityType,
      entityId:   params.entityId,
      oldValue:   params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : undefined,
      newValue:   params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
    },
  })
}
