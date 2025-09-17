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

    register_rest_route('jpbd/v1', '/opportunities/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_get_single_opportunity',
        'permission_callback' => '__return_true', // আপাতত সবাই দেখতে পারবে
        'args' => [
            'id' => [
                'validate_callback' => function ($param, $request, $key) {
                    return is_numeric($param);
                }
            ],
        ],
    ]);

    register_rest_route(
        'jpbd/v1',
        '/opportunities/(?P<id>\d+)',
        [
            'methods' => 'POST', // WordPress-এ আপডেটের জন্য POST ব্যবহার করা সহজ
            'callback' => 'jpbd_api_update_opportunity',
            'permission_callback' => function () {
                return is_user_logged_in();
            },
            'args' => [
                'id' => [
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]

    );

    register_rest_route('jpbd/v1', '/opportunities/(?P<id>\d+)', [
        'methods' => WP_REST_Server::DELETABLE, // DELETE
        'callback' => 'jpbd_api_delete_opportunity',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
        'args' => [
            'id' => ['validate_callback' => function ($param) {
                return is_numeric($param);
            }],
        ],
    ]);

    register_rest_route('jpbd/v1', '/opportunities/filters/counts', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_get_filter_counts',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('jpbd/v1', '/opportunities/bulk-delete', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_bulk_delete_opportunities',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    register_rest_route('jpbd/v1', '/applications/check/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_check_application_status',
        'permission_callback' => function () {
            return is_user_logged_in();
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

// নতুন একটি GET রুট যোগ করা হচ্ছে
function jpbd_register_get_opportunities_route()
{
    register_rest_route('jpbd/v1', '/opportunities', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_get_opportunities',
        'permission_callback' => '__return_true', // আপাতত সবাই দেখতে পারবে
    ]);
}
add_action('rest_api_init', 'jpbd_register_get_opportunities_route');

/**
 * API: Get all opportunities.
 */
function jpbd_api_get_opportunities(WP_REST_Request $request)
{
    global $wpdb;
    $opportunities_table = $wpdb->prefix . 'jpbd_opportunities';
    $applications_table = $wpdb->prefix . 'jpbd_applications';
    $table_name = $wpdb->prefix . 'jpbd_opportunities';

    // React থেকে পাঠানো ফিল্টার প্যারামিটারগুলো গ্রহণ করা
    $filters = $request->get_params();

    // SQL কোয়েরি তৈরি শুরু করা
    // $sql = "SELECT * FROM $table_name WHERE 1=1";

    $sql = "
        SELECT 
            opp.*, 
            COUNT(app.id) as applications 
        FROM 
            $opportunities_table as opp 
        LEFT JOIN 
            $applications_table as app ON opp.id = app.opportunity_id 
        WHERE 1=1
    ";
    $params = [];

    // জব টাইটেল দিয়ে সার্চ করার জন্য
    if (!empty($filters['searchTitle'])) {
        $sql .= " AND job_title LIKE %s";
        $params[] = '%' . $wpdb->esc_like($filters['searchTitle']) . '%';
    }

    // লোকেশন দিয়ে সার্চ করার জন্য
    if (!empty($filters['searchLocation'])) {
        $sql .= " AND location LIKE %s";
        $params[] = '%' . $wpdb->esc_like($filters['searchLocation']) . '%';
    }

    // জব টাইপ দিয়ে ফিল্টার করার জন্য
    if (!empty($filters['jobType'])) {
        $sql .= " AND job_type = %s";
        $params[] = $filters['jobType'];
    }

    // Experience দিয়ে ফিল্টার করার জন্য
    if (!empty($filters['experience'])) {
        $sql .= " AND experience = %s";
        $params[] = $filters['experience'];
    }

    // Workplace দিয়ে ফিল্টার করার জন্য
    if (!empty($filters['workplace'])) {
        $sql .= " AND workplace = %s";
        $params[] = $filters['workplace'];
    }

    if (!empty($filters['industry'])) {
        $sql .= " AND industry = %s";
        $params[] = $filters['industry'];
    }

    if (!empty($filters['datePosted']) && $filters['datePosted'] !== 'all') {
        $date_posted_filter = $filters['datePosted'];
        $current_time = current_time('mysql'); // WordPress-এর বর্তমান সময়

        switch ($date_posted_filter) {
            case 'last-hour':
                $sql .= " AND created_at >= %s";
                $params[] = date('Y-m-d H:i:s', strtotime('-1 hour', strtotime($current_time)));
                break;
            case 'last-24-hours':
                $sql .= " AND created_at >= %s";
                $params[] = date('Y-m-d H:i:s', strtotime('-24 hours', strtotime($current_time)));
                break;
            case 'last-week':
                $sql .= " AND created_at >= %s";
                $params[] = date('Y-m-d H:i:s', strtotime('-7 days', strtotime($current_time)));
                break;
            case 'last-2-weeks':
                $sql .= " AND created_at >= %s";
                $params[] = date('Y-m-d H:i:s', strtotime('-14 days', strtotime($current_time)));
                break;
            case 'last-month':
                $sql .= " AND created_at >= %s";
                $params[] = date('Y-m-d H:i:s', strtotime('-1 month', strtotime($current_time)));
                break;
        }
    }

    // আমরা salary_amount কলামটিকে সংখ্যা হিসেবে তুলনা করব
    if (isset($filters['minSalary']) && is_numeric($filters['minSalary'])) {
        $sql .= " AND CAST(salary_amount AS UNSIGNED) >= %d";
        $params[] = (int) $filters['minSalary'];
    }
    if (isset($filters['maxSalary']) && is_numeric($filters['maxSalary'])) {
        $sql .= " AND CAST(salary_amount AS UNSIGNED) <= %d";
        $params[] = (int) $filters['maxSalary'];
    }



    if (isset($filters['viewMode'])) {
        $user_id = get_current_user_id();
        if ($user_id > 0) {
            switch ($filters['viewMode']) {
                case 'my_opportunities':
                    $sql .= " AND opp.user_id = %d";
                    $params[] = $user_id;
                    break;
                case 'hired':
                    // শুধুমাত্র সেই জবগুলো যেখানে এই এমপ্লয়ার حداقل একজনকে হায়ার করেছে
                    $sql .= " AND opp.user_id = %d AND EXISTS (SELECT 1 FROM $applications_table WHERE opportunity_id = opp.id AND status = 'hired')";
                    $params[] = $user_id;
                    break;
                case 'applied':
                    // শুধুমাত্র সেই জবগুলো যেখানে ক্যান্ডিডেট আবেদন করেছে
                    $sql .= " AND opp.id IN (SELECT opportunity_id FROM $applications_table WHERE candidate_id = %d)";
                    $params[] = $user_id;
                    break;
            }
        } else {
            return new WP_REST_Response([], 200); // লগইন না থাকলে খালি ফলাফল
        }
    }

    if (!empty($filters['dateRange'])) {
        $date_range = $filters['dateRange'];
        $current_time = current_time('mysql');

        $from_date = '';
        switch ($date_range) {
            case 'this-week':
                $from_date = date('Y-m-d H:i:s', strtotime('monday this week', strtotime($current_time)));
                break;
            case 'this-month':
                $from_date = date('Y-m-d H:i:s', strtotime('first day of this month', strtotime($current_time)));
                break;
            case 'this-year':
                $from_date = date('Y-m-d H:i:s', strtotime('first day of january this year', strtotime($current_time)));
                break;
        }

        if ($from_date) {
            $sql .= " AND created_at >= %s";
            $params[] = $from_date;
        }
    }

    $sql .= " GROUP BY opp.id";

    $sql .= " ORDER BY opp.created_at DESC";

    // সুরক্ষিতভাবে কোয়েরি চালানো
    $query = $wpdb->prepare($sql, $params);
    $results = $wpdb->get_results($query, ARRAY_A);

    if ($results === null) {
        return new WP_Error('db_error', 'Could not retrieve opportunities.', ['status' => 500]);
    }

    if (is_user_logged_in()) {
        $user_id = get_current_user_id();
        $user = get_userdata($user_id);

        // শুধুমাত্র candidate বা business রোলের জন্য এই চেকটি চলবে
        if (in_array('candidate', (array)$user->roles) || in_array('business', (array)$user->roles)) {

            // সকল opportunity-র ID গুলো একটি অ্যারেতে নেওয়া হচ্ছে
            $opportunity_ids = wp_list_pluck($results, 'id');
            if (!empty($opportunity_ids)) {

                // বর্তমানে লগইন করা ইউজারের করা আবেদনগুলো খুঁজে বের করা হচ্ছে
                $applied_ids_query = $wpdb->prepare(
                    "SELECT opportunity_id FROM $applications_table WHERE candidate_id = %d AND opportunity_id IN (" . implode(',', $opportunity_ids) . ")",
                    $user_id
                );
                $applied_ids = $wpdb->get_col($applied_ids_query);

                // প্রতিটি opportunity-র জন্য has_applied প্রপার্টি সেট করা হচ্ছে
                foreach ($results as &$job) { // <-- & ব্যবহার করা হয়েছে যাতে সরাসরি অ্যারেটি মডিফাই করা যায়
                    $job['has_applied'] = in_array($job['id'], $applied_ids);
                }
            }
        }
    }

    return new WP_REST_Response($results, 200);
}



/**
 * API: Get a single opportunity by its ID.
 */
function jpbd_api_get_single_opportunity(WP_REST_Request $request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_opportunities';
    $id = (int) $request['id'];

    // এটি $wpdb->update এর চেয়ে বেশি কার্যকরী।
    $wpdb->query(
        $wpdb->prepare(
            "UPDATE $table_name SET views_count = views_count + 1 WHERE id = %d",
            $id
        )
    );
    // ==============================================================

    // ভিউ কাউন্ট বাড়ানোর পর, আমরা আপডেটেড ডেটা নিয়ে আসব।
    $opportunity = $wpdb->get_row(
        $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id),
        ARRAY_A
    );

    if (empty($opportunity)) {
        return new WP_Error('not_found', 'Opportunity not found.', ['status' => 404]);
    }

    $opportunity['has_applied'] = false;
    if (is_user_logged_in()) {
        $user_id = get_current_user_id();
        $app_table_name = $wpdb->prefix . 'jpbd_applications';
        $application = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $app_table_name WHERE opportunity_id = %d AND candidate_id = %d",
            $id, // Use the ID from the request
            $user_id
        ));
        if ($application) {
            $opportunity['has_applied'] = true;
        }
    }

    return new WP_REST_Response($opportunity, 200);
}

/**
 * API: Update an existing opportunity.
 * This function now includes all fields from your form.
 */

function jpbd_api_update_opportunity(WP_REST_Request $request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_opportunities';
    $user_id = get_current_user_id();
    $opportunity_id = (int) $request['id'];

    // Step 1: Verify ownership (this part is correct)
    $existing_opportunity = $wpdb->get_row($wpdb->prepare("SELECT user_id FROM $table_name WHERE id = %d", $opportunity_id));
    if (!$existing_opportunity) {
        return new WP_Error('not_found', 'Opportunity not found.', ['status' => 404]);
    }
    if ((int) $existing_opportunity->user_id !== $user_id) {
        return new WP_Error('rest_forbidden', 'You do not have permission to edit this opportunity.', ['status' => 403]);
    }

    // ======================================================
    // THIS IS THE FIX
    // ======================================================

    // Step 2: Dynamically build the data array ONLY with received fields
    $params = $request->get_json_params();
    $data = []; // Start with an empty array

    // List of all possible fields that can be updated
    $allowed_fields = [
        'job_title',
        'industry',
        'job_type',
        'workplace',
        'location',
        'salary_currency',
        'salary_amount',
        'salary_type',
        'job_details',
        'responsibilities',
        'qualifications',
        'skills',
        'experience',
        'education_level',
        'vacancy_status',
        'publish_date',
        'end_date'
    ];

    // Loop through the allowed fields and add them to the $data array if they exist in the request
    foreach ($allowed_fields as $field) {
        // We also check for the camelCase version from React
        $camelCaseField = lcfirst(str_replace('_', '', ucwords($field, '_')));

        if (isset($params[$field])) {
            $data[$field] = sanitize_text_field($params[$field]);
        } elseif (isset($params[$camelCaseField])) {
            $data[$field] = sanitize_text_field($params[$camelCaseField]);
        }
    }

    // Sanitize text areas separately
    if (isset($params['job_details']) || isset($params['jobDetails'])) {
        $data['job_details'] = sanitize_textarea_field($params['job_details'] ?? $params['jobDetails']);
    }
    if (isset($params['responsibilities'])) {
        $data['responsibilities'] = sanitize_textarea_field($params['responsibilities']);
    }
    if (isset($params['qualifications'])) {
        $data['qualifications'] = sanitize_textarea_field($params['qualifications']);
    }

    // If no data was sent to update, there's nothing to do.
    if (empty($data)) {
        return new WP_Error('no_data', 'No data provided to update.', ['status' => 400]);
    }

    // ======================================================
    // END OF FIX
    // ======================================================

    // Step 3: Update the database record
    $where = ['id' => $opportunity_id];
    $result = $wpdb->update($table_name, $data, $where);

    if ($result === false) {
        return new WP_Error('db_error', 'Could not update the opportunity.', ['status' => 500]);
    }

    return new WP_REST_Response(['success' => true, 'message' => 'Opportunity updated successfully!'], 200);
}


/**
 * API: Delete an existing opportunity.
 */
function jpbd_api_delete_opportunity(WP_REST_Request $request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_opportunities';
    $user_id = get_current_user_id();
    $opportunity_id = (int) $request['id'];

    // ধাপ ১: Opportunity-টি আছে কিনা এবং এটি বর্তমান ব্যবহারকারীর কিনা তা চেক করা
    $existing_opportunity = $wpdb->get_row(
        $wpdb->prepare("SELECT user_id FROM $table_name WHERE id = %d", $opportunity_id)
    );

    if (!$existing_opportunity) {
        return new WP_Error('not_found', 'Opportunity not found.', ['status' => 404]);
    }

    if ((int) $existing_opportunity->user_id !== $user_id) {
        return new WP_Error('rest_forbidden', 'You do not have permission to delete this opportunity.', ['status' => 403]);
    }

    // ধাপ ২: ডাটাবেস থেকে রেকর্ডটি ডিলিট করা
    $result = $wpdb->delete($table_name, ['id' => $opportunity_id]);

    if ($result === false) {
        return new WP_Error('db_error', 'Could not delete the opportunity.', ['status' => 500]);
    }

    return new WP_REST_Response(['success' => true, 'message' => 'Opportunity deleted successfully!'], 200);
}

/**
 * API: Get the count of opportunities for each filter category.
 */
function jpbd_api_get_filter_counts()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_opportunities';

    // গ্রুপ করে প্রতিটি ক্যাটাগরির জন্য COUNT(*) গণনা করা
    $job_type_counts = $wpdb->get_results("SELECT job_type as name, COUNT(*) as count FROM $table_name GROUP BY job_type", ARRAY_A);
    $workplace_counts = $wpdb->get_results("SELECT workplace as name, COUNT(*) as count FROM $table_name GROUP BY workplace", ARRAY_A);
    $industry_counts = $wpdb->get_results("SELECT industry as name, COUNT(*) as count FROM $table_name GROUP BY industry", ARRAY_A);
    $experience_counts = $wpdb->get_results("SELECT experience as name, COUNT(*) as count FROM $table_name GROUP BY experience", ARRAY_A);

    // Date Posted-এর জন্য গণনা একটু জটিল, তাই আমরা PHP-তে করব
    $now = current_time('timestamp');
    $date_counts = [
        'all' => (int) $wpdb->get_var("SELECT COUNT(*) FROM $table_name"),
        'last-hour' => (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE created_at >= %s", date('Y-m-d H:i:s', $now - HOUR_IN_SECONDS))),
        'last-24-hours' => (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE created_at >= %s", date('Y-m-d H:i:s', $now - DAY_IN_SECONDS))),
        'last-week' => (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE created_at >= %s", date('Y-m-d H:i:s', $now - WEEK_IN_SECONDS))),
        // === ADDED THESE TWO ===
        'last-2-weeks' => (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE created_at >= %s", date('Y-m-d H:i:s', $now - (2 * WEEK_IN_SECONDS)))),
        'last-month' => (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE created_at >= %s", date('Y-m-d H:i:s', strtotime('-1 month', $now)))),
    ];

    // একটি সুন্দর ফরম্যাটে ডেটা রিটার্ন করা
    $counts = [
        'jobType' => $job_type_counts,
        'workplace' => $workplace_counts,
        'industry' => $industry_counts,
        'experience' => $experience_counts,
        'datePosted' => $date_counts,
    ];

    return new WP_REST_Response($counts, 200);
}

/**
 * API: Handle bulk deletion of opportunities.
 */
function jpbd_api_bulk_delete_opportunities(WP_REST_Request $request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_opportunities';
    $user_id = get_current_user_id();
    $params = $request->get_json_params();
    $ids_to_delete = isset($params['ids']) ? $params['ids'] : [];

    if (empty($ids_to_delete) || !is_array($ids_to_delete)) {
        return new WP_Error('no_ids', 'No opportunity IDs provided for deletion.', ['status' => 400]);
    }

    // নিশ্চিত করুন যে সব আইডি সংখ্যা
    $sanitized_ids = array_map('intval', $ids_to_delete);

    // তৈরি করা স্ট্রিং: "1, 2, 3"
    $ids_placeholder = implode(',', $sanitized_ids);

    // ধাপ ১: শুধুমাত্র নিজের তৈরি করা opportunity ডিলিট করার অনুমতি আছে কিনা তা চেক করা
    // সব ID-র জন্য user_id চেক করা
    $owned_ids_count = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE id IN ($ids_placeholder) AND user_id = %d",
            $user_id
        )
    );

    if (count($sanitized_ids) !== (int) $owned_ids_count) {
        return new WP_Error('permission_denied', 'You can only delete your own opportunities.', ['status' => 403]);
    }

    // ধাপ ২: ডাটাবেস থেকে ডিলিট করা
    $result = $wpdb->query("DELETE FROM $table_name WHERE id IN ($ids_placeholder)");

    if ($result === false) {
        return new WP_Error('db_error', 'Could not delete the opportunities.', ['status' => 500]);
    }

    return new WP_REST_Response(['success' => true, 'message' => $result . ' opportunities deleted successfully.'], 200);
}

function jpbd_api_check_application_status(WP_REST_Request $request)
{
    $user_id = get_current_user_id();
    $opportunity_id = (int) $request['id'];
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_applications';

    $application = $wpdb->get_var($wpdb->prepare(
        "SELECT id FROM $table_name WHERE opportunity_id = %d AND candidate_id = %d",
        $opportunity_id,
        $user_id
    ));

    return new WP_REST_Response(['applied' => !empty($application)], 200);
}

/**
 * Register a route for candidates/businesses to get their applications.
 */
function jpbd_register_my_applications_route()
{
    register_rest_route('jpbd/v1', '/my-applications', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_my_applications',
        'permission_callback' => function () {
            // শুধুমাত্র লগইন করা ইউজাররাই তাদের আবেদন দেখতে পারবে
            return is_user_logged_in();
        },
    ]);
}
add_action('rest_api_init', 'jpbd_register_my_applications_route');


/**
 * API Callback: Get all applications for the current candidate/business user.
 */
function jpbd_api_get_my_applications(WP_REST_Request $request)
{
    global $wpdb;
    $user_id = get_current_user_id();

    $opp_table = $wpdb->prefix . 'jpbd_opportunities';
    $app_table = $wpdb->prefix . 'jpbd_applications';
    $users_table = $wpdb->prefix . 'users';

    // SQL কোয়েরি যা আবেদনের সকল তথ্য এবং সংশ্লিষ্ট কোম্পানির নাম ও লোকেশন নিয়ে আসে
    $query = $wpdb->prepare(
        "SELECT
            app.id as application_id,
            app.application_date,
            app.status,
            opp.id as opportunity_id,
            opp.job_title,
            opp.location,
            emp.display_name as employer_name,
            -- অন্য একটি সাব-কোয়েরি দিয়ে ঐ জবে মোট আবেদনকারীর সংখ্যা গণনা করা হচ্ছে
            (SELECT COUNT(*) FROM $app_table WHERE opportunity_id = opp.id) as total_applicants
         FROM $app_table as app
         JOIN $opp_table as opp ON app.opportunity_id = opp.id
         JOIN $users_table as emp ON opp.user_id = emp.ID
         WHERE app.candidate_id = %d
         ORDER BY app.application_date DESC",
        $user_id
    );

    $results = $wpdb->get_results($query, ARRAY_A);

    if (is_null($results)) {
        return new WP_Error('db_error', 'Could not retrieve applications.', ['status' => 500]);
    }

    return new WP_REST_Response($results, 200);
}
