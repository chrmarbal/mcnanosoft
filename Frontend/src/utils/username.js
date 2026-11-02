export const USERNAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{1,28}[A-Za-z0-9]$/
export const USERNAME_HELP = "Usa de 3 a 30 caracteres: letras, números, punto, guion o guion bajo. Empieza y termina con letra o número."

export function isValidUsername(username) {
  return typeof username === "string" && USERNAME_PATTERN.test(username)
}
