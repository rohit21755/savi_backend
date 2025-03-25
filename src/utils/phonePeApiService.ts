import axios from 'axios';
import phonePeTokenManager from './phonePeTokenManager';

class PhonePeApiService {
    private static BASE_URL = process.env.PHONEPE_API_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    public static async makeProtectedApiCall<T>(
        endpoint: string, 
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST', 
        data?: any
    ): Promise<T> {
        try {
            const token = await phonePeTokenManager.getToken();

            const response = await axios({
                method,
                url: `${this.BASE_URL}${endpoint}`,
                data,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error in PhonePe API call:', error);
            
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                try {
                    await phonePeTokenManager.refreshToken();
                    return this.makeProtectedApiCall(endpoint, method, data);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    throw refreshError;
                }
            }

            throw error;
        }
    }

    public static async createPaymentTransaction(transactionData: any) {
        return this.makeProtectedApiCall('/payment/create', 'POST', transactionData);
    }

    public static async getTokenExpirationTime() {
        return phonePeTokenManager.getTokenExpirationTime();
    }
}

export default PhonePeApiService;