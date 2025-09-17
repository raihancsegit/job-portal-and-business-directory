<?php
// ফাইল: community-api.php
if (!defined('ABSPATH')) exit;

function jpbd_register_community_api_routes()
{
    // Get all posts with filtering
    register_rest_route('jpbd/v1', '/community/posts', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_community_posts',
        'permission_callback' => '__return_true',
    ]);

    // Create a new post
    register_rest_route('jpbd/v1', '/community/posts', [
        'methods'  => 'POST',
        'callback' => 'jpbd_api_create_community_post',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    // Get all replies for a post
    register_rest_route('jpbd/v1', '/community/posts/(?P<id>\d+)/replies', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_post_replies',
        'permission_callback' => '__return_true',
    ]);

    // Add a new reply to a post
    register_rest_route('jpbd/v1', '/community/posts/(?P<id>\d+)/replies', [
        'methods'  => 'POST',
        'callback' => 'jpbd_api_add_post_reply',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);
}
add_action('rest_api_init', 'jpbd_register_community_api_routes');


function jpbd_api_get_community_posts(WP_REST_Request $request)
{
    global $wpdb;
    $posts_table = $wpdb->prefix . 'jpbd_community_posts';
    $replies_table = $wpdb->prefix . 'jpbd_community_replies';
    $users_table = $wpdb->prefix . 'users';
    $filters = $request->get_params();

    $sql = "SELECT p.*, u.display_name as author_name, (SELECT COUNT(*) FROM $replies_table WHERE post_id = p.id) as reply_count FROM $posts_table p JOIN $users_table u ON p.user_id = u.ID WHERE 1=1";
    $params = [];

    if (!empty($filters['category']) && $filters['category'] !== 'All') {
        $sql .= " AND p.category = %s";
        $params[] = $filters['category'];
    }
    if (!empty($filters['search'])) {
        $sql .= " AND (p.title LIKE %s OR p.content LIKE %s)";
        $params[] = '%' . $wpdb->esc_like($filters['search']) . '%';
        $params[] = '%' . $wpdb->esc_like($filters['search']) . '%';
    }
    $sql .= " ORDER BY p.created_at DESC";
    $posts = $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A);

    return new WP_REST_Response($posts, 200);
}


function jpbd_api_create_community_post(WP_REST_Request $request)
{
    global $wpdb;
    $posts_table = $wpdb->prefix . 'jpbd_community_posts';
    $user_id = get_current_user_id();
    $params = $request->get_json_params();

    $data = [
        'user_id' => $user_id,
        'title' => sanitize_text_field($params['title']),
        'content' => sanitize_textarea_field($params['content']),
        'category' => sanitize_text_field($params['category']),
    ];
    $result = $wpdb->insert($posts_table, $data);

    if (!$result) return new WP_Error('db_error', 'Could not create post.', ['status' => 500]);

    $new_post_id = $wpdb->insert_id;
    $users_table = $wpdb->prefix . 'users';
    $new_post = $wpdb->get_row($wpdb->prepare("SELECT p.*, u.display_name as author_name, 0 as reply_count FROM $posts_table p JOIN $users_table u ON p.user_id = u.ID WHERE p.id = %d", $new_post_id), ARRAY_A);

    return new WP_REST_Response($new_post, 201);
}


function jpbd_api_get_post_replies(WP_REST_Request $request)
{
    global $wpdb;
    $post_id = (int) $request['id'];
    $replies_table = $wpdb->prefix . 'jpbd_community_replies';
    $users_table = $wpdb->prefix . 'users';
    $sql = "SELECT r.*, u.display_name as author_name FROM $replies_table r JOIN $users_table u ON r.user_id = u.ID WHERE r.post_id = %d ORDER BY r.created_at ASC";
    $replies = $wpdb->get_results($wpdb->prepare($sql, $post_id), ARRAY_A);
    return new WP_REST_Response($replies, 200);
}


function jpbd_api_add_post_reply(WP_REST_Request $request)
{
    global $wpdb;
    $replies_table = $wpdb->prefix . 'jpbd_community_replies';
    $post_id = (int) $request['id'];
    $user_id = get_current_user_id();
    $params = $request->get_json_params();

    if (empty($params['content'])) {
        return new WP_Error('bad_request', 'Reply content cannot be empty.', ['status' => 400]);
    }

    $data = [
        'post_id' => $post_id,
        'user_id' => $user_id,
        'content' => sanitize_textarea_field($params['content']),
    ];

    $result = $wpdb->insert($replies_table, $data);

    if (!$result) return new WP_Error('db_error', 'Could not save reply.', ['status' => 500]);

    $new_reply_id = $wpdb->insert_id;
    $users_table = $wpdb->prefix . 'users';
    $new_reply = $wpdb->get_row($wpdb->prepare("SELECT r.*, u.display_name as author_name FROM $replies_table r JOIN $users_table u ON r.user_id = u.ID WHERE r.id = %d", $new_reply_id), ARRAY_A);

    return new WP_REST_Response($new_reply, 201);
}
