import axios from 'axios';

interface PhonePeTokenResponse {
    access_token: string;
    encrypted_access_token: string;
    expires_in: number | null;
    issued_at: number;
    expires_at: number;
    session_expires_at: number;
    token_type: string;
}

class PhonePeTokenManager {
    private static instance: PhonePeTokenManager;
    
    private currentToken: string | null = null;
    private tokenExpiresAt: number | null = null;

    private constructor() {}

    public static getInstance(): PhonePeTokenManager {
        if (!PhonePeTokenManager.instance) {
            PhonePeTokenManager.instance = new PhonePeTokenManager();
        }
        return PhonePeTokenManager.instance;
    }

    private isTokenValid(): boolean {
        if (!this.currentToken || !this.tokenExpiresAt) {
            return false;
        }

        const expiryBuffer = 5 * 60;
        return Math.floor(Date.now() / 1000) < (this.tokenExpiresAt - expiryBuffer);
    }

    private async fetchNewToken(): Promise<PhonePeTokenResponse> {
        const requiredEnvVars = [
            'PHONEPE_AUTHTOKEN_URL_PROD', 
            'PHONEPE_CLIENT_ID', 
            'PHONEPE_CLIENT_SECRET'
        ];
        
        for (const varName of requiredEnvVars) {
            if (!process.env[varName]) {
                throw new Error(`${varName} is not defined in environment variables`);
            }
        }

        try {
            const data = new URLSearchParams({
                client_id: process.env.PHONEPE_CLIENT_ID!,
                client_version: '1',
                client_secret: process.env.PHONEPE_CLIENT_SECRET!,
                grant_type: 'client_credentials'
            });

            const response = await axios.post<PhonePeTokenResponse>(
               "https://api.phonepe.com/apis/identity-manager/v1/oauth/token", 
                data, 
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            console.log('PhonePe Token Obtained:', {
                issuedAt: new Date(response.data.issued_at * 1000).toISOString(),
                expiresAt: new Date(response.data.expires_at * 1000).toISOString()
            });

            return response.data;
        } catch (error) {
            console.error("Failed to fetch PhonePe authorization token:", error);
            throw error;
        }
    }

    public async getToken(): Promise<string> {
        if (this.isTokenValid() && this.currentToken) {
            return this.currentToken;
        }

        try {
            const tokenResponse = await this.fetchNewToken();
            
            this.currentToken = tokenResponse.access_token;
            this.tokenExpiresAt = tokenResponse.expires_at;

            return this.currentToken;
        } catch (error) {
            console.error("Error getting PhonePe authorization token:", error);
            throw error;
        }
    }

    public async refreshToken(): Promise<string> {
        const tokenResponse = await this.fetchNewToken();
        
        this.currentToken = tokenResponse.access_token;
        this.tokenExpiresAt = tokenResponse.expires_at;

        return this.currentToken;
    }

    public getTokenExpirationTime(): Date | null {
        return this.tokenExpiresAt 
            ? new Date(this.tokenExpiresAt * 1000) 
            : null;
    }
}

export const phonePeTokenManager = PhonePeTokenManager.getInstance();
export default phonePeTokenManager;