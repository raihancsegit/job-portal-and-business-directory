<?php
// ফাইল: includes/api/chat-api.php

if (!defined('ABSPATH')) exit;
require_once JPBD_PLUGIN_DIR . 'vendor/autoload.php';

add_action('rest_api_init', function () {
    // বর্তমান ইউজারের সব চ্যাট লিস্ট (conversations) আনার জন্য
    register_rest_route('jpbd/v1', '/inbox', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_get_conversations',
        'permission_callback' => 'is_user_logged_in',
    ]);

    // নির্দিষ্ট ইউজারের সাথে চ্যাটের মেসেজগুলো আনার জন্য
    register_rest_route('jpbd/v1', '/inbox/(?P<userId>\d+)', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_get_messages',
        'permission_callback' => 'is_user_logged_in',
    ]);

    // নির্দিষ্ট ইউজারকে নতুন মেসেজ পাঠানোর জন্য
    register_rest_route('jpbd/v1', '/inbox/(?P<userId>\d+)', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_send_message',
        'permission_callback' => 'is_user_logged_in',
    ]);

    register_rest_route('jpbd/v1', '/pusher/auth', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_pusher_auth',
        'permission_callback' => 'is_user_logged_in',
    ]);

    register_rest_route('jpbd/v1', '/chat/users', [
        'methods' => 'GET',
        'callback' => 'jpbd_api_get_all_chat_users',
        'permission_callback' => 'is_user_logged_in',
    ]);
});


/**
 * Helper function to get a conversation between two users
 */
function jpbd_get_conversation($user1_id, $user2_id)
{
    global $wpdb;
    $conv_table = $wpdb->prefix . 'jpbd_chat_conversations';

    $user1 = min($user1_id, $user2_id);
    $user2 = max($user1_id, $user2_id);

    return $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $conv_table WHERE user1_id = %d AND user2_id = %d",
        $user1,
        $user2
    ));
}

/**
 * বর্তমান ইউজারের সব চ্যাট লিস্ট (conversations) আনা
 */
function jpbd_api_get_conversations(WP_REST_Request $request)
{
    global $wpdb;
    $current_user_id = get_current_user_id();

    $conv_table = $wpdb->prefix . 'jpbd_chat_conversations';
    $msg_table = $wpdb->prefix . 'jpbd_chat_messages';

    $conversations_raw = $wpdb->get_results($wpdb->prepare(
        "SELECT *, 
                IF(user1_id = %d, user2_id, user1_id) as other_user_id,
                IF(user1_id = %d, user1_unread_count, user2_unread_count) as unread_count
         FROM $conv_table
         WHERE user1_id = %d OR user2_id = %d
         ORDER BY updated_at DESC",
        $current_user_id,
        $current_user_id,
        $current_user_id,
        $current_user_id
    ));

    if (empty($conversations_raw)) {
        return new WP_REST_Response([], 200);
    }

    $response_data = [];
    foreach ($conversations_raw as $convo) {
        $other_user_data = get_userdata($convo->other_user_id);
        if (!$other_user_data) continue;

        $first_name = get_user_meta($other_user_data->ID, 'first_name', true);
        $last_name = get_user_meta($other_user_data->ID, 'last_name', true);

        $full_name = trim("$first_name $last_name");

        // যদি full_name খালি থাকে, তাহলে display_name ব্যবহার করা
        $name_to_show = !empty($full_name) ? $full_name : $other_user_data->display_name;

        $last_message = $wpdb->get_row($wpdb->prepare(
            "SELECT message, created_at FROM $msg_table WHERE conversation_id = %d ORDER BY created_at DESC LIMIT 1",
            $convo->id
        ));

        $response_data[] = [
            'id' => $convo->id,
            'other_user' => [
                'id' => (int)$other_user_data->ID,
                'display_name' => $name_to_show,
                'avatar_url' => get_avatar_url($other_user_data->ID),
            ],
            'last_message' => $last_message ? [
                'message' => wp_trim_words($last_message->message, 10, '...'),
                'time_ago' => human_time_diff(strtotime($last_message->created_at), current_time('timestamp')) . ' ago',
            ] : null,
            'unread_count' => (int)$convo->unread_count,
        ];
    }

    return new WP_REST_Response($response_data, 200);
}

/**
 * নির্দিষ্ট ইউজারের সাথে চ্যাটের মেসেজগুলো আনা
 */
