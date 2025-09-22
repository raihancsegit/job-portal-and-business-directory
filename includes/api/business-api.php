<?php
// ফাইল: business-api.php
if (!defined('ABSPATH')) exit;

/**
 * Register all business related API routes.
 */
function jpbd_register_business_api_routes()
{
    register_rest_route('jpbd/v1', '/businesses', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_create_business',
        'permission_callback' => function () {
            // এখন যেকোনো লগইন করা ইউজারই এই ডেটা দেখতে পারবে
            return is_user_logged_in();
        },
    ]);

    // Logo আপলোডের জন্য একটি আলাদা রুট
    register_rest_route('jpbd/v1', '/businesses/upload-logo', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_upload_business_logo',
        'permission_callback' => function () {
            // এখন যেকোনো লগইন করা ইউজারই এই ডেটা দেখতে পারবে
            return is_user_logged_in();
        },
    ]);

    register_rest_route('jpbd/v1', '/businesses', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_all_businesses',
        'permission_callback' => '__return_true', // আপাতত সবাই দেখতে পারবে
    ]);

    // ফিল্টারগুলোর জন্য কাউন্ট আনার জন্য
    register_rest_route('jpbd/v1', '/businesses/filter-counts', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_business_filter_counts',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('jpbd/v1', '/businesses/(?P<id>\d+)/reviews', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_business_reviews',
        'permission_callback' => '__return_true',
    ]);

    // একটি নতুন রিভিউ যোগ করার রুট
    register_rest_route('jpbd/v1', '/businesses/(?P<id>\d+)/reviews', [
        'methods'  => 'POST',
        'callback' => 'jpbd_api_add_business_review',
        'permission_callback' => 'is_user_logged_in',
    ]);

    register_rest_route('jpbd/v1', '/businesses/(?P<id>\d+)/reviews/count', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_business_review_count',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'jpbd_register_business_api_routes');

function jpbd_api_get_business_review_count(WP_REST_Request $request)
{
    global $wpdb;
    $business_id = (int)$request['id'];
    $reviews_table = $wpdb->prefix . 'jpbd_business_reviews';

    $count = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM $reviews_table WHERE business_id = %d",
        $business_id
    ));

    return new WP_REST_Response(['count' => $count], 200);
}

function jpbd_api_get_business_reviews(WP_REST_Request $request)
{
    global $wpdb;
    $business_id = (int)$request['id'];
    $reviews_table = $wpdb->prefix . 'jpbd_business_reviews';

    $reviews = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM $reviews_table WHERE business_id = %d ORDER BY created_at DESC",
        $business_id
    ));

    // রিভিউ ডেটা ফরম্যাট করা
    $formatted_reviews = [];
    foreach ($reviews as $review) {
        $user_data = get_userdata($review->user_id);
        $formatted_reviews[] = [
            'id' => $review->id,
            'rating' => (int)$review->rating,
            'review_text' => $review->review_text,
            'created_at' => $review->created_at,
            'user' => [
                'display_name' => $user_data->display_name,
                'avatar_letter' => strtoupper(substr($user_data->display_name, 0, 1)),
            ],
        ];
    }

    return new WP_REST_Response($formatted_reviews, 200);
}

function jpbd_api_add_business_review(WP_REST_Request $request)
{
    global $wpdb;
    $business_id = (int)$request['id'];
    $user_id = get_current_user_id();
    $params = $request->get_json_params();

    $rating = isset($params['rating']) ? (int)$params['rating'] : 0;
    $review_text = isset($params['review_text']) ? sanitize_textarea_field($params['review_text']) : '';

    if ($rating < 1 || $rating > 5) {
        return new WP_Error('invalid_rating', 'Rating must be between 1 and 5.', ['status' => 400]);
    }

    $reviews_table = $wpdb->prefix . 'jpbd_business_reviews';

    $wpdb->insert($reviews_table, [
        'business_id' => $business_id,
        'user_id' => $user_id,
        'rating' => $rating,
        'review_text' => $review_text,
    ]);

    return new WP_REST_Response(['success' => true, 'message' => 'Review submitted successfully.'], 201);
}

