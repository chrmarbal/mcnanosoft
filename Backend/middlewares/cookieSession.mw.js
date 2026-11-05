const crypto = require("crypto")
const zlib = require("zlib")

const MAX_COOKIE_BYTES = 3800

function encodeBase64Url(value) {
    return value.toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
}

function decodeBase64Url(value) {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
    return Buffer.from(base64 + "=".repeat((4 - base64.length % 4) % 4), "base64")
}

function getCookieValue(req, name) {
    const cookieHeader = req.headers.cookie
    if (!cookieHeader) return undefined

    for (const cookie of cookieHeader.split(";")) {
        const separatorIndex = cookie.indexOf("=")
        if (separatorIndex === -1) continue

        const cookieName = cookie.slice(0, separatorIndex).trim()
        if (cookieName === name) {
            try {
                return decodeURIComponent(cookie.slice(separatorIndex + 1).trim())
            } catch {
                return null
            }
        }
    }

    return undefined
}

function createCookieSession({ name, secret, options }) {
    if (!secret) {
        throw new Error("SESSION_SECRET es obligatorio para cifrar la cookie de sesión")
    }

    const encryptionKey = crypto.createHash("sha256").update(secret).digest()

    function encryptSession(session) {
        const iv = crypto.randomBytes(12)
        const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv)
        const compressed = zlib.deflateRawSync(Buffer.from(JSON.stringify(session)))
        const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()])
        const authTag = cipher.getAuthTag()

        return [
            "v1",
            encodeBase64Url(iv),
            encodeBase64Url(authTag),
            encodeBase64Url(encrypted)
        ].join(".")
    }

    function decryptSession(value) {
        const [version, encodedIv, encodedAuthTag, encodedData, ...extra] = value.split(".")
        if (version !== "v1" || !encodedIv || !encodedAuthTag || !encodedData || extra.length) {
            return null
        }

        try {
            const decipher = crypto.createDecipheriv(
                "aes-256-gcm",
                encryptionKey,
                decodeBase64Url(encodedIv)
            )
            decipher.setAuthTag(decodeBase64Url(encodedAuthTag))
            const compressed = Buffer.concat([
                decipher.update(decodeBase64Url(encodedData)),
                decipher.final()
            ])
            const session = JSON.parse(zlib.inflateRawSync(compressed).toString("utf8"))
            return session && typeof session === "object" && !Array.isArray(session)
                ? session
                : null
        } catch {
            return null
        }
    }

    return (req, res, next) => {
        const cookieValue = getCookieValue(req, name)
        const decodedCookie = typeof cookieValue === "string" && cookieValue
            ? decryptSession(cookieValue)
            : {}
        const invalidCookie = cookieValue !== undefined && (!cookieValue || !decodedCookie)
        const {
            auth: initialUserLogued,
            userLogued: legacyUserLogued,
            passport: ignoredPassportData,
            ...initialSession
        } = decodedCookie || {}
        const userLogued = initialUserLogued || legacyUserLogued || null
        const initialCookieState = { ...initialSession }
        if (userLogued) initialCookieState.auth = userLogued
        const initialSerializedCookieState = JSON.stringify(initialCookieState)
        let destroyed = false

        req.session = initialSession
        req.userLogued = userLogued

        function addSessionMethods(session) {
            session.save = callback => {
                if (callback) callback(null)
            }
            session.regenerate = callback => {
                req.session = {}
                destroyed = true
                addSessionMethods(req.session)
                if (callback) callback(null)
            }
            session.destroy = callback => {
                req.session = null
                destroyed = true
                if (callback) callback(null)
            }
        }

        addSessionMethods(req.session)

        const originalEnd = res.end
        res.end = function (...args) {
            const session = req.session
            let shouldClearCookie = destroyed || invalidCookie

            if (!res.headersSent && session) {
                const nextCookieState = { ...session }
                if (req.userLogued) nextCookieState.auth = req.userLogued

                if (JSON.stringify(nextCookieState) !== initialSerializedCookieState) {
                    const encryptedSession = encryptSession(nextCookieState)
                    if (Buffer.byteLength(`${name}=${encryptedSession}`) > MAX_COOKIE_BYTES) {
                        const callback = args.find(argument => typeof argument === "function")
                        const message = JSON.stringify("La cookie de sesión supera el tamaño máximo permitido.")
                        res.statusCode = 500
                        res.removeHeader("Content-Length")
                        res.removeHeader("ETag")
                        res.setHeader("Content-Type", "application/json; charset=utf-8")
                        args = [message, "utf8", callback]
                        shouldClearCookie = false
                    } else {
                        res.cookie(name, encryptedSession, options)
                        shouldClearCookie = false
                    }
                }
            }

            if (shouldClearCookie && !res.headersSent) {
                res.clearCookie(name, {
                    path: "/",
                    secure: options.secure,
                    httpOnly: options.httpOnly,
                    sameSite: options.sameSite
                })
            }

            return originalEnd.apply(this, args)
        }

        next()
    }
}

module.exports = createCookieSession
