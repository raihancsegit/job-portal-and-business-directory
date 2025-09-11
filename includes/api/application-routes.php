<?php
if (!defined('ABSPATH')) exit;

// নতুন ডাটাবেস টেবিল তৈরি (এটি প্রধান প্লাগইন ফাইলে যোগ করতে হবে)
function jpbd_create_applications_table()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_applications';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        opportunity_id mediumint(9) NOT NULL,
        candidate_id bigint(20) UNSIGNED NOT NULL,
        cv_name varchar(255) NOT NULL,
        cv_url varchar(255) NOT NULL,
        application_date datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        status varchar(50) DEFAULT 'pending' NOT NULL,
        PRIMARY KEY  (id),
        KEY opportunity_id (opportunity_id),
        KEY candidate_id (candidate_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

// API রুট রেজিস্টার করা
function jpbd_register_application_api_routes()
{
    register_rest_route('jpbd/v1', '/applications', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_submit_application',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);
}
add_action('rest_api_init', 'jpbd_register_application_api_routes');

/**
 * API: Handle a new job application.
 */
function jpbd_api_submit_application(WP_REST_Request $request)
{
    $user_id = get_current_user_id();

    // শুধুমাত্র 'candidate' রোলের ব্যবহারকারীরাই আবেদন করতে পারবে
    if (!user_can($user_id, 'read')) { // read capability is a basic check for candidates
        return new WP_Error('permission_denied', 'Only candidates can apply for jobs.', ['status' => 403]);
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_applications';
    $params = $request->get_json_params();

    // ডেটা গ্রহণ এবং sanitize করা
    $data = [
        'opportunity_id' => (int) $params['opportunity_id'],
        'candidate_id' => $user_id,
        'cv_name' => sanitize_text_field($params['cv']['name']),
        'cv_url' => esc_url_raw($params['cv']['file_url']),
        'status' => 'received', // প্রাথমিক স্ট্যাটাস
    ];

    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        return new WP_Error('application_failed', 'Could not submit your application.', ['status' => 500]);
    }

    // ভবিষ্যতে এমপ্লয়ারকে নোটিফিকেশন পাঠানো যেতে পারে

    return new WP_REST_Response(['success' => true, 'message' => 'Application submitted successfully!'], 201);
}
