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

    // 1. Initiate Google Login: এই রুটটি React থেকে কল করা হবে
    register_rest_route('jpbd/v1', '/auth/google/initiate', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_initiate_google_login',
        'permission_callback' => '__return_true',
    ]);

    // 2. Handle Google Callback: গুগল এই রুটে ব্যবহারকারীকে ফেরত পাঠাবে
    register_rest_route('jpbd/v1', '/auth/google/callback', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_handle_google_callback',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('jpbd/v1', '/auth/linkedin/initiate', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_initiate_linkedin_login',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('jpbd/v1', '/auth/linkedin/callback', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_handle_linkedin_callback',
        'permission_callback' => '__return_true',
    ]);

    // ধাপ ১: পাসওয়ার্ড রিসেট রিকোয়েস্ট এবং OTP পাঠানো
    register_rest_route('jpbd/v1', '/auth/request-reset', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_request_password_reset',
        'permission_callback' => '__return_true',
    ]);

    // ধাপ ২: OTP ভেরিফাই করা
    register_rest_route('jpbd/v1', '/auth/verify-token', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_verify_reset_token',
        'permission_callback' => '__return_true',
    ]);

    // ধাপ ৩: নতুন পাসওয়ার্ড সেট করা
    register_rest_route('jpbd/v1', '/auth/reset-password', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_set_new_password',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('jpbd/v1', '/auth/complete-social-registration', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_complete_social_registration',
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

    $full_name = isset($params['fullName']) ? sanitize_text_field($params['fullName']) : '';
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    $password = isset($params['password']) ? $params['password'] : '';
    $role = isset($params['role']) ? sanitize_key($params['role']) : ''; // নতুন: রোল গ্রহণ করা

    // --- ভ্যালিডেশন ---
    $allowed_roles = ['employer', 'candidate', 'business'];
    if (empty($role) || !in_array($role, $allowed_roles, true)) {
        return new WP_Error('registration_failed', 'A valid role is required.', ['status' => 400]);
    }
    // ... (আপনার আগের অন্যান্য ভ্যালিডেশন)

    if (username_exists($email) || email_exists($email)) {
        return new WP_Error('registration_failed', 'An account with this email address already exists.', ['status' => 409]);
    }

    // --- ইউজার তৈরি করা ---
    $user_data = [
        'user_login' => $email,
        'user_email' => $email,
        'user_pass'  => $password,
        'display_name' => $full_name,
        'role'       => $role, // ডাইনামিক রোল সেট করা
    ];
    $user_id = wp_insert_user($user_data);

    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 500]);
    }

    return new WP_REST_Response(['success' => true, 'message' => 'Registration successful! You can now log in.'], 201);
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

    // প্রথমে ইউজারকে ভেরিফাই করে তার অবজেক্টটি নিয়ে আসা
    $user = wp_authenticate($email, $password);

    if (is_wp_error($user)) {
        return new WP_Error('login_failed', 'Invalid email or password.', ['status' => 403]);
    }

    // এখন JWT প্লাগইনের কাছে টোকেনের জন্য রিকোয়েস্ট পাঠানো
    $login_request = new WP_REST_Request('POST', '/jwt-auth/v1/token');
    $login_request->set_body_params([
        'username' => $email,
        'password' => $password,
    ]);

    $response = rest_do_request($login_request);
    $data = rest_get_server()->response_to_data($response, false);

    if ($response->is_error()) {
        return new WP_Error('login_failed', 'Token generation failed.', ['status' => 500]);
    }

    // ======================================================
    // এই অংশটিই হলো আসল সমাধান:
    // আমরা নিজে থেকে user ID-টি রেসপন্সের সাথে যোগ করে দিচ্ছি
    // ======================================================

    $data['id'] = $user->ID;
    $data['roles'] = array_values($user->roles);
    $data['avatar_url'] = get_avatar_url($user->ID);
    // ======================================================

    return new WP_REST_Response($data, 200);
}

function jpbd_api_initiate_google_login()
{
    // সেটিংস থেকে ডেটা আনা
    $settings = get_option('jpbd_settings', []);
    $client_id = isset($settings['googleClientId']) ? $settings['googleClientId'] : '';

    if (empty($client_id) || !isset($settings['googleEnabled']) || !$settings['googleEnabled']) {
        return new WP_Error('not_configured', 'Google Login is not configured or enabled.', ['status' => 500]);
    }

    $redirect_uri = rest_url('jpbd/v1/auth/google/callback');
    // ... বাকি কোড অপরিবর্তিত ...
    $google_auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
        'client_id' => $client_id, // <-- এখন ডাইনামিক
        'redirect_uri' => $redirect_uri,
        // ...
    ]);

    return new WP_REST_Response(['auth_url' => $google_auth_url], 200);
}

