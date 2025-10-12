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

    register_rest_route('jpbd/v1', '/businesses/(?P<id>\d+)', [
        'methods'  => 'POST', // আপডেটের জন্য POST ব্যবহার
        'callback' => 'jpbd_api_update_business',
        'permission_callback' => 'is_user_logged_in',
    ]);

    // একটি business ডিলেট করার জন্য
    register_rest_route('jpbd/v1', '/businesses/(?P<id>\d+)', [
        'methods'  => 'DELETE',
        'callback' => 'jpbd_api_delete_business',
        'permission_callback' => 'is_user_logged_in',
    ]);

    register_rest_route('jpbd/v1', '/businesses/(?P<id>\d+)', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_single_business',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'jpbd_register_business_api_routes');

function jpbd_api_get_single_business(WP_REST_Request $request)
{
    global $wpdb;
    $business_id = (int)$request['id'];
    $user_id = get_current_user_id();
    $business_table = $wpdb->prefix . 'jpbd_businesses';
    $reviews_table = $wpdb->prefix . 'jpbd_business_reviews';

    // মূল কোয়েরি যা রিভিউ ডেটাও (গড় রেটিং এবং মোট সংখ্যা) নিয়ে আসবে
    $business_query = $wpdb->prepare(
        "SELECT b.*, 
                AVG(r.rating) as average_rating, 
                COUNT(r.id) as review_count
         FROM $business_table as b
         LEFT JOIN $reviews_table as r ON b.id = r.business_id
         WHERE b.id = %d
         GROUP BY b.id",
        $business_id
    );

    $business = $wpdb->get_row($business_query, ARRAY_A);

    if (empty($business)) {
        return new WP_Error('not_found', 'Business not found.', ['status' => 404]);
    }

    // --- রেটিং এবং is_saved স্ট্যাটাস ফরম্যাট করা ---
    $business['average_rating'] = $business['average_rating'] ? round((float)$business['average_rating'], 1) : 0;
    $business['review_count'] = (int)$business['review_count'];
    $business['is_saved'] = false; // ডিফল্ট ভ্যালু

    if ($user_id > 0) {
        $saved_table = $wpdb->prefix . 'jpbd_saved_items';
        $is_saved = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $saved_table WHERE user_id = %d AND item_type = 'business' AND item_id = %d",
            $user_id,
            $business_id
        ));
        $business['is_saved'] = (bool)$is_saved;
    }

    // JSON ফিল্ডগুলো ডিকোড করা
    $business['businessHours'] = json_decode($business['business_hours'], true);
    $business['socialProfiles'] = json_decode($business['social_profiles'], true);
    $business['mapLocation'] = json_decode($business['map_location'], true);

    // অপ্রয়োজনীয় raw JSON ফিল্ডগুলো বাদ দেওয়া
    unset($business['business_hours'], $business['social_profiles'], $business['map_location']);

    return new WP_REST_Response($business, 200);
}

function jpbd_api_update_business(WP_REST_Request $request)
{
    global $wpdb;
    $business_id = (int)$request['id'];
    $user_id = get_current_user_id();
    $table_name = $wpdb->prefix . 'jpbd_businesses';

    // ওনারশিপ ভেরিফাই করা
    $owner_id = (int)$wpdb->get_var($wpdb->prepare("SELECT user_id FROM $table_name WHERE id = %d", $business_id));
    if (!$owner_id || $owner_id !== $user_id) {
        return new WP_Error('forbidden', 'You do not have permission to edit this business.', ['status' => 403]);
    }

    $params = $request->get_json_params();
    $data = []; // শুধুমাত্র পাঠানো ডেটা আপডেট করা হবে

    // ================== মূল এবং সম্পূর্ণ কোড এখানে ==================
    // সব ফিল্ডের জন্য চেক এবং sanitize করা
    if (isset($params['title'])) $data['title'] = sanitize_text_field($params['title']);
    if (isset($params['tagline'])) $data['tagline'] = sanitize_text_field($params['tagline']);
    if (isset($params['industry'])) $data['industry'] = sanitize_text_field($params['industry']);
    if (isset($params['category'])) $data['category'] = sanitize_text_field($params['category']);
    if (isset($params['status'])) $data['status'] = sanitize_text_field($params['status']);
    if (isset($params['details'])) $data['details'] = sanitize_textarea_field($params['details']);
    if (isset($params['countryCode'])) $data['country_code'] = sanitize_text_field($params['countryCode']);
    if (isset($params['city'])) $data['city'] = sanitize_text_field($params['city']);
    if (isset($params['address'])) $data['address'] = sanitize_text_field($params['address']);
    if (isset($params['zipCode'])) $data['zip_code'] = sanitize_text_field($params['zipCode']);
    if (isset($params['websiteUrl'])) $data['website_url'] = esc_url_raw($params['websiteUrl']);
    if (isset($params['phoneCode'])) $data['phone_code'] = sanitize_text_field($params['phoneCode']);
    if (isset($params['phoneNumber'])) $data['phone_number'] = sanitize_text_field($params['phoneNumber']);
    if (isset($params['foundedYear'])) $data['founded_year'] = sanitize_text_field($params['foundedYear']);
    if (isset($params['certifications'])) $data['certifications'] = sanitize_text_field($params['certifications']);
    if (isset($params['services'])) $data['services'] = sanitize_textarea_field($params['services']);

    // JSON ফিল্ডগুলোর জন্য
    if (isset($params['businessHours'])) $data['business_hours'] = wp_json_encode($params['businessHours']);
    if (isset($params['socialProfiles'])) $data['social_profiles'] = wp_json_encode($params['socialProfiles']);
    if (isset($params['mapLocation'])) $data['map_location'] = wp_json_encode($params['mapLocation']);

    // Logo URL-ও এখান থেকে আপডেট করা যেতে পারে যদি পাঠানো হয়
    if (isset($params['logoUrl'])) $data['logo_url'] = esc_url_raw($params['logoUrl']);
    // =============================================================

    if (empty($data)) {
        return new WP_Error('bad_request', 'No data provided for update.', ['status' => 400]);
    }

    $result = $wpdb->update($table_name, $data, ['id' => $business_id]);

    if ($result === false) {
        return new WP_Error('db_error', 'Could not update the business profile.', ['status' => 500]);
    }

    return new WP_REST_Response(['success' => true, 'message' => 'Business updated successfully.'], 200);
}

