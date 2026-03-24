/**
 * Extracts a human-readable error message from raw API/server errors.
 * Handles JSON dumps from Polar, better-auth, and other services.
 */
export function getReadableErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
    const raw = typeof error === "string"
        ? error
        : error instanceof Error
            ? error.message
            : String(error ?? "")

    if (!raw) return fallback

    // Check for known error patterns before trying JSON parse
    if (raw.includes("User already exists") || raw.includes("external ID cannot be updated")) {
        return "An account with this email already exists. Please log in instead."
    }
    if (raw.includes("Invalid email or password") || raw.includes("INVALID_PASSWORD") || raw.includes("INVALID_EMAIL_OR_PASSWORD")) {
        return "Invalid email or password."
    }
    if (raw.includes("User not found") || raw.includes("user_not_found")) {
        return "No account found with this email."
    }
    if (raw.includes("too many requests") || raw.includes("429")) {
        return "Too many attempts. Please try again later."
    }
    if (raw.includes("ResourceNotFound") || raw.includes("Not found")) {
        return "The requested resource was not found."
    }
    if (raw.includes("Unauthorized") || raw.includes("401")) {
        return "You are not authorized. Please log in again."
    }
    if (raw.includes("INTERNAL_SERVER_ERROR") || raw.includes("Internal Server Error")) {
        return "An internal server error occurred. Please try again later."
    }
    if (raw.includes("network") || raw.includes("ECONNREFUSED") || raw.includes("fetch failed")) {
        return "Network error. Please check your connection and try again."
    }

    // If it looks like a raw JSON/API dump, return the fallback
    if (raw.includes("{") && raw.includes("}")) {
        return fallback
    }

    // If the raw message is reasonable length and doesn't look like JSON, use it
    if (raw.length <= 150) {
        return raw
    }

    return fallback
}