function jpbd_api_handle_google_callback(WP_REST_Request $request)
{
    $code = $request->get_param('code');

    if (empty($code)) {
        // যদি Google কোনো কোড না পাঠায়, তাহলে এররসহ লগইন পেজে ফেরত পাঠানো
        wp_redirect(site_url('/job-portal/login?error=google_auth_failed'));
        exit;
    }

    // ================== মূল এবং সম্পূর্ণ কোড এখানে ==================

    // --- ধাপ ১: টোকেন এক্সচেঞ্জ (Authorization Code -> Access Token) ---
    $settings = get_option('jpbd_settings', []);
    $client_id = isset($settings['googleClientId']) ? $settings['googleClientId'] : '';
    $client_secret = isset($settings['googleClientSecret']) ? $settings['googleClientSecret'] : '';
    $redirect_uri = rest_url('jpbd/v1/auth/google/callback');

    if (empty($client_id) || empty($client_secret)) {
        wp_redirect(site_url('/job-portal/login?error=google_not_configured'));
        exit;
    }

    // Google-এর টোকেন এন্ডপয়েন্টে POST রিকোয়েস্ট পাঠানো
    $response = wp_remote_post('https://oauth2.googleapis.com/token', [
        'method'    => 'POST',
        'timeout'   => 45,
        'headers'   => ['Content-Type' => 'application/x-www-form-urlencoded'],
        'body'      => [
            'code'          => $code,
            'client_id'     => $client_id,
            'client_secret' => $client_secret,
            'redirect_uri'  => $redirect_uri,
            'grant_type'    => 'authorization_code',
        ],
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        // যদি টোকেন পেতে ব্যর্থ হই
        wp_redirect(site_url('/job-portal/login?error=google_token_exchange_failed'));
        exit;
    }

    $token_data = json_decode(wp_remote_retrieve_body($response), true);
    $access_token = $token_data['access_token'];

    // --- ধাপ ২: Access Token ব্যবহার করে ইউজারের তথ্য আনা ---
    $user_info_response = wp_remote_get('https://www.googleapis.com/oauth2/v3/userinfo', [
        'headers' => [
            'Authorization' => 'Bearer ' . $access_token,
        ],
    ]);

    if (is_wp_error($user_info_response) || wp_remote_retrieve_response_code($user_info_response) !== 200) {
        // যদি ইউজারের তথ্য পেতে ব্যর্থ হই
        wp_redirect(site_url('/job-portal/login?error=google_userinfo_failed'));
        exit;
    }

    $google_user_data = json_decode(wp_remote_retrieve_body($user_info_response), true);
    $email = sanitize_email($google_user_data['email']);
    $full_name = sanitize_text_field($google_user_data['name']);

    // --- ধাপ ৩: ইউজার হ্যান্ডলিং (আগে থেকে আছে কিনা চেক করা) ---
    $user = get_user_by('email', $email);

    if ($user) {
        // --- ইউজার আগে থেকেই আছে: সরাসরি লগইন এবং ড্যাশবোর্ডে রিডাইরেক্ট ---
        wp_set_current_user($user->ID, $user->user_login);
        wp_set_auth_cookie($user->ID, true); // true প্যারামিটারটি "remember me" হিসেবে কাজ করে
        do_action('wp_login', $user->user_login, $user);

        wp_redirect(site_url('/job-portal/dashboard'));
        exit;
    } else {
        // --- নতুন ইউজার: রোল সিলেকশন পেজে রিডাইরেক্ট ---

        // Google থেকে পাওয়া তথ্য base64 এনকোড করে URL-এ যোগ করা
        $user_info_payload = json_encode([
            'email'     => $email,
            'full_name' => $full_name,
            'source'    => 'google'
        ]);
        $user_info_encoded = base64_encode($user_info_payload);

        // React রুট `/select-role`-এ রিডাইরেক্ট করা
        wp_redirect(site_url('/job-portal/select-role?user_info=' . urlencode($user_info_encoded)));
        exit;
    }
    // =============================================================
}

/**
 * Initiates the LinkedIn login process by generating the auth URL.
 */
function jpbd_api_initiate_linkedin_login()
{
    // এই ডেটাগুলো আপনার বানানো সেটিংস পেজ থেকে আসবে
    $client_id = 'YOUR_LINKEDIN_CLIENT_ID'; // LinkedIn থেকে পাওয়া Client ID

    $redirect_uri = rest_url('jpbd/v1/auth/linkedin/callback');
    $scope = 'openid profile email'; // নতুন ভার্সনে 'r_liteprofile r_emailaddress' এর পরিবর্তে এটি ব্যবহৃত হয়
    $state = bin2hex(random_bytes(16)); // CSRF আক্রমণ প্রতিরোধের জন্য একটি র‍্যান্ডম স্টেট

    // WordPress-এর সেশনে স্টেটটি সেভ করে রাখা
    if (!session_id()) {
        session_start();
    }
    $_SESSION['linkedin_oauth_state'] = $state;

    $linkedin_auth_url = 'https://www.linkedin.com/oauth/v2/authorization?' . http_build_query([
        'response_type' => 'code',
        'client_id' => $client_id,
        'redirect_uri' => $redirect_uri,
        'state' => $state,
        'scope' => $scope,
    ]);

    return new WP_REST_Response(['auth_url' => $linkedin_auth_url], 200);
}


/**
 * Handles the callback from LinkedIn after user authentication.
 */
function jpbd_api_handle_linkedin_callback(WP_REST_Request $request)
{
    if (!session_id()) {
        session_start();
    }

    $code = $request->get_param('code');
    $state = $request->get_param('state');

    // স্টেটের বৈধতা যাচাই করা
    if (empty($state) || !isset($_SESSION['linkedin_oauth_state']) || $_SESSION['linkedin_oauth_state'] !== $state) {
        wp_redirect(site_url('/job-portal/login?error=linkedin_state_mismatch'));
        exit;
    }

    if (empty($code)) {
        wp_redirect(site_url('/job-portal/login?error=linkedin_auth_failed'));
        exit;
    }

    // --- টোকেন এক্সচেঞ্জ ---
    $client_id = 'YOUR_LINKEDIN_CLIENT_ID';
    $client_secret = 'YOUR_LINKEDIN_CLIENT_SECRET';
    $redirect_uri = rest_url('jpbd/v1/auth/linkedin/callback');

    $response = wp_remote_post('https://www.linkedin.com/oauth/v2/accessToken', [
        'method' => 'POST',
        'body' => [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $redirect_uri,
            'client_id' => $client_id,
            'client_secret' => $client_secret,
        ],
    ]);

    if (is_wp_error($response)) {
        wp_redirect(site_url('/job-portal/login?error=linkedin_token_failed'));
        exit;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $access_token = $body['access_token'];

    // --- ব্যবহারকারীর প্রোফাইল ডেটা আনা ---
    $user_info_response = wp_remote_get('https://api.linkedin.com/v2/userinfo', [
        'headers' => [
            'Authorization' => 'Bearer ' . $access_token,
        ],
    ]);

    if (is_wp_error($user_info_response)) {
        wp_redirect(site_url('/job-portal/login?error=linkedin_userinfo_failed'));
        exit;
    }

    $user_data = json_decode(wp_remote_retrieve_body($user_info_response), true);
    $email = $user_data['email'];
    $full_name = $user_data['name'];

    // --- ইউজার হ্যান্ডলিং এবং লগইন (Google-এর মতোই) ---
    $user = get_user_by('email', $email);
    if (!$user) {
        $username = explode('@', $email)[0] . '_' . rand(100, 999);
        $password = wp_generate_password();
        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            wp_redirect(site_url('/job-portal/login?error=user_creation_failed'));
            exit;
        }

        wp_update_user(['ID' => $user_id, 'display_name' => $full_name, 'role' => 'job_seeker']);
        $user = get_user_by('id', $user_id);
    }

    wp_set_current_user($user->ID, $user->user_login);
    wp_set_auth_cookie($user->ID);

    // --- ড্যাশবোর্ডে রিডাইরেক্ট ---
    wp_redirect(site_url('/job-portal/dashboard'));
    exit;
}

function jpbd_api_request_password_reset(WP_REST_Request $request)
{
    $params = $request->get_json_params();
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';

    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Invalid email address provided.', ['status' => 400]);
    }

    $user = get_user_by('email', $email);
    if (!$user) {
        // ব্যবহারকারী খুঁজে না পেলেও আমরা একটি সফল মেসেজ দেখাবো নিরাপত্তার জন্য
        // যাতে কেউ ইমেল অ্যাড্রেস অনুমান করতে না পারে।
        return new WP_REST_Response(['success' => true, 'message' => 'If an account with that email exists, a password reset code has been sent.'], 200);
    }

    // একটি ৬ সংখ্যার OTP তৈরি করা
    $token = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiration_time = time() + (15 * 60); // টোকেনটি ১৫ মিনিটের জন্য বৈধ থাকবে

    // টোকেন এবং এর মেয়াদ শেষ হওয়ার সময় user meta-তে সেভ করা
    update_user_meta($user->ID, 'jpbd_reset_token', $token);
    update_user_meta($user->ID, 'jpbd_reset_token_expires', $expiration_time);

    // ব্যবহারকারীকে ইমেল পাঠানো
    $subject = 'Your Password Reset Code for ' . get_bloginfo('name');
    $message = "Hello,\n\nYour password reset code is: " . $token . "\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.";
    wp_mail($email, $subject, $message);

    return new WP_REST_Response(['success' => true, 'message' => 'A password reset code has been sent to your email.'], 200);
}


