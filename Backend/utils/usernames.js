const USERNAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{1,28}[A-Za-z0-9]$/

function isValidUsername(username) {
    return typeof username === "string" && USERNAME_PATTERN.test(username)
}

function normalizeOAuthUsername(value) {
    const normalized = String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z0-9._-]+/g, "_")
        .replace(/^[._-]+|[._-]+$/g, "")
        .slice(0, 30)
        .replace(/[._-]+$/g, "")

    const validBase = normalized.length >= 3 ? normalized : `${normalized}user`
    return validBase.slice(0, 30)
}

module.exports = { isValidUsername, normalizeOAuthUsername, USERNAME_PATTERN }
