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
        status varchar(50) DEFAULT 'new' NOT NULL,
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

    // ১. একটি নির্দিষ্ট opportunity-র সকল আবেদনকারীকে আনার রুট
    register_rest_route('jpbd/v1', '/opportunities/(?P<id>\d+)/applications', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_get_applications_for_opportunity',
        'permission_callback' => function ($request) {
            // শুধুমাত্র ওই opportunity-র মালিকই আবেদনকারীদের দেখতে পারবে
            $opportunity_id = (int) $request['id'];
            $user_id = get_current_user_id();
            if ($user_id === 0) {
                return false; // লগইন করা না থাকলে অনুমতি নেই
            }

            global $wpdb;
            $table_name = $wpdb->prefix . 'jpbd_opportunities';
            $author_id = $wpdb->get_var($wpdb->prepare("SELECT user_id FROM $table_name WHERE id = %d", $opportunity_id));

            // পোস্টের লেখক এবং বর্তমান ব্যবহারকারী একই কিনা তা চেক করা হচ্ছে
            return (int) $author_id === $user_id;
        },
        'args' => [
            'id' => [
                // ================== FIX STARTS HERE ==================
                'validate_callback' => function ($param, $request, $key) {
                    return is_numeric($param);
                }
                // =================== FIX ENDS HERE ===================
            ],
        ],
    ]);

    // ২. আবেদনকারীর স্ট্যাটাস আপডেট করার রুট
    register_rest_route('jpbd/v1', '/applications/(?P<app_id>\d+)/status', [
        'methods' => 'POST', // আপনার প্রোজেক্টে আপডেটের জন্য POST ব্যবহার করা হয়
        'callback' => 'jpbd_api_update_application_status',
        'permission_callback' => function ($request) {
            // শুধুমাত্র 'manage_applications' ক্ষমতা থাকলেই অনুমতি দেওয়া হবে
            return current_user_can('manage_applications');
        },
        'args' => [
            'app_id' => [
                // ================== FIX STARTS HERE ==================
                'validate_callback' => function ($param, $request, $key) {
                    return is_numeric($param);
                }
                // =================== FIX ENDS HERE ===================
            ],
        ],
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
        'status' => 'new', // প্রাথমিক স্ট্যাটাস
    ];

    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        return new WP_Error('application_failed', 'Could not submit your application.', ['status' => 500]);
    }

    // ভবিষ্যতে এমপ্লয়ারকে নোটিফিকেশন পাঠানো যেতে পারে

    return new WP_REST_Response(['success' => true, 'message' => 'Application submitted successfully!'], 201);
}

/**
 * API Callback: Get all applications for a specific opportunity.
 */
// application-route.php ফাইলে এই ফাংশনটি নিশ্চিত করুন

function jpbd_api_get_applications_for_opportunity(WP_REST_Request $request)
{
    global $wpdb;
    $opportunity_id = (int) $request['id'];
    $app_table = $wpdb->prefix . 'jpbd_applications';
    $users_table = $wpdb->prefix . 'users';

    $query = $wpdb->prepare(
        "SELECT app.id, app.status, app.application_date, app.cv_name, app.cv_url, 
                usr.ID as candidate_user_id, usr.display_name, usr.user_email 
         FROM $app_table as app 
         JOIN $users_table as usr ON app.candidate_id = usr.ID 
         WHERE app.opportunity_id = %d 
         ORDER BY app.application_date DESC",
        $opportunity_id
    );
    $applications = $wpdb->get_results($query, ARRAY_A);

    if (is_null($applications)) {
        return new WP_Error('db_error', 'Could not retrieve applications.', ['status' => 500]);
    }

    foreach ($applications as &$app) {
        $app['cv_data'] = [
            'name' => $app['cv_name'],
            'file_url' => $app['cv_url']
        ];
        $app['candidate_details'] = [
            'title' => get_user_meta($app['candidate_user_id'], 'jpbd_title', true),
            'avatar' => get_avatar_url($app['candidate_user_id']),
        ];
        $app['created_at'] = $app['application_date'];
        unset($app['cv_name'], $app['cv_url'], $app['application_date']);
    }

    return new WP_REST_Response($applications, 200);
}

/**
 * API Callback: Update an application's status.
 */

function jpbd_api_update_application_status(WP_REST_Request $request)
{
    global $wpdb;
    $application_id = (int) $request['app_id'];
    $params = $request->get_json_params();
    $new_status = isset($params['status']) ? sanitize_text_field($params['status']) : '';

    $allowed_statuses = ['new', 'shortlisted', 'hired'];
    if (!in_array($new_status, $allowed_statuses)) {
        return new WP_Error('invalid_status', 'Invalid status provided.', ['status' => 400]);
    }

    $table_name = $wpdb->prefix . 'jpbd_applications';

    // ডাটাবেস আপডেট করা
    $result = $wpdb->update(
        $table_name,
        ['status' => $new_status], // SET status = 'new_status'
        ['id' => $application_id]  // WHERE id = application_id
    );

    // ================== FIX STARTS HERE ==================
    // ডাটাবেস এরর চেক করা
    if ($result === false) {
        return new WP_Error('db_error', 'Could not update status due to a database error.', ['status' => 500]);
    }

    // কোনো সারি আপডেট হয়েছে কিনা তা চেক করা
    if ($result === 0) {
        // এর মানে হলো, WHERE id = ? শর্তটি কোনো আবেদনকারীকে খুঁজে পায়নি।
        return new WP_Error('not_found', 'Application with the given ID was not found. No changes were made.', ['status' => 404]);
    }
    // =================== FIX ENDS HERE ===================

    // যদি $result > 0 হয়, তার মানে সফলভাবে আপডেট হয়েছে
    return new WP_REST_Response(['success' => true, 'message' => 'Status updated successfully.'], 200);
}
