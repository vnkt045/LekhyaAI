/**
 * Centralized API fetch wrapper with proper error handling
 * Prevents "Unexpected token '<', '<!DOCTYPE'..." errors
 */

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    status: number;
}

export async function apiFetch<T = any>(
    url: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        // If strict redirect following leads to HTML (e.g., login page), handle it.
        // Or if the server returns HTML 500/404 error pages
        if (!isJson) {
            // Server returned HTML or other non-JSON content
            const text = await response.text();

            // Helpful debug log, truncating long HTML
            const preview = text.substring(0, 200).replace(/\n/g, ' ');
            console.error(`API Error: Expected JSON from ${url} but got ${contentType || 'unknown'}: ${preview}`);

            // If we got HTML, it is almost certainly a session expiry or server crash redirecting to a friendly error page.
            // The user wants this "eradicated" without error messages.
            // Best approach: If it looks like auth issue or we are in browser, hard refresh/redirect to login.

            if (typeof window !== 'undefined') {
                // Check if it looks like a login page or just generic HTML
                if (response.url.includes('/login') || text.includes('Sign In') || text.includes('<!DOCTYPE html')) {
                    console.warn('Session expired or Invalid JSON. Redirecting to login silently...');
                    window.location.href = '/api/auth/signin';
                    // Return a pending promise to freeze UI while redirect happens
                    return new Promise(() => { });
                }
            }

            return {
                error: response.ok
                    ? `Invalid API response format.`
                    : `Server error: ${response.status}`,
                status: response.status || 500
            };
        }

        const data = await response.json();

        if (!response.ok) {
            return {
                error: data.error || data.message || `Request failed with status ${response.status}`,
                status: response.status
            };
        }

        return {
            data,
            status: response.status
        };
    } catch (error) {
        console.error(`API fetch error for ${url}:`, error);

        // Network error or JSON parse error
        if (error instanceof SyntaxError) {
            return {
                error: 'Invalid JSON response from server. The API may be returning an error page.',
                status: 500
            };
        }

        return {
            error: error instanceof Error ? error.message : 'Network error occurred',
            status: 0
        };
    }
}

/**
 * Helper for GET requests
 */
export async function apiGet<T = any>(url: string): Promise<ApiResponse<T>> {
    return apiFetch<T>(url, { method: 'GET' });
}

/**
 * Helper for POST requests
 */
export async function apiPost<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    return apiFetch<T>(url, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * Helper for PUT requests
 */
export async function apiPut<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    return apiFetch<T>(url, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T = any>(url: string): Promise<ApiResponse<T>> {
    return apiFetch<T>(url, { method: 'DELETE' });
}
