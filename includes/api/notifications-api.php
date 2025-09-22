<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    // বর্তমান ইউজারের সব নোটিফিকেশন আনার জন্য
    register_rest_route('jpbd/v1', '/notifications', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_get_notifications',
        'permission_callback' => 'is_user_logged_in',
    ]);

    // নোটিফিকেশন 'পড়া হয়েছে' হিসেবে মার্ক করার জন্য
    register_rest_route('jpbd/v1', '/notifications/mark-as-read', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_mark_notifications_as_read',
        'permission_callback' => 'is_user_logged_in',
    ]);

    register_rest_route('jpbd/v1', '/notifications/clear-all', [
        'methods' => 'DELETE',
        'callback' => 'jpbd_api_clear_all_notifications',
        'permission_callback' => 'is_user_logged_in',
    ]);
});

function jpbd_api_get_notifications(WP_REST_Request $request)
{
    global $wpdb;
    $user_id = get_current_user_id();
    $table_name = $wpdb->prefix . 'jpbd_notifications';

    $limit = $request->get_param('limit') ?: 5; // ডিফল্ট ৫টি নোটিফিকেশন

    $notifications = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM $table_name WHERE user_id = %d ORDER BY created_at DESC LIMIT %d",
        $user_id,
        $limit
    ));

    $unread_count = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM $table_name WHERE user_id = %d AND is_read = 0",
        $user_id
    ));

    $response = [
        'notifications' => array_map('format_notification_response', $notifications),
        'unread_count' => $unread_count
    ];

    return new WP_REST_Response($response, 200);
}

function jpbd_api_mark_notifications_as_read()
{
    global $wpdb;
    $user_id = get_current_user_id();
    $table_name = $wpdb->prefix . 'jpbd_notifications';

    $wpdb->update($table_name, ['is_read' => 1], ['user_id' => $user_id, 'is_read' => 0]);

    return new WP_REST_Response(['success' => true], 200);
}

// Helper to format the response
function format_notification_response($notification)
{
    $sender = $notification->sender_id ? get_userdata($notification->sender_id) : null;
    $link_path = $notification->link;
    return [
        'id' => $notification->id,
        'message' => $notification->message,
        'link' =>  $link_path, // সম্পূর্ণ URL তৈরি করা
        'time_ago' => human_time_diff(strtotime($notification->created_at), current_time('timestamp')) . ' ago',
        'sender_avatar' => $sender ? get_avatar_url($sender->ID) : null,
    ];
}

function jpbd_api_clear_all_notifications(WP_REST_Request $request)
{
    global $wpdb;
    $user_id = get_current_user_id();
    $table_name = $wpdb->prefix . 'jpbd_notifications';

    $result = $wpdb->delete($table_name, ['user_id' => $user_id]);

    if ($result === false) {
        return new WP_Error('db_error', 'Could not clear notifications.', ['status' => 500]);
    }

    return new WP_REST_Response(['success' => true, 'message' => 'All notifications cleared.'], 200);
}
