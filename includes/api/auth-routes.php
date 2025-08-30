<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register all authentication related API routes.
 */
function jpbd_register_auth_routes()
{
    // API Namespace: jpbd/v1
    // API Route: /auth/register
    register_rest_route('jpbd/v1', '/auth/register', [
        'methods' => WP_REST_Server::CREATABLE, // 'POST' এর পরিবর্তে কনস্ট্যান্ট ব্যবহার করা ভালো
        'callback' => 'jpbd_api_register_user',
        'permission_callback' => '__return_true',
    ]);

    // API Route: /auth/login
    register_rest_route('jpbd/v1', '/auth/login', [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'jpbd_api_login_user',
        'permission_callback' => '__return_true',
    ]);

    // ভবিষ্যতে এখানে /auth/forget-password ইত্যাদি যোগ হবে
}
add_action('rest_api_init', 'jpbd_register_auth_routes');


/**
 * API Callback: Handle user registration.
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function jpbd_api_register_user(WP_REST_Request $request)
{
    // আমরা এখানে পরে আসল রেজিস্ট্রেশন লজিক লিখব
    $params = $request->get_json_params();
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';

    if (empty($email)) {
        return new WP_Error('registration_failed', 'Email is required.', ['status' => 400]);
    }

    // সিমুলেশন: সফল রেজিস্ট্রেশন
    return new WP_REST_Response([
        'success' => true,
        'message' => 'User ' . $email . ' registered successfully! (Sample response)',
    ], 200);
}

/**
 * API Callback: Handle user login.
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function jpbd_api_login_user(WP_REST_Request $request)
{
    // আমরা এখানে পরে আসল লগইন লজিক এবং JWT টোকেন জেনারেশন লিখব
    // সিমুলেশন: সফল লগইন
    return new WP_REST_Response([
        'success' => true,
        'message' => 'Login successful! (Sample response)',
        'token'   => 'sample_jwt_token_for_testing_purposes',
    ], 200);
}