function jpbd_api_get_messages(WP_REST_Request $request)
{
    global $wpdb;
    $current_user_id = get_current_user_id();
    $other_user_id = (int)$request['userId'];

    $conv_table = $wpdb->prefix . 'jpbd_chat_conversations';
    $msg_table = $wpdb->prefix . 'jpbd_chat_messages';

    $conversation = jpbd_get_conversation($current_user_id, $other_user_id);
    $other_user_info = get_userdata($other_user_id);

    $first_name = get_user_meta($other_user_info->ID, 'first_name', true);
    $last_name = get_user_meta($other_user_info->ID, 'last_name', true);
    $full_name = trim("$first_name $last_name");
    $name_to_show = !empty($full_name) ? $full_name : $other_user_info->display_name;

    if (!$conversation) {
        return new WP_REST_Response([
            'messages' => [],
            'user_info' => ['id' => (int)$other_user_info->ID, 'display_name' => $name_to_show, 'avatar_url' => get_avatar_url($other_user_info->ID)],
            'conversation_id' => null
        ], 200);
    }

    $messages_raw = $wpdb->get_results($wpdb->prepare("SELECT * FROM $msg_table WHERE conversation_id = %d ORDER BY created_at ASC", $conversation->id));

    // মেসেজগুলোকে 'পড়া হয়েছে' হিসেবে মার্ক করা
    $wpdb->update($msg_table, ['is_read' => 1], ['conversation_id' => $conversation->id, 'receiver_id' => $current_user_id]);
    // আনরিড কাউন্ট রিসেট করা
    $unread_count_column = ($conversation->user1_id == $current_user_id) ? 'user1_unread_count' : 'user2_unread_count';
    $wpdb->update($conv_table, [$unread_count_column => 0], ['id' => $conversation->id]);

    $formatted_messages = array_map(function ($msg) {
        return [
            'id' => (int)$msg->id,
            'sender_id' => (int)$msg->sender_id,
            'message' => $msg->message,
            'time_ago' => human_time_diff(strtotime($msg->created_at), current_time('timestamp')) . ' ago'
        ];
    }, $messages_raw);

    return new WP_REST_Response([
        'messages' => $formatted_messages,
        'user_info' => ['id' => (int)$other_user_info->ID, 'display_name' => $other_user_info->display_name, 'avatar_url' => get_avatar_url($other_user_info->ID)],
        'conversation_id' => (int)$conversation->id
    ], 200);
}

/**
 * নির্দিষ্ট ইউজারকে নতুন মেসেজ পাঠানো
 */
// ফাইল: includes/api/chat-api.php

function jpbd_api_send_message(WP_REST_Request $request)
{
    global $wpdb;
    $sender_id = get_current_user_id();
    $receiver_id = (int)$request['userId'];
    $params = $request->get_json_params();
    $message = sanitize_textarea_field($params['message']);


    if (empty($message)) {
        return new WP_Error('bad_request', 'Message cannot be empty.', ['status' => 400]);
    }

    $conv_table = $wpdb->prefix . 'jpbd_chat_conversations';
    $msg_table = $wpdb->prefix . 'jpbd_chat_messages';

    $conversation = jpbd_get_conversation($sender_id, $receiver_id);
    if (!$conversation) {
        $user1 = min($sender_id, $receiver_id);
        $user2 = max($sender_id, $receiver_id);
        $wpdb->insert($conv_table, ['user1_id' => $user1, 'user2_id' => $user2]);
        $conversation_id = $wpdb->insert_id;
    } else {
        $conversation_id = $conversation->id;
    }

    $wpdb->insert($msg_table, ['conversation_id' => $conversation_id, 'sender_id' => $sender_id, 'receiver_id' => $receiver_id, 'message' => $message]);
    $new_message_id = $wpdb->insert_id;

    // আনরিড কাউন্ট বাড়ানো এবং updated_at আপডেট করা
    // Conversation নতুন হলে $conversation অবজেক্টটি null থাকবে, তাই একটি চেক যোগ করা হয়েছে
    $unread_col = ($conversation && $conversation->user1_id == $receiver_id) ? 'user1_unread_count' : 'user2_unread_count';
    $wpdb->query($wpdb->prepare("UPDATE $conv_table SET last_message_id = %d, $unread_col = $unread_col + 1, updated_at = NOW() WHERE id = %d", $new_message_id, $conversation_id));

    $sender_data = get_userdata($sender_id);
    $notification_message = wp_trim_words($sender_data->display_name, 2, '...') . ': ' . wp_trim_words($message, 5, '...');
    $notification_link = '/dashboard/inbox/' . $sender_id;

    jpbd_create_notification($receiver_id, $sender_id, 'new_message', $notification_message, $notification_link);

    // ================== PUSHER ইন্টিগ্রেশন (সঠিক সংস্করণ) ==================
    try {
        $pusher = new Pusher\Pusher(PUSHER_APP_KEY, PUSHER_APP_SECRET, PUSHER_APP_ID, ['cluster' => PUSHER_APP_CLUSTER]);

        $sender_data = get_userdata($sender_id);

        // ================== নতুন পরিবর্তন এখানে ==================
        // First name এবং last name দিয়ে একটি full_name তৈরি করা
        $first_name = get_user_meta($sender_data->ID, 'first_name', true);
        $last_name = get_user_meta($sender_data->ID, 'last_name', true);

        $full_name = trim("$first_name $last_name");

        // যদি full_name খালি থাকে, তাহলে display_name ব্যবহার করা
        $name_to_show = !empty($full_name) ? $full_name : $sender_data->display_name;
        // =======================================================

        $channel_name = 'private-chat-' . $conversation_id;
        $event_name = 'new-message';

        $data_to_push = [
            'id' => $new_message_id,
            'sender_id' => (int)$sender_id,
            'message' => $message,
            'time_ago' => 'Just now',
            'conversation_id' => $conversation_id,
            'sender' => [
                'display_name' => $name_to_show, // $sender_data->display_name এর পরিবর্তে $name_to_show
                'avatar_url' => get_avatar_url($sender_id)
            ]
        ];

        $pusher->trigger($channel_name, $event_name, $data_to_push);
    } catch (Exception $e) {
        error_log('Pusher Error: ' . $e->getMessage());
    }
    // ===============================================

    return new WP_REST_Response(['success' => true, 'message' => 'Message sent!', 'data' => $data_to_push], 201);
}

