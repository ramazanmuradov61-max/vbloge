import { getState, setRole, startDemo } from "../store.js";

export const authService = {
  startDemo() {
    return startDemo();
  },
  setRole(role) {
    return setRole(role);
  },
  getSession() {
    const { currentRole, demoMode, user } = getState();
    return { currentRole, demoMode, user };
  },
};