function jpbd_api_delete_business(WP_REST_Request $request)
{
    global $wpdb;
    $business_id = (int)$request['id'];
    $user_id = get_current_user_id();
    $table_name = $wpdb->prefix . 'jpbd_businesses';

    // ওনারশিপ ভেরিফাই করা
    $owner_id = (int)$wpdb->get_var($wpdb->prepare("SELECT user_id FROM $table_name WHERE id = %d", $business_id));
    if (!$owner_id || $owner_id !== $user_id) {
        return new WP_Error('forbidden', 'You do not have permission to delete this business.', ['status' => 403]);
    }

    $wpdb->delete($table_name, ['id' => $business_id]);
    return new WP_REST_Response(['success' => true, 'message' => 'Business deleted successfully.'], 200);
}

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
    $business_table = $wpdb->prefix . 'jpbd_businesses';
    $reviews_table = $wpdb->prefix . 'jpbd_business_reviews';
    $filters = $request->get_params();
    $user_id = get_current_user_id();

    // SELECT অংশে রিভিউ ডেটা (গড় রেটিং এবং মোট সংখ্যা) যোগ করা হয়েছে
    $sql = "SELECT b.*, 
                   AVG(r.rating) as average_rating, 
                   COUNT(DISTINCT r.id) as review_count
            FROM $business_table as b
            LEFT JOIN $reviews_table as r ON b.id = r.business_id
            WHERE 1=1";
    $params = [];

    // --- ফিল্টারিং লজিক ---
    if (isset($filters['viewMode']) && $filters['viewMode'] === 'my_listing') {
        if ($user_id > 0) {
            $sql .= " AND b.user_id = %d";
            $params[] = $user_id;
        } else {
            return new WP_REST_Response([], 200); // লগইন না থাকলে খালি ফলাফল
        }
    }

    if (!empty($filters['title'])) {
        $sql .= " AND b.title LIKE %s";
        $params[] = '%' . $wpdb->esc_like($filters['title']) . '%';
    }

    if (!empty($filters['location'])) {
        $sql .= " AND (b.city LIKE %s OR b.address LIKE %s OR b.zip_code LIKE %s)";
        $params[] = '%' . $wpdb->esc_like($filters['location']) . '%';
        $params[] = '%' . $wpdb->esc_like($filters['location']) . '%';
        $params[] = '%' . $wpdb->esc_like($filters['location']) . '%';
    }

    if (!empty($filters['category']) && $filters['category'] !== 'all') {
        $sql .= " AND b.category = %s";
        $params[] = $filters['category'];
    }

    if (!empty($filters['status']) && $filters['status'] !== 'all') {
        $sql .= " AND b.status = %s";
        $params[] = $filters['status'];
    }

    if (!empty($filters['certification']) && $filters['certification'] !== 'all') {
        $sql .= " AND FIND_IN_SET(%s, b.certifications)";
        $params[] = $filters['certification'];
    }

    // GROUP BY এবং ORDER BY যোগ করা হয়েছে
    $sql .= " GROUP BY b.id ORDER BY b.created_at DESC";

    $query = $wpdb->prepare($sql, $params);
    $results = $wpdb->get_results($query, ARRAY_A);

    if (is_null($results)) {
        return new WP_Error('db_error', 'Could not retrieve businesses.', ['status' => 500]);
    }

    // --- is_saved স্ট্যাটাস এবং রেটিং ফরম্যাট করা ---
    $saved_ids = [];
    if ($user_id > 0 && !empty($results)) {
        $saved_table = $wpdb->prefix . 'jpbd_saved_items';
        $business_ids = wp_list_pluck($results, 'id');

        // একটি মাত্র কোয়েরি দিয়ে সব সেভ করা আইটেমের ID নিয়ে আসা
        $saved_ids_query = $wpdb->prepare(
            "SELECT item_id FROM $saved_table WHERE user_id = %d AND item_type = 'business' AND item_id IN (" . implode(',', array_fill(0, count($business_ids), '%d')) . ")",
            array_merge([$user_id], $business_ids)
        );
        // get_col ব্যবহার করে শুধুমাত্র item_id কলামটি একটি ফ্ল্যাট অ্যারে হিসেবে আনা
        $saved_ids = $wpdb->get_col($saved_ids_query);
    }

    // প্রতিটি রেজাল্টের জন্য রেটিং ফরম্যাট করা এবং is_saved স্ট্যাটাস যোগ করা
    foreach ($results as &$business) {
        $business['average_rating'] = $business['average_rating'] ? round((float)$business['average_rating'], 1) : 0;
        $business['review_count'] = (int)$business['review_count'];
        $business['is_saved'] = in_array($business['id'], $saved_ids);
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