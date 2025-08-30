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
        'methods' => 'POST', // 'POST' এর পরিবর্তে কনস্ট্যান্ট ব্যবহার করা ভালো
        'callback' => 'jpbd_api_register_user',
        'permission_callback' => '__return_true',
    ]);

    // API Route: /auth/login
    register_rest_route('jpbd/v1', '/auth/login', [
        'methods' => 'POST',
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
    $params = $request->get_json_params();

    // 1. Validate the data from React
    $full_name = isset($params['fullName']) ? sanitize_text_field($params['fullName']) : '';
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    $password = isset($params['password']) ? $params['password'] : '';

    if (empty($full_name)) {
        return new WP_Error('registration_failed', 'Full name is required.', ['status' => 400]);
    }
    if (!is_email($email)) {
        return new WP_Error('registration_failed', 'Invalid email address.', ['status' => 400]);
    }
    if (empty($password) || strlen($password) < 6) {
        return new WP_Error('registration_failed', 'Password must be at least 6 characters long.', ['status' => 400]);
    }

    // 2. Check if user already exists
    if (username_exists($email) || email_exists($email)) {
        return new WP_Error('registration_failed', 'An account with this email address already exists.', ['status' => 409]); // 409 Conflict
    }

    // 3. Create the new user
    $user_data = [
        'user_login' => $email,
        'user_email' => $email,
        'user_pass'  => $password,
        'display_name' => $full_name,
        'role'       => 'job_seeker', // আমাদের নতুন কাস্টম রোল
    ];

    $user_id = wp_insert_user($user_data);

    // 4. Check for errors and return response
    if (is_wp_error($user_id)) {
        // If wp_insert_user fails, it returns a WP_Error object
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 500]);
    }

    // Registration successful!
    // ভবিষ্যতে এখানে ব্যবহারকারীকে অটো-লগইন করানো যেতে পারে
    // এবং একটি লগইন টোকেন রিটার্ন করা যেতে পারে।

    return new WP_REST_Response([
        'success' => true,
        'message' => 'Registration successful! You can now log in.',
    ], 201); // 201 Created
}

/**
 * API Callback: Handle user login.
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function jpbd_api_login_user(WP_REST_Request $request)
{
    $params = $request->get_json_params();
    $email = isset($params['email']) ? $params['email'] : '';
    $password = isset($params['password']) ? $params['password'] : '';

    if (empty($email) || empty($password)) {
        return new WP_Error('login_failed', 'Email and password are required.', ['status' => 400]);
    }

    // WP-JWT-Auth প্লাগইন থেকে দেওয়া API এন্ডপয়েন্ট কল করা
    $login_request = new WP_REST_Request('POST', '/jwt-auth/v1/token');
    $login_request->set_body_params([
        'username' => $email,
        'password' => $password,
    ]);

    $response = rest_do_request($login_request);
    $data = rest_get_server()->response_to_data($response, false);

    if ($response->is_error()) {
        $error_code = $response->get_data()['code'];
        $message = 'Invalid email or password.';
        // JWT প্লাগইন বিভিন্ন এরর কোড দেয়, আমরা একটি সাধারণ মেসেজ দেখাব
        if ($error_code === '[jwt_auth] invalid_email' || $error_code === '[jwt_auth] incorrect_password') {
            return new WP_Error('login_failed', $message, ['status' => 403]);
        }
        return new WP_Error('login_failed', 'An unknown error occurred.', ['status' => 500]);
    }

    // সফল লগইনের পর JWT প্লাগইন থেকে পাওয়া ডেটা রিটার্ন করা
    // ডেটার মধ্যে token, user_email, user_nicename, user_display_name থাকবে
    return new WP_REST_Response($data, 200);
}
