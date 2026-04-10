import React, { FC } from 'react';
import { successNotificationStyle } from '../styles/theme';

interface Notification {
  type: string;
  msg: string;
  id: number;
}

interface NotificationsProps {
  notifications: Notification[];
}

/**
 * Component for displaying toast notifications
 */
const Notifications: FC<NotificationsProps> = ({ notifications = [] }) => {
  return (
    <>
      {notifications.map((notif) => (
        <div
          key={notif.id}
          style={{
            ...successNotificationStyle,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {notif.msg}
        </div>
      ))}
    </>
  );
};

export default Notifications;
