<?php
// ফাইল: events-api.php
if (!defined('ABSPATH')) exit;

function jpbd_register_events_api_routes()
{
    register_rest_route('jpbd/v1', '/events', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_events',
        'permission_callback' => '__return_true',
    ]);

    // Create a new event
    register_rest_route('jpbd/v1', '/events', [
        'methods'  => 'POST',
        'callback' => 'jpbd_api_create_event',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    register_rest_route('jpbd/v1', '/events/upload-image', [
        'methods'  => 'POST',
        'callback' => 'jpbd_api_upload_event_image',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    register_rest_route('jpbd/v1', '/events/(?P<id>\d+)', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_single_event',
        'permission_callback' => '__return_true', // সবাই দেখতে পারবে
        'args' => [
            'id' => [
                'validate_callback' => function ($param) {
                    return is_numeric($param);
                }
            ]
        ]
    ]);

    // ক্যাটাগরি অনুযায়ী ইভেন্টের সংখ্যা আনার জন্য নতুন রুট
    register_rest_route('jpbd/v1', '/events/category-counts', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_event_category_counts',
        'permission_callback' => '__return_true',
    ]);

    // একটি ইভেন্ট আপডেট করার জন্য
    register_rest_route('jpbd/v1', '/events/(?P<id>\d+)', [
        'methods'  => 'POST', // WordPress-এ আপডেটের জন্য POST ব্যবহার করা সহজ
        'callback' => 'jpbd_api_update_event',
        'permission_callback' => 'is_user_logged_in',
    ]);

    // একটি ইভেন্ট ডিলেট করার জন্য
    register_rest_route('jpbd/v1', '/events/(?P<id>\d+)', [
        'methods'  => 'DELETE',
        'callback' => 'jpbd_api_delete_event',
        'permission_callback' => 'is_user_logged_in',
    ]);
}
add_action('rest_api_init', 'jpbd_register_events_api_routes');

// events-api.php

function jpbd_api_get_events(WP_REST_Request $request)
{
    global $wpdb;
    $events_table = $wpdb->prefix . 'jpbd_events';
    $users_table = $wpdb->prefix . 'users';
    $filters = $request->get_params();

    // পেজিনেশনের জন্য প্যারামিটার গ্রহণ করা
    $page = isset($filters['page']) ? (int)$filters['page'] : 1;
    $per_page = isset($filters['per_page']) ? (int)$filters['per_page'] : 9;
    $offset = ($page - 1) * $per_page;

    // WHERE ক্লজ এবং প্যারামিটার তৈরি করা
    $where_sql = " WHERE 1=1";
    $params = [];

    // ================== মূল সমাধান এখানে ==================
    // React থেকে পাঠানো category slug ('product-launches') অনুযায়ী ফিল্টার করা
    if (!empty($filters['category']) && $filters['category'] !== 'all') {
        $category_slug = sanitize_title($filters['category']);

        // ডেটাবেস থেকে সব ইউনিক ক্যাটাগরির নাম আনা হচ্ছে
        $all_categories = $wpdb->get_col("SELECT DISTINCT category FROM $events_table WHERE category != ''");

        $category_name_to_match = '';
        foreach ($all_categories as $name) {
            // প্রতিটি নামের জন্য slug তৈরি করে React থেকে আসা slug-এর সাথে মেলানো হচ্ছে
            if (sanitize_title($name) === $category_slug) {
                $category_name_to_match = $name;
                break;
            }
        }

        // যদি ম্যাচিং ক্যাটাগরি নাম পাওয়া যায়, তাহলে WHERE ক্লজে যোগ করা
        if (!empty($category_name_to_match)) {
            $where_sql .= " AND e.category = %s";
            $params[] = $category_name_to_match;
        } else {
            // যদি কোনো কারণে ম্যাচ না পাওয়া যায়, তাহলে কোনো ফলাফল না পাঠানোর জন্য
            $where_sql .= " AND 1=0";
        }
    }
    // =======================================================

    // প্রথমে ফিল্টার সহ মোট ইভেন্টের সংখ্যা গণনা করা
    $total_query = "SELECT COUNT(e.id) FROM $events_table e" . $where_sql;
    $total_events = (int) $wpdb->get_var($wpdb->prepare($total_query, $params));

    // বর্তমান পেজের জন্য ইভেন্টগুলো নিয়ে আসা
    $events_query = "
        SELECT e.*, u.display_name as organizer_name, u.ID as organizer_id
        FROM $events_table e 
        JOIN $users_table u ON e.user_id = u.ID
        " . $where_sql . " ORDER BY e.event_date DESC LIMIT %d OFFSET %d";

    // LIMIT এবং OFFSET প্যারামিটারগুলো শেষে যোগ করা
    $query_params = array_merge($params, [$per_page, $offset]);
    $events = $wpdb->get_results($wpdb->prepare($events_query, $query_params), ARRAY_A);

    // প্রতিটি ইভেন্টের সাথে অর্গানাইজারের অ্যাভাটার URL যোগ করা
    if (!empty($events)) {
        foreach ($events as &$event) {
            $event['organizer_avatar_url'] = get_avatar_url($event['organizer_id']);
        }
    }

    // রেসপন্স তৈরি করা এবং হেডার-এ মোট পেজের সংখ্যা পাঠানো
    $response = new WP_REST_Response($events, 200);
    $response->header('X-WP-TotalPages', ceil($total_events / $per_page));
    $response->header('X-WP-Total', $total_events);

    return $response;
}
/**
 * API Callback: Create a new event.
 * -- UPDATED to accept all fields including image_url --
 */
function jpbd_api_create_event(WP_REST_Request $request)
{
    global $wpdb;
    $events_table = $wpdb->prefix . 'jpbd_events';
    $user_id = get_current_user_id();
    $params = $request->get_json_params();

    $data = [
        'user_id' => $user_id,
        'title' => isset($params['title']) ? sanitize_text_field($params['title']) : '',
        'category' => isset($params['category']) ? sanitize_text_field($params['category']) : '',
        'event_date' => isset($params['event_date']) ? sanitize_text_field($params['event_date']) : '',
        'location' => isset($params['location']) ? sanitize_text_field($params['location']) : '',
        'description' => isset($params['description']) ? sanitize_textarea_field($params['description']) : '',
        'image_url' => isset($params['image_url']) ? esc_url_raw($params['image_url']) : '',
    ];

    $result = $wpdb->insert($events_table, $data);
    if (!$result) {
        return new WP_Error('db_error', 'Could not create event.', ['status' => 500]);
    }

    $new_event_id = $wpdb->insert_id;
    $users_table = $wpdb->prefix . 'users';
    $new_event = $wpdb->get_row($wpdb->prepare(
        "SELECT e.*, u.display_name as organizer_name FROM $events_table e JOIN $users_table u ON e.user_id = u.ID WHERE e.id = %d",
        $new_event_id
    ), ARRAY_A);

    return new WP_REST_Response($new_event, 201);
}

/**
 * API Callback: Handle event image upload.
 * This is similar to CV or Logo upload.
 */
function jpbd_api_upload_event_image(WP_REST_Request $request)
{
    if (!function_exists('wp_handle_upload')) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
    }

    $uploadedfile = $_FILES['event_image'];
    $upload_overrides = ['test_form' => false];
    $movefile = wp_handle_upload($uploadedfile, $upload_overrides);

    if ($movefile && !isset($movefile['error'])) {
        return new WP_REST_Response([
            'success' => true,
            'message' => 'Image uploaded successfully!',
            'url' => $movefile['url'],
        ], 200);
    } else {
        return new WP_Error('upload_error', $movefile['error'], ['status' => 500]);
    }
}

