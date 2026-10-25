import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'lavanderia-pristine:users:v1';
const SESSION_KEY = 'lavanderia-pristine:session:v1';

const DEMO_ADMIN = {
  id: 'admin-demo',
  nombre: 'Administración Pristine',
  email: 'admin@pristine.local',
  password: 'pristine-demo',
  role: 'administrador',
};

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function readUsers() {
  const storedUsers = await AsyncStorage.getItem(USERS_KEY);
  let users;
  let wasInvalid = false;
  try {
    users = storedUsers ? JSON.parse(storedUsers) : [];
  } catch {
    users = [];
    wasInvalid = true;
  }

  if (!Array.isArray(users)) {
    users = [];
    wasInvalid = true;
  }

  if (wasInvalid) {
    await writeUsers([]);
  }

  return users;
}

async function writeUsers(users) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function startSession(user) {
  const session = {
    token: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    user: publicUser(user),
  };

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function restoreLocalSession() {
  try {
    const [users, storedSession] = await Promise.all([
      readUsers(),
      AsyncStorage.getItem(SESSION_KEY),
    ]);
    const seededUsers = users.some((user) => user.id === DEMO_ADMIN.id)
      ? users
      : [...users, DEMO_ADMIN];

    if (seededUsers !== users) {
      await writeUsers(seededUsers);
    }

    if (!storedSession) {
      return null;
    }

    const session = JSON.parse(storedSession);
    const account = seededUsers.find((user) => user.id === session.user?.id);
    return account ? { ...session, user: publicUser(account) } : null;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function registerLocalUser({ nombre, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }

  const user = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    nombre: nombre.trim(),
    email: normalizedEmail,
    password,
    role: 'cliente',
  };

  await writeUsers([...users, user]);
  return startSession(user);
}

export async function signInLocalUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  const allUsers = users.some((user) => user.id === DEMO_ADMIN.id)
    ? users
    : [...users, DEMO_ADMIN];
  const user = allUsers.find(
    (account) => account.email === normalizedEmail && account.password === password
  );

  if (!user) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  if (allUsers !== users) {
    await writeUsers(allUsers);
  }

  return startSession(user);
}

export async function resetLocalPassword({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  const accountIndex = users.findIndex((user) => user.email === normalizedEmail);

  if (accountIndex === -1) {
    throw new Error('No se encontró una cuenta local con ese correo.');
  }

  const updatedUsers = [...users];
  updatedUsers[accountIndex] = { ...updatedUsers[accountIndex], password };
  await writeUsers(updatedUsers);
}

export async function updateLocalProfile(userId, profile) {
  const users = await readUsers();
  const accountIndex = users.findIndex((user) => user.id === userId);
  if (accountIndex === -1) {
    throw new Error('No se encontró la cuenta local.');
  }

  const normalizedEmail = profile.email.trim().toLowerCase();
  if (users.some((user, index) => index !== accountIndex && user.email === normalizedEmail)) {
    throw new Error('Ese correo ya está asociado a otra cuenta local.');
  }

  const allowedFields = [
    'nombre',
    'email',
    'telefono',
    'direccion',
    'edad',
    'genero',
    'fotoUri',
    'biometricEnabled',
  ];
  const updatedUser = { ...users[accountIndex] };
  for (const field of allowedFields) {
    if (field in profile) {
      updatedUser[field] = field === 'email'
        ? normalizedEmail
        : profile[field];
    }
  }

  const updatedUsers = [...users];
  updatedUsers[accountIndex] = updatedUser;
  await writeUsers(updatedUsers);

  const session = {
    token: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    user: publicUser(updatedUser),
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signOutLocalUser() {
  await AsyncStorage.removeItem(SESSION_KEY);
}