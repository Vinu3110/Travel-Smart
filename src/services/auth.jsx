
const USERS_KEY = "travelsmart_users";
const SESSION_KEY = "travelsmart_session";

export function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

export function getCurrentUser() {
  try {
    const email = (
      localStorage.getItem(SESSION_KEY) || ""
    ).trim().toLowerCase();

    if (!email) return null;

    return (
      getUsers().find(
        (user) =>
          (user.email || "").trim().toLowerCase() === email
      ) || null
    );
  } catch {
    return null;
  }
}

export function registerUser(name, email, password) {
  name = name.trim();
  email = email.trim().toLowerCase();

  if (!name || !email || !password) {
    return {
      success: false,
      message: "Please fill in every field."
    };
  }

  const users = getUsers();

  if (
    users.some(
      (user) => user.email.trim().toLowerCase() === email
    )
  ) {
    return {
      success: false,
      message: "An account already exists with this email. Please log in."
    };
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    visitedPlaces: [],
    savedPlaces: []
  };

  users.push(newUser);

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return { success: true };
}

export function loginUser(email, password) {
  email = email.trim().toLowerCase();

  const user = getUsers().find(
    (item) =>
      (item.email || "").trim().toLowerCase() === email &&
      item.password === password
  );

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password. Please check your details or register."
    };
  }

  localStorage.setItem(SESSION_KEY, user.email.trim().toLowerCase());

  return { success: true };
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function updateUser(updatedUser) {
  const users = getUsers();

  const index = users.findIndex(
    (user) =>
      user.email.trim().toLowerCase() ===
      updatedUser.email.trim().toLowerCase()
  );

  if (index === -1) return;

  users[index] = updatedUser;

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
