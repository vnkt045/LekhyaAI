// Call this function after successful login to track activity
export async function trackLoginActivity() {
    try {
        await fetch('/api/auth/track-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to track login:', error);
        // Don't throw - login should succeed even if tracking fails
    }
}