/**
 * API Callback: Create a new business profile.
 */
function jpbd_api_create_business(WP_REST_Request $request)
{
    global $wpdb;
    $user_id = get_current_user_id();
    $params = $request->get_json_params();
    $table_name = $wpdb->prefix . 'jpbd_businesses';

    $data = [
        'user_id' => $user_id,
        'logo_url' => isset($params['logoUrl']) ? esc_url_raw($params['logoUrl']) : '',
        'title' => isset($params['title']) ? sanitize_text_field($params['title']) : '',
        'tagline' => isset($params['tagline']) ? sanitize_text_field($params['tagline']) : '',
        'industry' => isset($params['industry']) ? sanitize_text_field($params['industry']) : '',
        'category' => isset($params['category']) ? sanitize_text_field($params['category']) : '',
        'status' => isset($params['status']) ? sanitize_text_field($params['status']) : '',
        'details' => isset($params['details']) ? sanitize_textarea_field($params['details']) : '',
        'country_code' => isset($params['countryCode']) ? sanitize_text_field($params['countryCode']) : '',
        'city' => isset($params['city']) ? sanitize_text_field($params['city']) : '',
        'address' => isset($params['address']) ? sanitize_text_field($params['address']) : '',
        'zip_code' => isset($params['zipCode']) ? sanitize_text_field($params['zipCode']) : '',
        'website_url' => isset($params['websiteUrl']) ? esc_url_raw($params['websiteUrl']) : '',
        'phone_code' => isset($params['phoneCode']) ? sanitize_text_field($params['phoneCode']) : '',
        'phone_number' => isset($params['phoneNumber']) ? sanitize_text_field($params['phoneNumber']) : '',
        'founded_year' => isset($params['foundedYear']) ? sanitize_text_field($params['foundedYear']) : '',
        'certifications' => isset($params['certifications']) ? sanitize_text_field($params['certifications']) : '',
        'services' => isset($params['services']) ? sanitize_textarea_field($params['services']) : '',
        'business_hours' => isset($params['businessHours']) ? wp_json_encode($params['businessHours']) : '[]',
        'social_profiles' => isset($params['socialProfiles']) ? wp_json_encode($params['socialProfiles']) : '[]',
        'map_location' => isset($params['mapLocation']) ? wp_json_encode($params['mapLocation']) : 'null',
    ];

    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        return new WP_Error('db_error', 'Could not save the business profile.', ['status' => 500]);
    }

    return new WP_REST_Response(['success' => true, 'message' => 'Business profile created successfully!'], 201);
}

/**
 * API Callback: Handle business logo upload.
 */
function jpbd_api_upload_business_logo(WP_REST_Request $request)
{
    if (!function_exists('wp_handle_upload')) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
    }

    $uploadedfile = $_FILES['logo_file'];
    $upload_overrides = ['test_form' => false];
    $movefile = wp_handle_upload($uploadedfile, $upload_overrides);

    if ($movefile && !isset($movefile['error'])) {
        return new WP_REST_Response([
            'success' => true,
            'message' => 'Logo uploaded successfully!',
            'url' => $movefile['url'],
        ], 200);
    } else {
        return new WP_Error('upload_error', $movefile['error'], ['status' => 500]);
    }
}

/**
 * API Callback: Get all businesses with filtering.
 */