function jpbd_api_pusher_auth(WP_REST_Request $request)
{
    $current_user_id = get_current_user_id();
    $params = $request->get_params();
    $socket_id = $params['socket_id'];
    $channel_name = $params['channel_name'];

    $is_authorized = false;

    // নোটিফিকেশন চ্যানেলের জন্য অথরাইজেশন চেক
    if (preg_match('/private-notifications-(\d+)/', $channel_name, $matches)) {
        $channel_user_id = (int)$matches[1];
        if ($channel_user_id === $current_user_id) {
            $is_authorized = true;
        }
    }
    // চ্যাট চ্যানেলের জন্য অথরাইজেশন চেক
    elseif (preg_match('/private-chat-(\d+)/', $channel_name, $matches)) {
        $conversation_id = (int)$matches[1];
        global $wpdb;
        $conv_table = $wpdb->prefix . 'jpbd_chat_conversations';
        $conversation = $wpdb->get_row($wpdb->prepare("SELECT id FROM $conv_table WHERE id = %d AND (user1_id = %d OR user2_id = %d)", $conversation_id, $current_user_id, $current_user_id));
        if ($conversation) {
            $is_authorized = true;
        }
    }

    if (!$is_authorized) {
        return new WP_Error('forbidden', 'You are not authorized to access this channel.', ['status' => 403]);
    }

    try {
        $pusher = new Pusher\Pusher(PUSHER_APP_KEY, PUSHER_APP_SECRET, PUSHER_APP_ID, ['cluster' => PUSHER_APP_CLUSTER]);
        $auth = $pusher->authorizeChannel($channel_name, $socket_id);
        return new WP_REST_Response(json_decode($auth), 200);
    } catch (Exception $e) {
        return new WP_Error('pusher_error', $e->getMessage(), ['status' => 500]);
    }
}

/**
 * API Callback: Get a list of all users for starting a new chat.
 */
function jpbd_api_get_all_chat_users(WP_REST_Request $request)
{
    $current_user_id = get_current_user_id();
    $search_term = $request->get_param('search'); // সার্চ প্যারামিটার গ্রহণ করা

    $allowed_roles = ['employer', 'candidate', 'business', 'administrator'];
    $args = [
        'exclude' => [$current_user_id], // নিজেকে তালিকা থেকে বাদ দেওয়া
        'fields'  => ['ID', 'display_name', 'user_email'],
        'role__in' => $allowed_roles,
    ];

    if (!empty($search_term)) {
        $args['search'] = '*' . esc_sql($search_term) . '*';
        $args['search_columns'] = ['user_login', 'user_email', 'display_name'];
    }

    $users = get_users($args);


    $formatted_users = array_map(function ($user) {
        // ================== নতুন পরিবর্তন এখানে ==================
        $first_name = get_user_meta($user->ID, 'first_name', true);
        $last_name = get_user_meta($user->ID, 'last_name', true);

        $full_name = trim("$first_name $last_name");

        $name_to_show = !empty($full_name) ? $full_name : $user->display_name;

        $user_data = get_userdata($user->ID);

        $role = !empty($user_data->roles) ? ucfirst($user_data->roles[0]) : 'User';
        // =======================================================

        return [
            'id'           => $user->ID,
            // 'display_name' এর পরিবর্তে 'name_to_show' ব্যবহার করা
            'display_name' => $name_to_show,
            'avatar_url'   => get_avatar_url($user->ID),
            'role'         => $role,
        ];
    }, $users);

    return new WP_REST_Response($formatted_users, 200);
}