/**
 * API Callback: Get details for a single event and recent events.
 */
function jpbd_api_get_single_event(WP_REST_Request $request)
{
    global $wpdb;
    $event_id = (int) $request['id'];
    $events_table = $wpdb->prefix . 'jpbd_events';
    $users_table = $wpdb->prefix . 'users';

    // মূল ইভেন্টের বিস্তারিত তথ্য আনা
    $event_sql = "
        SELECT e.*, u.display_name as organizer_name 
        FROM $events_table e 
        JOIN $users_table u ON e.user_id = u.ID 
        WHERE e.id = %d";

    $event = $wpdb->get_row($wpdb->prepare($event_sql, $event_id), ARRAY_A);

    if (empty($event)) {
        return new WP_Error('not_found', 'Event not found.', ['status' => 404]);
    }

    // ঐ ক্যাটাগরির সাম্প্রতিক অন্যান্য ইভেন্টগুলো আনা (বর্তমান ইভেন্টটি বাদে)
    $recent_events_sql = "
        SELECT id, title, event_date, image_url 
        FROM $events_table 
        WHERE category = %s AND id != %d 
        ORDER BY event_date DESC 
        LIMIT 3"; // সর্বোচ্চ ৩টি সাম্প্রতিক ইভেন্ট

    $recent_events = $wpdb->get_results($wpdb->prepare($recent_events_sql, $event['category'], $event_id), ARRAY_A);

    // ফাইনাল রেসপন্স
    $response_data = [
        'event' => $event,
        'recent_events' => $recent_events
    ];

    return new WP_REST_Response($response_data, 200);
}

