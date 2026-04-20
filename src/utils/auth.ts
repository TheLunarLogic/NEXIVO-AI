const LOGGED_IN_KEY = "nexivo_logged_in_v1";

export function isLoggedIn() {
  try {
    return sessionStorage.getItem(LOGGED_IN_KEY) === "1";
  } catch {
    return false;
  }
}

export function setLoggedIn() {
  try {
    sessionStorage.setItem(LOGGED_IN_KEY, "1");
  } catch {
    // ignore
  }
}

export function clearLoggedIn() {
  try {
    sessionStorage.removeItem(LOGGED_IN_KEY);
  } catch {
    // ignore
  }
}

