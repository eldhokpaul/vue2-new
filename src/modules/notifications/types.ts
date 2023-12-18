export enum NotificationNotificationStatusEnum {
    Unread = 'UNREAD',
    Read = 'READ',
    Dismissed = 'DISMISSED'
}
export enum NotificationNotificationTypeEnum {
    Info = 'INFO',
    ActionNeeded = 'ACTION_NEEDED',
    Error = 'ERROR'
}
export type INotification = {
    id?: number
    accountId?: number
    notificationStatus?: NotificationNotificationStatusEnum
    summary?: string|null
    message?: string|null
    notificationType?: NotificationNotificationTypeEnum
    userId?: number
    messageDateTime?: string
}