function jpbd_api_get_event_category_counts()
{
    global $wpdb;
    $events_table = $wpdb->prefix . 'jpbd_events';

    // সব ইভেন্টের মোট সংখ্যা গণনা
    $total_events = (int) $wpdb->get_var("SELECT COUNT(*) FROM $events_table");

    // প্রতিটি ক্যাটাগরির জন্য ইভেন্টের সংখ্যা গণনা
    $category_counts = $wpdb->get_results(
        "SELECT category as name, COUNT(*) as count FROM $events_table WHERE category != '' AND category IS NOT NULL GROUP BY category",
        ARRAY_A
    );

    // React অ্যাপের ব্যবহারের জন্য প্রতিটি ক্যাটাগরির নামের জন্য একটি slug তৈরি করা
    if (!empty($category_counts)) {
        foreach ($category_counts as &$cat) { // '&' ব্যবহার করে সরাসরি অ্যারে মডিফাই করা হচ্ছে
            $cat['slug'] = sanitize_title($cat['name']);
        }
    }

    // তালিকার শুরুতে 'All' অপশন যোগ করা
    array_unshift($category_counts, [
        'slug' => 'all',
        'name' => 'All',
        'count' => $total_events
    ]);

    return new WP_REST_Response($category_counts, 200);
}

function jpbd_api_update_event(WP_REST_Request $request)
{
    global $wpdb;
    $event_id = (int)$request['id'];
    $user_id = get_current_user_id();
    $events_table = $wpdb->prefix . 'jpbd_events';

    // ধাপ ১: ওনারশিপ ভেরিফাই করা
    $owner_id = (int)$wpdb->get_var($wpdb->prepare("SELECT user_id FROM $events_table WHERE id = %d", $event_id));

    // যদি ইভেন্টটি খুঁজে না পাওয়া যায় বা বর্তমান ইউজার ইভেন্টের মালিক না হয়
    if (!$owner_id || $owner_id !== $user_id) {
        return new WP_Error('forbidden', 'You do not have permission to edit this event.', ['status' => 403]);
    }

    $params = $request->get_json_params();
    $data = []; // একটি খালি অ্যারে তৈরি করা হচ্ছে, যাতে শুধুমাত্র পাঠানো ডেটা আপডেট করা হয়

    // ধাপ ২: React থেকে পাঠানো প্রতিটি ফিল্ড চেক এবং sanitize করা
    if (isset($params['title'])) {
        $data['title'] = sanitize_text_field($params['title']);
    }
    if (isset($params['category'])) {
        $data['category'] = sanitize_text_field($params['category']);
    }
    if (isset($params['event_date'])) {
        // datetime-local থেকে আসা 'YYYY-MM-DDTHH:MM' ফরম্যাটকে MySQL-এর জন্য 'YYYY-MM-DD HH:MM:SS' ফরম্যাটে রূপান্তর
        $data['event_date'] = sanitize_text_field(str_replace('T', ' ', $params['event_date']));
    }
    if (isset($params['location'])) {
        $data['location'] = sanitize_text_field($params['location']);
    }
    if (isset($params['description'])) {
        $data['description'] = sanitize_textarea_field($params['description']);
    }
    if (isset($params['image_url'])) {
        $data['image_url'] = esc_url_raw($params['image_url']);
    }

    // ধাপ ৩: যদি কোনো ডেটা না পাঠানো হয়, তাহলে এরর রিটার্ন করা
    if (empty($data)) {
        return new WP_Error('bad_request', 'No data provided to update.', ['status' => 400]);
    }

    // ধাপ ৪: ডাটাবেস আপডেট করা
    $result = $wpdb->update(
        $events_table,
        $data, // যে ডেটাগুলো আপডেট করতে হবে
        ['id' => $event_id] // কোন রো-টি আপডেট করতে হবে (WHERE id = ?)
    );

    // ডাটাবেস আপডেটে কোনো এরর হয়েছে কিনা তা চেক করা
    if ($result === false) {
        return new WP_Error('db_error', 'Could not update the event in the database.', ['status' => 500]);
    }

    // সফলভাবে আপডেট হলে একটি সফলতার মেসেজ পাঠানো
    return new WP_REST_Response(['success' => true, 'message' => 'Event updated successfully.'], 200);
}

function jpbd_api_delete_event(WP_REST_Request $request)
{
    global $wpdb;
    $event_id = (int)$request['id'];
    $user_id = get_current_user_id();
    $events_table = $wpdb->prefix . 'jpbd_events';

    // ওনারশিপ ভেরিফাই করা
    $owner_id = (int)$wpdb->get_var($wpdb->prepare("SELECT user_id FROM $events_table WHERE id = %d", $event_id));
    if (!$owner_id || $owner_id !== $user_id) {
        return new WP_Error('forbidden', 'You do not have permission to delete this event.', ['status' => 403]);
    }

    $wpdb->delete($events_table, ['id' => $event_id]);

    return new WP_REST_Response(['success' => true, 'message' => 'Event deleted successfully.'], 200);
}
