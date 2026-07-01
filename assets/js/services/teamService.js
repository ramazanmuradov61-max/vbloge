import { getState } from "../store.js";

export const teamService = {
  getModels() {
    const { company, employees, accessRoles, permissions } = getState();
    return { company, employees, accessRoles, permissions };
  },
};
