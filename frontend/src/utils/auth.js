export const getCurrentUser = () => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

export const canManageRecords = () => {
  const role = getCurrentUser()?.role;
  return ["admin", "manager"].includes(role);
};

export const isAdmin = () => getCurrentUser()?.role === "admin";
