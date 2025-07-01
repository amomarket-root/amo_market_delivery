<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Delivery\DeliveryPersonController;
use App\Http\Controllers\Auth\DeliveryAuthenticateController;
use App\Http\Controllers\Delivery\DeliveryNotificationController;
use App\Http\Controllers\Delivery\DeliveryOrderDetailsController;
use App\Http\Controllers\Delivery\DeliveryPersonBankAccountController;
use App\Http\Controllers\Information\CompanyInformationController;
use App\Http\Controllers\UPI\UPIVerificationController;

/*----------------------------------------------------------*/
/*---------------- Third Party Routes -----------------------------*/
/*----------------------------------------------------------*/

Route::get('/ifsc-lookup/{ifsc}', function ($ifsc) {
    $response = Http::get("https://ifsc.razorpay.com/{$ifsc}");
    return $response->json();
});

/*----------------------------------------------------------*/
/*---------------- Shop Routes -----------------------------*/
/*----------------------------------------------------------*/

Route::prefix('delivery')->group(function () {

    //Company Information
    Route::get('about_us', [CompanyInformationController::class, 'getAboutUs']);
    Route::get('contact_us', [CompanyInformationController::class, 'getContactUs']);
    Route::get('privacy_policy', [CompanyInformationController::class, 'getPrivacyPolicy']);
    Route::get('careers', [CompanyInformationController::class, 'getCareers']);
    Route::get('terms', [CompanyInformationController::class, 'getTerms']);
    Route::get('security', [CompanyInformationController::class, 'getSecurity']);
    Route::get('shop_page', [CompanyInformationController::class, 'getShopPage']);
    Route::get('delivery_page', [CompanyInformationController::class, 'getDeliveryPage']);
    Route::get('blogs', [CompanyInformationController::class, 'getPaginateBlog']);
    Route::get('/blog/{id}', [CompanyInformationController::class, 'getBlogDetails']);

    /*----------------Delivery Auth Functionality----------------*/
    Route::prefix('authenticate')->group(function () {
        Route::post('/register', [DeliveryAuthenticateController::class, 'register']);
        Route::post('/login', [DeliveryAuthenticateController::class, 'login']);
        Route::post('/forgot_password', [DeliveryAuthenticateController::class, 'forgotPassword']);
        Route::post('/reset_password', [DeliveryAuthenticateController::class, 'resetPassword']);
    });

    Route::group(['middleware' => 'auth:sanctum'], function () {
        /*---------------- Portal Auth User Personal config----------------*/
        Route::post('/logout', [DeliveryAuthenticateController::class, 'logout']);
        Route::post('/change_password', [DeliveryAuthenticateController::class, 'changePassword']);
        Route::get('/view_profile', [DeliveryAuthenticateController::class, 'viewProfile']);
        Route::post('/update_profile', [DeliveryAuthenticateController::class, 'updateProfile']);

        Route::get('/check_delivery_person_document', [DeliveryPersonController::class, 'checkDeliveryPersonDocument']);
        Route::post('/save_delivery_person_details', [DeliveryPersonController::class, 'saveDeliveryPersonDetails']);
        Route::post('/toggle-online-status', [DeliveryPersonController::class, 'toggleOnlineStatus']);
        Route::get('/delivery-person-online-status', [DeliveryPersonController::class, 'getOnlineStatus']);
        Route::get('/delivery-details', [DeliveryPersonController::class, 'getDeliveryDetails']);
        Route::get('/orders_metrics', [DeliveryPersonController::class, 'getOrderMetrics']);
        Route::get('/get_delivery-person_location', [DeliveryPersonController::class, 'getLocation']);
        Route::post('/update_delivery-person_location', [DeliveryPersonController::class, 'UpdateLocation']);

        Route::get('/delivery-notifications', [DeliveryNotificationController::class, 'deliveryNotifications']);
        Route::post('/delivery-notifications/mark-as-read', [DeliveryNotificationController::class, 'markAsRead']);

        Route::get('/get_order_details_by_id/{orderId}', [DeliveryOrderDetailsController::class, 'getOrderDetailsById']);
        Route::post('/accept_delivery_order', [DeliveryOrderDetailsController::class, 'acceptDeliveryOrder']);
        Route::get('/get_order_details_with_shop_direction/{orderId}', [DeliveryOrderDetailsController::class, 'getOrderDetailsWithShopDirection']);
        Route::post('/reach_shop_location', [DeliveryOrderDetailsController::class, 'reachShopLocation']);
        Route::get('/get_order_details_with_user_direction/{orderId}', [DeliveryOrderDetailsController::class, 'getOrderDetailsWithUserDirection']);
        Route::post('/reach_user_location', [DeliveryOrderDetailsController::class, 'reachUserLocation']);
        Route::get('/get_order_with_user_details/{orderId}', [DeliveryOrderDetailsController::class, 'getOrderWithUserDetails']);
        Route::post('/order_delivered', [DeliveryOrderDetailsController::class, 'orderDelivered']);
        Route::post('/update_live_location', [DeliveryPersonController::class, 'updateLiveLocation']);

        Route::get('/get_delivery_person_bank-accounts', [DeliveryPersonBankAccountController::class, 'index']);
        Route::post('/store_delivery_person_bank-accounts', [DeliveryPersonBankAccountController::class, 'store']);
        Route::get('/delivery_person_bank-accounts_by_id/{id}', [DeliveryPersonBankAccountController::class, 'show']);
        Route::put('/update_delivery_person_bank-accounts/{id}', [DeliveryPersonBankAccountController::class, 'update']);
        Route::delete('/delete_delivery_person_bank-accounts/{id}', [DeliveryPersonBankAccountController::class, 'destroy']);

        Route::post('/verify-upi', [UPIVerificationController::class, 'verify']);
    });
});