function jpbd_api_verify_reset_token(WP_REST_Request $request)
{
    $params = $request->get_json_params();
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    $token = isset($params['token']) ? sanitize_text_field($params['token']) : '';

    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('invalid_token', 'Invalid token or email.', ['status' => 400]);
    }

    $stored_token = get_user_meta($user->ID, 'jpbd_reset_token', true);
    $expiration = get_user_meta($user->ID, 'jpbd_reset_token_expires', true);

    if ($stored_token !== $token || time() > $expiration) {
        return new WP_Error('invalid_token', 'Your reset code is invalid or has expired.', ['status' => 400]);
    }

    // টোকেন সঠিক হলে, একটি অস্থায়ী ভেরিফিকেশন টোকেন তৈরি করে পাঠানো যেতে পারে
    // অথবা শুধু সফলতার মেসেজ পাঠানো যেতে পারে।
    return new WP_REST_Response(['success' => true, 'message' => 'Token verified successfully.'], 200);
}


function jpbd_api_set_new_password(WP_REST_Request $request)
{
    $params = $request->get_json_params();
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    $token = isset($params['token']) ? sanitize_text_field($params['token']) : '';
    $password = isset($params['password']) ? $params['password'] : '';

    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('invalid_data', 'Invalid data provided.', ['status' => 400]);
    }

    // টোকেনটি আবার ভেরিফাই করা নিরাপত্তার জন্য
    $stored_token = get_user_meta($user->ID, 'jpbd_reset_token', true);
    $expiration = get_user_meta($user->ID, 'jpbd_reset_token_expires', true);

    if ($stored_token !== $token || time() > $expiration) {
        return new WP_Error('invalid_token', 'Your session has expired. Please try again.', ['status' => 400]);
    }

    // নতুন পাসওয়ার্ড সেট করা
    wp_set_password($password, $user->ID);

    // ব্যবহৃত টোকেনটি মুছে ফেলা
    delete_user_meta($user->ID, 'jpbd_reset_token');
    delete_user_meta($user->ID, 'jpbd_reset_token_expires');

    return new WP_REST_Response(['success' => true, 'message' => 'Password has been reset successfully. You can now log in.'], 200);
}

