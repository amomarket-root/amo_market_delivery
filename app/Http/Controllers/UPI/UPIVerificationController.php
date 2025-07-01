<?php

namespace App\Http\Controllers\UPI;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UPIVerificationController extends Controller
{
    public function verify(Request $request)
    {
        // Step 1: Validate input format
        $validator = Validator::make($request->all(), [
            'upi_id' => ['required', 'regex:/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $upiId = $request->input('upi_id');

        // Step 2: Validate UPI format
        if (!$this->isValidUpiFormat($upiId)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid UPI ID format',
                'upi_id' => $upiId,
            ], 400);
        }

        // Step 3: Verify UPI using Cashfree
        $verificationResponse = $this->verifyWithCashfree($upiId);

        return response()->json([
            'success' => $verificationResponse['status'] === 'success',
            'upi_id' => $upiId,
            'customer_name' => $verificationResponse['customer_name'] ?? null,
            'message' => $verificationResponse['message'],
            'data' => $verificationResponse['data'] ?? null,
            'is_valid' => $verificationResponse['is_valid'] ?? false
        ], $verificationResponse['status'] === 'success' ? 200 : 400);
    }

    protected function isValidUpiFormat($upiId)
    {
        if (!preg_match('/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/', $upiId)) {
            return false;
        }

        $parts = explode('@', $upiId);
        $provider = strtolower($parts[1]);

        $validProviders = [
            'ybl', 'axis', 'okbizaxis', 'oksbi', 'paytm', 'ibl',
            'sbi', 'upi', 'axl', 'barodampay', 'hdfcbank', 'icici',
            'kotak', 'okicici', 'okhdfcbank', 'okaxis'
        ];

        return in_array($provider, $validProviders);
    }

    protected function verifyWithCashfree($upiId)
    {
        try {
            $baseUrl = config('services.cashfree.base_url');
            $clientId = config('services.cashfree.client_id');
            $clientSecret = config('services.cashfree.client_secret');
            $apiVersion = config('services.cashfree.version');

            $response = Http::withHeaders([
                'x-client-id' => $clientId,
                'x-client-secret' => $clientSecret,
                'x-api-version' => $apiVersion,
                'Content-Type' => 'application/json',
            ])->post("$baseUrl/verification/upi/validate", [
                'vpa' => $upiId
            ]);

            $responseData = $response->json();

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'message' => 'UPI verification successful',
                    'customer_name' => $responseData['name'] ?? null,
                    'is_valid' => $responseData['isValid'] ?? false,
                    'data' => $responseData
                ];
            }

            $errorMessage = $responseData['message'] ?? 'UPI verification failed';
            if (isset($responseData['subCode'])) {
                $errorMessage .= " (Code: {$responseData['subCode']})";
            }

            return [
                'status' => 'error',
                'message' => $errorMessage,
                'is_valid' => false,
                'data' => $responseData
            ];

        } catch (\Exception $e) {
            Log::error('Cashfree UPI verification failed: '.$e->getMessage(), [
                'upi_id' => $upiId,
                'error' => $e->getTraceAsString()
            ]);

            return [
                'status' => 'error',
                'message' => 'UPI verification service temporarily unavailable',
                'is_valid' => false,
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ];
        }
    }
}
