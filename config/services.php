<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'razorpay' => [
        'key' => env('RAZORPAY_KEY'),
        'secret' => env('RAZORPAY_SECRET'),
    ],
    'cashfree' => [
        'api_id' => env('CASHFREE_API_ID'),
        'secret_key' => env('CASHFREE_SECRET_KEY'),
        'client_id' => env('CASHFREE_CLIENT_ID'),
        'client_secret' => env('CASHFREE_CLIENT_SECRET'),
        'environment' => env('CASHFREE_ENVIRONMENT', 'test'), // 'test' or 'production'
        'base_url' => env('CASHFREE_ENVIRONMENT', 'test') === 'production'
            ? 'https://api.cashfree.com'
            : 'https://sandbox.cashfree.com',
        'version' => '2023-08-01', // Latest stable API version
    ],
];
