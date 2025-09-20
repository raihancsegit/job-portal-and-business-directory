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
    $per_page = isset($filters['per_page']) ? (int)$filters['per_page'] : 9; // প্রতি পেজে ৯টি ইভেন্ট
    $offset = ($page - 1) * $per_page;

    // WHERE ক্লজ তৈরি করা
    $where_sql = " WHERE 1=1";
    $params = [];

    if (!empty($filters['category']) && $filters['category'] !== 'all') {
        $where_sql .= " AND e.category = %s";
        $params[] = $filters['category'];
    }

    // প্রথমে মোট ইভেন্টের সংখ্যা গণনা করা (ফিল্টার সহ)
    $total_query = "SELECT COUNT(*) FROM $events_table e" . $where_sql;
    $total_events = (int) $wpdb->get_var($wpdb->prepare($total_query, $params));

    // বর্তমান পেজের জন্য ইভেন্টগুলো নিয়ে আসা
    $events_query = "
        SELECT e.*, u.display_name as organizer_name, u.ID as organizer_id
        FROM $events_table e 
        JOIN $users_table u ON e.user_id = u.ID
        " . $where_sql . " ORDER BY e.event_date DESC LIMIT %d OFFSET %d";

    array_push($params, $per_page, $offset);
    $events = $wpdb->get_results($wpdb->prepare($events_query, $params), ARRAY_A);

    foreach ($events as &$event) { // '&' ব্যবহার করা হয়েছে সরাসরি অ্যারে মডিফাই করার জন্য
        $event['organizer_avatar_url'] = get_avatar_url($event['organizer_id']);
    }
    // হেডার-এ মোট পেজের সংখ্যা পাঠানো
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