function jpbd_api_complete_social_registration(WP_REST_Request $request)
{
    $params = $request->get_json_params();

    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    $full_name = isset($params['full_name']) ? sanitize_text_field($params['full_name']) : '';
    $role = isset($params['role']) ? sanitize_key($params['role']) : '';

    // ভ্যালিডেশন
    if (empty($email) || empty($full_name) || empty($role)) {
        return new WP_Error('missing_data', 'Required user data is missing.', ['status' => 400]);
    }
    if (email_exists($email)) {
        return new WP_Error('email_exists', 'This email is already registered.', ['status' => 409]);
    }
    $allowed_roles = ['employer', 'candidate', 'business'];
    if (!in_array($role, $allowed_roles)) {
        return new WP_Error('invalid_role', 'An invalid role was selected.', ['status' => 400]);
    }

    // নতুন ইউজার তৈরি করা
    $username = explode('@', $email)[0] . '_' . bin2hex(random_bytes(2));
    $password = wp_generate_password(12, true, true);

    $user_id = wp_create_user($username, $password, $email);

    if (is_wp_error($user_id)) {
        return new WP_Error('user_creation_failed', $user_id->get_error_message(), ['status' => 500]);
    }

    // Full name এবং রোল সেট করা
    wp_update_user([
        'ID' => $user_id,
        'display_name' => $full_name,
        'role' => $role,
    ]);

    // ইউজারকে ইমেলের মাধ্যমে তার পাসওয়ার্ড জানানো যেতে পারে (ঐচ্ছিক কিন্তু ভালো)
    // wp_new_user_notification($user_id, null, 'user');

    // ইউজারকে লগইন করানো এবং JWT টোকেন তৈরি করে পাঠানো
    $user = get_user_by('id', $user_id);

    $login_request = new WP_REST_Request('POST', '/jwt-auth/v1/token');
    $login_request->set_body_params(['username' => $user->user_login, 'password' => $password]);
    $response = rest_do_request($login_request);
    $data = rest_get_server()->response_to_data($response, false);

    if ($response->is_error()) {
        return new WP_Error('token_failed', 'Could not log in the new user.', ['status' => 500]);
    }

    $data['id'] = $user->ID;
    $data['roles'] = array_values($user->roles);
    $data['avatar_url'] = get_avatar_url($user->ID);
    $data['user_display_name'] = $user->display_name;

    return new WP_REST_Response($data, 201);
}
