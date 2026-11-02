const cloudinary = require("cloudinary").v2

function getCloudinary() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error("Falta configurar CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET")
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true
    })

    return cloudinary
}

function getPublicId(imageUrl) {
    if (!imageUrl) return null

    let url
    try {
        url = new URL(imageUrl)
    } catch {
        return null
    }

    if (url.hostname !== "res.cloudinary.com") return null

    const path = url.pathname.split("/").filter(Boolean)
    const uploadIndex = path.indexOf("upload")
    if (uploadIndex < 2 || path[uploadIndex - 1] !== "image") return null

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    if (cloudName && path[0] !== cloudName) return null

    const publicIdParts = path.slice(uploadIndex + 1)
    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
        publicIdParts.shift()
    }
    if (publicIdParts.length === 0) return null

    const lastPart = publicIdParts[publicIdParts.length - 1]
    publicIdParts[publicIdParts.length - 1] = lastPart.replace(/\.[^.]+$/, "")
    return publicIdParts.join("/")
}

function uploadImage(buffer, folder, publicId, overwrite) {
    const client = getCloudinary()

    return new Promise((resolve, reject) => {
        const stream = client.uploader.upload_stream({
            folder,
            public_id: publicId,
            resource_type: "image",
            overwrite,
            invalidate: true
        }, (error, result) => {
            if (error) return reject(error)
            if (!result?.secure_url || !result.public_id) {
                return reject(new Error("Cloudinary no devolvió la URL de la imagen subida"))
            }
            resolve(result)
        })

        stream.on("error", reject)
        stream.end(buffer)
    })
}

async function replaceImage(buffer, previousUrl, folder, publicId) {
    const previousPublicId = getPublicId(previousUrl)
    const targetPublicId = `${folder}/${publicId}`
    const uploaded = await uploadImage(
        buffer,
        folder,
        publicId,
        previousPublicId === targetPublicId
    )
    if (previousPublicId && previousPublicId !== uploaded.public_id) {
        await deleteImage(previousUrl)
    }
    return uploaded
}

async function moveImage(imageUrl, folder, publicId) {
    const previousPublicId = getPublicId(imageUrl)
    if (!previousPublicId) return null

    const newPublicId = `${folder}/${publicId}`
    if (previousPublicId === newPublicId) {
        return { secure_url: imageUrl, public_id: previousPublicId }
    }

    return getCloudinary().uploader.rename(previousPublicId, newPublicId, {
        invalidate: true
    })
}

async function deleteImage(imageUrl) {
    const publicId = getPublicId(imageUrl)
    if (!publicId) return false

    const result = await getCloudinary().uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true
    })
    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error(`Cloudinary no pudo eliminar la imagen: ${result.result}`)
    }
    return true
}

function normalizeProjectFolderName(name) {
    const normalizedName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

    if (!normalizedName) {
        throw new Error("El nombre del proyecto no genera un nombre de carpeta válido")
    }
    return normalizedName
}

module.exports = {
    replaceImage,
    moveImage,
    deleteImage,
    normalizeProjectFolderName
}
