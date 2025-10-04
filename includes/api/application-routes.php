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
        'permission_callback' => function () {
            // এখন যেকোনো লগইন করা ইউজারই এই ডেটা দেখতে পারবে
            return is_user_logged_in();
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
        'permission_callback' => function () {
            // এখন যেকোনো লগইন করা ইউজারই এই ডেটা দেখতে পারবে
            return is_user_logged_in();
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

    register_rest_route('jpbd/v1', '/applications/(?P<app_id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'jpbd_api_withdraw_application',
        'permission_callback' => 'is_user_logged_in',
    ]);

    // এমপ্লয়ারকে মেসেজ পাঠানোর জন্য POST রুট
    register_rest_route('jpbd/v1', '/contact-employer', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_contact_employer',
        'permission_callback' => 'is_user_logged_in',
    ]);
}
add_action('rest_api_init', 'jpbd_register_application_api_routes');

/**
 * API: Handle a new job application.
 */
function jpbd_api_submit_application(WP_REST_Request $request)
{
    $user_id = get_current_user_id();

    $user = get_userdata($user_id);
    if (!in_array('candidate', (array)$user->roles) && !in_array('business', (array)$user->roles)) {
        return new WP_Error('permission_denied', 'Only candidates or businesses can apply for jobs.', ['status' => 403]);
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_applications';
    $params = $request->get_json_params();

    $opportunity_id = isset($params['opportunity_id']) ? (int) $params['opportunity_id'] : 0;
    $existing_application = $wpdb->get_var($wpdb->prepare(
        "SELECT id FROM $table_name WHERE opportunity_id = %d AND candidate_id = %d",
        $opportunity_id,
        $user_id
    ));

    if ($existing_application) {
        return new WP_Error('already_applied', 'You have already applied for this opportunity.', ['status' => 409]); // 409 Conflict
    }

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

    $opp_table = $wpdb->prefix . 'jpbd_opportunities';
    $opportunity = $wpdb->get_row($wpdb->prepare("SELECT user_id, job_title FROM $opp_table WHERE id = %d", $opportunity_id));

    if ($opportunity) {
        $employer_id = $opportunity->user_id;
        $notification_message = $user->display_name . ' applied for your opportunity: ' . $opportunity->job_title;
        $notification_link = '/dashboard/opportunities/' . $opportunity_id; // Applicants tab-এ নিয়ে যাওয়া যেতে পারে
        jpbd_create_notification($employer_id, $user_id, 'new_application', $notification_message, $notification_link);
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
    $employer_user = wp_get_current_user();

    $allowed_statuses = ['new', 'shortlisted', 'hired'];
    if (!in_array($new_status, $allowed_statuses)) {
        return new WP_Error('invalid_status', 'Invalid status provided.', ['status' => 400]);
    }

    $app_table = $wpdb->prefix . 'jpbd_applications';
    $opp_table = $wpdb->prefix . 'jpbd_opportunities';

    $application_data = $wpdb->get_row($wpdb->prepare(
        "SELECT app.candidate_id, opp.job_title, opp.id as opportunity_id
         FROM $app_table as app
         JOIN $opp_table as opp ON app.opportunity_id = opp.id
         WHERE app.id = %d",
        $application_id
    ));

    if (!$application_data) {
        return new WP_Error('not_found', 'Application not found.', ['status' => 404]);
    }

    // ডাটাবেস আপডেট করা
    $result = $wpdb->update(
        $app_table,
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

    $candidate_user = get_userdata($application_data->candidate_id);
    if ($candidate_user) {
        // --- ১. ইমেল নোটিফিকেশন পাঠানো ---
        $to = $candidate_user->user_email;
        $subject = 'Update on your application for "' . $application_data->job_title . '"';

        $email_body = "Hello " . $candidate_user->display_name . ",\n\n";
        $email_body .= "There is an update on your job application for the position of '" . $application_data->job_title . "'.\n\n";
        $email_body .= "Your new application status is: " . ucfirst($new_status) . "\n\n";
        $email_body .= "You can view the opportunity here: " . home_url('/job-portal/dashboard/opportunities') . "\n\n"; // লিঙ্কটি আপনার রাউট অনুযায়ী পরিবর্তন করতে পারেন
        $email_body .= "Best regards,\n";
        $email_body .= $employer_user->display_name;

        $headers = ['Content-Type: text/plain; charset=UTF-8'];
        wp_mail($to, $subject, $email_body, $headers);

        // --- ২. প্ল্যাটফর্ম নোটিফিকেশন তৈরি করা ---
        if (function_exists('jpbd_create_notification')) {
            $notification_message = 'Your application for "' . wp_trim_words($application_data->job_title, 5, '...') . '" has been updated to ' . ucfirst($new_status) . '.';
            $notification_link = '/dashboard/opportunities?activeTab=applied'; // আবেদন করা জবের ট্যাবে নিয়ে যাওয়া

            // jpbd_create_notification($user_id, $sender_id, $type, $message, $link)
            jpbd_create_notification($candidate_user->ID, $employer_user->ID, 'application_status_update', $notification_message, $notification_link);
        }
    }

    // যদি $result > 0 হয়, তার মানে সফলভাবে আপডেট হয়েছে
    return new WP_REST_Response(['success' => true, 'message' => 'Status updated successfully.'], 200);
}


function jpbd_api_withdraw_application(WP_REST_Request $request)
{
    global $wpdb;
    $application_id = (int) $request['app_id'];
    $candidate_id = get_current_user_id();
    $table_name = $wpdb->prefix . 'jpbd_applications';

    // নিশ্চিত করা হচ্ছে যে শুধুমাত্র নিজের আবেদনই ডিলেট করা যাচ্ছে
    $application = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d AND candidate_id = %d",
        $application_id,
        $candidate_id
    ));

    if (!$application) {
        return new WP_Error('not_found_or_forbidden', 'Application not found or you do not have permission to delete it.', ['status' => 404]);
    }

    $result = $wpdb->delete($table_name, ['id' => $application_id]);

    if ($result === false) {
        return new WP_Error('db_error', 'Could not withdraw the application.', ['status' => 500]);
    }

    return new WP_REST_Response(['success' => true, 'message' => 'Application withdrawn successfully.'], 200);
}



/**
 * API Callback: Send a message to the employer (via email and chat system).
 * This is the corrected and complete version.
 */
function jpbd_api_contact_employer(WP_REST_Request $request)
{
    $sender_id = get_current_user_id();
    $sender_data = get_userdata($sender_id);
    $params = $request->get_json_params();

    $opportunity_id = isset($params['opportunity_id']) ? (int) $params['opportunity_id'] : 0;
    $message = isset($params['message']) ? sanitize_textarea_field($params['message']) : '';

    if (empty($opportunity_id) || empty($message)) {
        return new WP_Error('bad_request', 'Opportunity ID and message are required.', ['status' => 400]);
    }

    // Opportunity থেকে employer-এর ID এবং job title বের করা
    global $wpdb;
    $opp_table = $wpdb->prefix . 'jpbd_opportunities';
    $opportunity = $wpdb->get_row($wpdb->prepare("SELECT user_id, job_title FROM $opp_table WHERE id = %d", $opportunity_id));

    if (!$opportunity) {
        // SYNTAX FIX HERE
        return new WP_Error('not_found', 'Opportunity not found.', ['status' => 404]);
    }

    $employer_id = $opportunity->user_id;
    $employer_data = get_userdata($employer_id);

    if (!$employer_data) {
        return new WP_Error('not_found', 'Employer for this opportunity not found.', ['status' => 404]);
    }

    // --- ইমেল পাঠানো ---
    $to = $employer_data->user_email;
    $subject = 'New Message regarding your opportunity: "' . $opportunity->job_title . '"';

    // ইমেলের বডি তৈরি করা
    $body  = "Hello " . $employer_data->display_name . ",\n\n";
    $body .= "You have received a new message from a candidate regarding your posted opportunity: '" . $opportunity->job_title . "'.\n\n";
    $body .= "----------------------------------------\n";
    $body .= "Candidate Name: " . $sender_data->display_name . "\n";
    $body .= "Candidate Email: " . $sender_data->user_email . "\n\n";
    $body .= "Message:\n";
    $body .= $message . "\n";
    $body .= "----------------------------------------\n\n";
    $body .= "You can reply to them directly via email or check your inbox on the platform.\n\n";
    $body .= "Thank you,\n";
    $body .= get_bloginfo('name');

    // ইমেলের হেডার সেট করা
    $headers = [
        'Content-Type: text/plain; charset=UTF-8',
        'Reply-To: ' . $sender_data->display_name . ' <' . $sender_data->user_email . '>',
    ];

    // WordPress-এর wp_mail() ফাংশন ব্যবহার করে ইমেল পাঠানো
    $sent = wp_mail($to, $subject, $body, $headers);

    if (!$sent) {
        error_log('Failed to send contact employer email for opportunity ID: ' . $opportunity_id);
        return new WP_Error('email_failed', 'Could not send the message to the employer. Please check server email configuration.', ['status' => 500]);
    }

    // --- প্ল্যাটফর্মের চ্যাট সিস্টেমে মেসেজ সেভ করা ---
    if (function_exists('jpbd_get_conversation')) {
        $conv_table = $wpdb->prefix . 'jpbd_chat_conversations';
        $msg_table = $wpdb->prefix . 'jpbd_chat_messages';

        $conversation = jpbd_get_conversation($sender_id, $employer_id);
        if (!$conversation) {
            $user1 = min($sender_id, $employer_id);
            $user2 = max($sender_id, $employer_id);
            $wpdb->insert($conv_table, ['user1_id' => $user1, 'user2_id' => $user2]);
            $conversation_id = $wpdb->insert_id;
        } else {
            $conversation_id = $conversation->id;
        }

        $wpdb->insert($msg_table, ['conversation_id' => $conversation_id, 'sender_id' => $sender_id, 'receiver_id' => $employer_id, 'message' => $message]);
        $new_message_id = $wpdb->insert_id;

        $unread_col = ($conversation && $conversation->user1_id == $employer_id) ? 'user1_unread_count' : 'user2_unread_count';
        $wpdb->query($wpdb->prepare("UPDATE $conv_table SET last_message_id = %d, $unread_col = $unread_col + 1, updated_at = NOW() WHERE id = %d", $new_message_id, $conversation_id));

        if (function_exists('jpbd_create_notification')) {
            $notification_message = wp_trim_words($sender_data->display_name, 2, '...') . ' sent you a message about "' . wp_trim_words($opportunity->job_title, 4, '...') . '"';
            jpbd_create_notification($employer_id, $sender_id, 'new_message', $notification_message, '/dashboard/inbox/' . $sender_id);
        }
    }

    return new WP_REST_Response(['success' => true, 'message' => 'Message sent successfully!'], 201);
}
