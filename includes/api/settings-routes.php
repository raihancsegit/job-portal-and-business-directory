<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register all settings related API routes.
 */
function jpbd_register_settings_api_routes()
{
    register_rest_route('jpbd/v1', '/settings', [
        [
            'methods' => 'GET',
            'callback' => 'jpbd_api_get_all_settings',
            // পারমিশন কলব্যাক আপডেট করা হয়েছে
            'permission_callback' => function ($request) {
                // 'wp_rest' Nonce টি ভেরিফাই করা
                if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
                    return new WP_Error('rest_forbidden', 'Bad nonce.', ['status' => 403]);
                }
                // শুধুমাত্র 'manage_options' ক্ষমতা সম্পন্ন ব্যবহারকারীই এটি করতে পারবে
                return current_user_can('manage_options');
            },
        ],
        [
            'methods' => 'POST',
            'callback' => 'jpbd_api_save_all_settings',
            // POST রিকোয়েস্টের জন্যও একই পারমিশন কলব্যাক
            'permission_callback' => function ($request) {
                if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
                    return new WP_Error('rest_forbidden', 'Bad nonce.', ['status' => 403]);
                }
                return current_user_can('manage_options');
            },
        ]
    ]);
}
add_action('rest_api_init', 'jpbd_register_settings_api_routes');


/**
 * API callback to get all plugin settings.
 * @return WP_REST_Response
 */
function jpbd_api_get_all_settings()
{
    // Default values for all settings
    $defaults = [
        'googleEnabled' => true,
        'googleClientId' => '',
        'googleClientSecret' => '',
        'linkedinEnabled' => false,
        'linkedinClientId' => '',
        'linkedinClientSecret' => '',
        'loginBgImage' => '',
        'loginBgColor' => '#f0f0f1',
        'signupBgImage' => '',
        'signupBgColor' => '#f0f0f1',
        'forgotBgImage' => '',
        'forgotBgColor' => '#ffffff',
    ];

    $settings = get_option('jpbd_settings', $defaults);
    // Ensure all default keys exist in the returned settings
    $settings = wp_parse_args($settings, $defaults);

    return new WP_REST_Response($settings, 200);
}

/**
 * API callback to save all plugin settings.
 * @param WP_REST_Request $request
 * @return WP_REST_Response
 */
function jpbd_api_save_all_settings(WP_REST_Request $request)
{
    $params = $request->get_json_params();

    $existing_settings = get_option('jpbd_settings', []);

    // Sanitize all incoming data before saving
    $sanitized_settings = [
        'googleEnabled' => isset($params['googleEnabled']) ? (bool) $params['googleEnabled'] : false,
        'googleClientId' => isset($params['googleClientId']) ? sanitize_text_field($params['googleClientId']) : '',
        'googleClientSecret' => isset($params['googleClientSecret']) ? sanitize_text_field($params['googleClientSecret']) : '',
        'linkedinEnabled' => isset($params['linkedinEnabled']) ? (bool) $params['linkedinEnabled'] : false,
        'linkedinClientId' => isset($params['linkedinClientId']) ? sanitize_text_field($params['linkedinClientId']) : '',
        'linkedinClientSecret' => isset($params['linkedinClientSecret']) ? sanitize_text_field($params['linkedinClientSecret']) : '',
        'loginBgImage' => isset($params['loginBgImage']) ? esc_url_raw($params['loginBgImage']) : '',
        'loginBgColor' => isset($params['loginBgColor']) ? sanitize_hex_color($params['loginBgColor']) : '#f0f0f1',
        'signupBgImage' => isset($params['signupBgImage']) ? esc_url_raw($params['signupBgImage']) : '',
        'signupBgColor' => isset($params['signupBgColor']) ? sanitize_hex_color($params['signupBgColor']) : '#f0f0f1',
        'forgotBgImage' => isset($params['forgotBgImage']) ? esc_url_raw($params['forgotBgImage']) : '',
        'forgotBgColor' => isset($params['forgotBgColor']) ? sanitize_hex_color($params['forgotBgColor']) : '#ffffff',
    ];

    // Merge new settings with existing ones and update the option
    $updated_settings = wp_parse_args($sanitized_settings, $existing_settings);
    update_option('jpbd_settings', $updated_settings);

    return new WP_REST_Response(['success' => true, 'message' => 'Settings saved successfully!'], 200);
}

/**
 * Register plugin settings with WordPress options API.
 */
function jpbd_register_all_settings()
{
    register_setting(
        'jpbd_settings_group',
        'jpbd_settings'
    );
}
add_action('admin_init', 'jpbd_register_all_settings');
