export function FirebaseError(error: unknown): string {
    const msg = typeof error === "string" ? error : String(error ?? "");

    if (msg.includes("auth/invalid-credential")) {
        return "Invalid email or password.";
    } else if (msg.includes("auth/invalid-email")) {
        return "Invalid email address.";
    } else if (msg.includes("auth/user-not-found")) {
        return "User not found.";
    } else if (msg.includes("auth/wrong-password")) {
        return "Incorrect password.";
    } else if (msg.includes("auth/email-already-in-use")) {
        return "Email already in use.";
    } else if (msg.includes("auth/weak-password")) {
        return "Weak password. Please choose a stronger password.";
    } else if (msg.includes("auth/operation-not-allowed")) {
        return "Google sign-in is not enabled. Enable it in the Firebase console.";
    } else if (msg.includes("auth/account-exists-with-different-credential")) {
        return "An account already exists with this email. Sign in with your original method.";
    } else if (msg.includes("auth/popup-closed-by-user") || msg.includes("auth/cancelled-popup-request")) {
        return "Sign-in was cancelled.";
    } else if (msg.includes("missing ID token")) {
        return "Google sign-in failed. Please try again.";
    } else {
        return "An unknown error occurred.";
    }
}