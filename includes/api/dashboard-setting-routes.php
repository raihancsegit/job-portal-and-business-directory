<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) exit;

/**
 * Register all dashboard related API routes.
 */
function jpbd_register_dashboard_api_routes()
{
    // Get current user's profile data
    register_rest_route('jpbd/v1', '/profile', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_get_profile_data',
        // Use the standard WordPress permission check for logged-in users
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    // Update current user's profile data
    register_rest_route('jpbd/v1', '/profile', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_update_profile_data',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    // Update current user's password
    register_rest_route('jpbd/v1', '/profile/password', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_update_password',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);
}
add_action('rest_api_init', 'jpbd_register_dashboard_api_routes');


/**
 * API: Get profile data for the current logged-in user.
 */
function jpbd_api_get_profile_data()
{
    $user = wp_get_current_user();
    if (0 === $user->ID) {
        return new WP_Error('no_user', 'You must be logged in to view your profile.', ['status' => 401]);
    }

    $profile_data = [
        'email' => $user->user_email,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'gender' => get_user_meta($user->ID, 'gender', true),
        'birth_date' => get_user_meta($user->ID, 'birth_date', true),
        'phone_code' => get_user_meta($user->ID, 'phone_code', true),
        'phone_number' => get_user_meta($user->ID, 'phone_number', true),
        'country' => get_user_meta($user->ID, 'country', true),
        'city' => get_user_meta($user->ID, 'city', true),
        'address' => get_user_meta($user->ID, 'address', true),
        'profile_picture_url' => get_avatar_url($user->ID),
    ];

    return new WP_REST_Response($profile_data, 200);
}

/**
 * API: Update profile data for the current logged-in user.
 */
function jpbd_api_update_profile_data(WP_REST_Request $request)
{
    $user_id = get_current_user_id();

    if (0 === $user_id) {
        return new WP_Error('no_user', 'You must be logged in...', ['status' => 401]);
    }

    $params = $request->get_params();
    $files = $request->get_file_params();

    // First Name, Last Name আপডেট
    $user_data = ['ID' => $user_id];
    if (isset($params['first_name'])) {
        $user_data['first_name'] = sanitize_text_field($params['first_name']);
    }
    if (isset($params['last_name'])) {
        $user_data['last_name'] = sanitize_text_field($params['last_name']);
    }
    if (count($user_data) > 1) {
        wp_update_user($user_data);
    }

    // অন্যান্য মেটা ফিল্ড আপডেট
    $meta_fields = ['gender', 'birth_date', 'phone_code', 'phone_number', 'country', 'city', 'address'];
    foreach ($meta_fields as $field) {
        if (isset($params[$field])) {
            update_user_meta($user_id, $field, sanitize_text_field($params[$field]));
        }
    }

    $new_avatar_url = null; // নতুন অ্যাভাটার URL রাখার জন্য ভ্যারিয়েবল

    // প্রোফাইল ছবি আপলোড
    if (!empty($files['profile_picture'])) {
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');

        $attachment_id = media_handle_upload('profile_picture', 0);

        if (!is_wp_error($attachment_id)) {
            update_user_meta($user_id, 'jpbd_profile_picture_id', $attachment_id);
            // ================== নতুন পরিবর্তন এখানে ==================
            // সফলভাবে আপলোড হওয়ার পর নতুন URL টি পাওয়া
            $new_avatar_url = wp_get_attachment_url($attachment_id);
            // =======================================================
        }
    }

    // আপডেটেড ইউজার ইনফো আনা (Full Name এর জন্য)
    $updated_user_info = get_userdata($user_id);
    $first_name = get_user_meta($user_id, 'first_name', true);
    $last_name = get_user_meta($user_id, 'last_name', true);
    $full_name = trim("$first_name $last_name");
    $display_name = !empty($full_name) ? $full_name : $updated_user_info->display_name;

    $response_data = [
        'success' => true,
        'message' => 'Profile updated successfully.',
        'user' => [
            'user_display_name' => $display_name,
            // যদি নতুন ছবি আপলোড হয়, তাহলে নতুন URL, নাহলে পুরনো URL পাঠানো
            'avatar_url' => $new_avatar_url ? $new_avatar_url : get_avatar_url($user_id),
        ]
    ];

    return new WP_REST_Response($response_data, 200);
}

/**
 * API: Update password for the current logged-in user.
 */
function jpbd_api_update_password(WP_REST_Request $request)
{
    $user = wp_get_current_user();
    if (0 === $user->ID) {
        return new WP_Error('no_user', 'You must be logged in to update your password.', ['status' => 401]);
    }
    $params = $request->get_json_params();

    if (!wp_check_password($params['currentPassword'], $user->user_pass, $user->ID)) {
        return new WP_Error('password_mismatch', 'Your current password does not match.', ['status' => 403]);
    }

    if ($params['newPassword'] !== $params['confirmPassword']) {
        return new WP_Error('new_password_mismatch', 'New passwords do not match.', ['status' => 400]);
    }
    if (strlen($params['newPassword']) < 8) {
        return new WP_Error('password_too_short', 'Password must be at least 8 characters long.', ['status' => 400]);
    }

    wp_set_password($params['newPassword'], $user->ID);

    return new WP_REST_Response(['success' => true, 'message' => 'Password updated successfully.'], 200);
}
