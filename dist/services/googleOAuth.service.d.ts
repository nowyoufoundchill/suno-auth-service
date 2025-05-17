export interface AuthResult {
    success: boolean;
    sessionData?: string;
    cookies?: any[];
    error?: string;
}
export declare class GoogleOAuthService {
    private browser;
    /**
     * Authenticate with Google OAuth for Suno
     * @param email Google email
     * @param password Google password
     * @returns Session data that can be used for future requests
     */
    authenticate(email: string, password: string): Promise<AuthResult>;
    /**
     * Initialize browser with stealth configuration
     */
    private initBrowser;
    /**
     * Set up page with stealth measures to avoid detection
     */
    private setupStealthMode;
    /**
     * Perform the Google OAuth authentication flow
     */
    private performGoogleAuth;
    /**
     * Check if login was successful
     */
    private checkLoginStatus;
    /**
     * Close browser instance
     */
    private closeBrowser;
    /**
     * Verify if session data is still valid
     */
    verifySession(sessionData: string): Promise<boolean>;
}
export declare const googleOAuthService: GoogleOAuthService;
