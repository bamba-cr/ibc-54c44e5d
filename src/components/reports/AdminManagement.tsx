
import { useState } from "react";
import { AddAdminForm } from "./admin/AddAdminForm";
import { AdminList } from "./admin/AdminList";

export const AdminManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdminAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <AddAdminForm onAdminAdded={handleAdminAdded} />
      <AdminList refreshTrigger={refreshTrigger} />
    </div>
  );
};
