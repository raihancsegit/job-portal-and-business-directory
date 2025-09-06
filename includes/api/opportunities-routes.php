<?php
if (!defined('ABSPATH')) exit;

/**
 * Register all opportunities related API routes.
 */
function jpbd_register_opportunities_api_routes()
{
    register_rest_route('jpbd/v1', '/opportunities', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_create_opportunity',
        'permission_callback' => function () {
            return is_user_logged_in(); // <-- এই লাইনটি ব্যবহার করুন
        },
    ]);
}
add_action('rest_api_init', 'jpbd_register_opportunities_api_routes');

/**
 * API: Create a new opportunity.
 */
function jpbd_api_create_opportunity(WP_REST_Request $request)
{
    $user_id = get_current_user_id();

    // capability চেক করা
    if (!user_can($user_id, 'create_opportunities')) {
        return new WP_Error('rest_forbidden', 'You do not have permission to post opportunities.', ['status' => 403]);
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_opportunities';
    $params = $request->get_json_params();

    // ডেটা গ্রহণ এবং sanitize করা
    $data = [
        'user_id' => $user_id,
        'job_title' => sanitize_text_field($params['jobTitle']),
        'industry' => sanitize_text_field($params['industry']),
        'job_type' => sanitize_text_field($params['jobType']),
        'workplace' => sanitize_text_field($params['workplace']),
        'location' => sanitize_text_field($params['location']),
        'salary_currency' => sanitize_text_field($params['salaryCurrency']),
        'salary_amount' => sanitize_text_field($params['salaryAmount']),
        'salary_type' => sanitize_text_field($params['salaryType']),
        'job_details' => sanitize_textarea_field($params['jobDetails']),
        'responsibilities' => sanitize_textarea_field($params['responsibilities']),
        'qualifications' => sanitize_textarea_field($params['qualifications']),
        'skills' => sanitize_text_field($params['skills']),
        'experience' => sanitize_text_field($params['experience']),
        'education_level' => sanitize_text_field($params['educationLevel']),
        'vacancy_status' => sanitize_text_field($params['vacancyStatus']),
        'publish_date' => sanitize_text_field($params['publishDate']),
        'end_date' => sanitize_text_field($params['endDate']),
    ];

    // ডাটাবেসে ডেটা ইনসার্ট করা
    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        return new WP_Error('db_error', 'Could not save the opportunity.', ['status' => 500]);
    }

    return new WP_REST_Response([
        'success' => true,
        'message' => 'Opportunity posted successfully!',
        'opportunity_id' => $wpdb->insert_id
    ], 201);
}