function jpbd_api_get_all_businesses(WP_REST_Request $request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_businesses';
    $filters = $request->get_params();

    $sql = "SELECT * FROM $table_name WHERE 1=1";
    $params = [];

    if (isset($filters['viewMode']) && $filters['viewMode'] === 'my_listing') {
        $user_id = get_current_user_id();
        // নিশ্চিত করুন যে ব্যবহারকারী লগইন করা আছে
        if ($user_id > 0) {
            $sql .= " AND user_id = %d";
            $params[] = $user_id;
        } else {
            // যদি লগইন করা না থাকে, তাহলে কোনো রেজাল্ট পাঠাবে না
            return new WP_REST_Response([], 200);
        }
    }

    if (!empty($filters['title'])) {
        $sql .= " AND title LIKE %s";
        $params[] = '%' . $wpdb->esc_like($filters['title']) . '%';
    }
    if (!empty($filters['location'])) {
        $sql .= " AND (city LIKE %s OR address LIKE %s OR zip_code LIKE %s)";
        $params[] = '%' . $wpdb->esc_like($filters['location']) . '%';
        $params[] = '%' . $wpdb->esc_like($filters['location']) . '%';
        $params[] = '%' . $wpdb->esc_like($filters['location']) . '%';
    }

    if (!empty($filters['category']) && $filters['category'] !== 'all') {
        $sql .= " AND category = %s";
        $params[] = $filters['category'];
    }
    if (!empty($filters['status']) && $filters['status'] !== 'all') {
        $sql .= " AND status = %s";
        $params[] = $filters['status'];
    }

    if (!empty($filters['certification']) && $filters['certification'] !== 'all') {
        // FIND_IN_SET ব্যবহার করা যায় না, কারণ আমাদের স্ট্রিং-এ স্পেস থাকতে পারে।
        // তাই LIKE ব্যবহার করা হচ্ছে, যা সবচেয়ে সহজ এবং নির্ভরযোগ্য।
        $sql .= " AND CONCAT(',', LTRIM(RTRIM(certifications)), ',') LIKE %s";
        $params[] = '%,' . $wpdb->esc_like(trim($filters['certification'])) . ',%';
    }
    // ... আরও ফিল্টার যোগ করা যাবে (e.g., industry, certifications)

    $sql .= " ORDER BY created_at DESC";

    $query = $wpdb->prepare($sql, $params);
    $results = $wpdb->get_results($query, ARRAY_A);

    if (is_null($results)) {
        return new WP_Error('db_error', 'Could not retrieve businesses.', ['status' => 500]);
    }

    return new WP_REST_Response($results, 200);
}


/**
 * API Callback: Get counts for filter options.
 */
function jpbd_api_get_business_filter_counts()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_businesses';

    $total_businesses = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table_name");

    // --- Category Counts ---
    $category_counts = $wpdb->get_results("SELECT category as name, COUNT(*) as count FROM $table_name WHERE category != '' GROUP BY category", ARRAY_A);
    array_unshift($category_counts, ['name' => 'all', 'count' => $total_businesses]);

    // --- Certifications Counts ---
    $all_certifications_raw = $wpdb->get_col("SELECT certifications FROM $table_name WHERE certifications IS NOT NULL AND certifications != ''");
    $cert_counts = [];
    foreach ($all_certifications_raw as $row_certs) {
        $certs_in_row = array_map('trim', explode(',', $row_certs));
        foreach ($certs_in_row as $cert) {
            if (!empty($cert)) {
                if (!isset($cert_counts[$cert])) {
                    $cert_counts[$cert] = 0;
                }
                $cert_counts[$cert]++;
            }
        }
    }

    // React-এর জন্য ফরম্যাট করা
    $formatted_cert_counts = [];
    foreach ($cert_counts as $name => $count) {
        $formatted_cert_counts[] = ['name' => $name, 'count' => $count];
    }
    // 'all' অপশন যোগ করা
    array_unshift($formatted_cert_counts, ['name' => 'all', 'count' => $total_businesses]);




    $status_counts = $wpdb->get_results("SELECT status as name, COUNT(*) as count FROM $table_name WHERE status != '' GROUP BY status", ARRAY_A);
    array_unshift($status_counts, ['name' => 'all', 'count' => $total_businesses]);

    // ফাইনাল রেসপন্স
    $counts = [
        'category' => $category_counts,
        'certifications' => $formatted_cert_counts,
        'status' => $status_counts,
    ];

    return new WP_REST_Response($counts, 200);
}
