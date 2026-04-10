// src/utils/notifications.js
export const requestNotificationPermission = async () => {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

export const sendNotification = (title, body) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { 
      body, 
      icon: "/icon.jpeg" // icon public folder me daalna
    });
  }
};
