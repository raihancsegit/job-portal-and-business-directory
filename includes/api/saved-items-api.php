<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    // একটি আইটেম সেভ বা আনসেভ করার জন্য
    register_rest_route('jpbd/v1', '/saved-items/toggle', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_toggle_saved_item',
        'permission_callback' => 'is_user_logged_in',
    ]);

    // সেভ করা সব আইটেম আনার জন্য
    register_rest_route('jpbd/v1', '/saved-items', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_saved_items',
        'permission_callback' => 'is_user_logged_in',
    ]);

    register_rest_route('jpbd/v1', '/saved-items/filter-counts', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_saved_items_filter_counts',
        'permission_callback' => 'is_user_logged_in',
    ]);
});

function jpbd_api_toggle_saved_item(WP_REST_Request $request)
{
    global $wpdb;
    $user_id = get_current_user_id();
    $params = $request->get_json_params();
    $table_name = $wpdb->prefix . 'jpbd_saved_items';

    $item_id = isset($params['item_id']) ? (int)$params['item_id'] : 0;
    $item_type = isset($params['item_type']) ? sanitize_text_field($params['item_type']) : '';

    if (empty($item_id) || !in_array($item_type, ['opportunity', 'business'])) {
        return new WP_Error('bad_request', 'Invalid item ID or type.', ['status' => 400]);
    }

    $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %d AND item_id = %d AND item_type = %s", $user_id, $item_id, $item_type));

    if ($existing) {
        // যদি আগে থেকেই সেভ করা থাকে, তাহলে আনসেভ (ডিলেট) করুন
        $wpdb->delete($table_name, ['id' => $existing->id]);
        return new WP_REST_Response(['status' => 'unsaved', 'message' => 'Item removed from saved list.'], 200);
    } else {
        // যদি সেভ করা না থাকে, তাহলে সেভ (ইনসার্ট) করুন
        $wpdb->insert($table_name, ['user_id' => $user_id, 'item_id' => $item_id, 'item_type' => $item_type]);
        return new WP_REST_Response(['status' => 'saved', 'message' => 'Item saved successfully.'], 201);
    }
}

function jpbd_api_get_saved_items(WP_REST_Request $request)
{
    $user_id = get_current_user_id();
    $item_type = $request->get_param('type') ?: 'opportunity'; // ডিফল্ট 'opportunity'

    if (!in_array($item_type, ['opportunity', 'business'])) {
        return new WP_Error('bad_request', 'Invalid item type.', ['status' => 400]);
    }

    // সেভ করা আইটেমগুলোর ID বের করা
    global $wpdb;
    $saved_table = $wpdb->prefix . 'jpbd_saved_items';
    $saved_item_ids = $wpdb->get_col($wpdb->prepare(
        "SELECT item_id FROM $saved_table WHERE user_id = %d AND item_type = %s",
        $user_id,
        $item_type
    ));

    if (empty($saved_item_ids)) {
        return new WP_REST_Response([], 200);
    }

    $results = [];
    if ($item_type === 'opportunity') {
        $opp_table = $wpdb->prefix . 'jpbd_opportunities';
        $ids_placeholder = implode(',', array_fill(0, count($saved_item_ids), '%d'));
        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $opp_table WHERE id IN ($ids_placeholder)", $saved_item_ids), ARRAY_A);
    } elseif ($item_type === 'business') {
        $biz_table = $wpdb->prefix . 'jpbd_businesses';
        $ids_placeholder = implode(',', array_fill(0, count($saved_item_ids), '%d'));
        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $biz_table WHERE id IN ($ids_placeholder)", $saved_item_ids), ARRAY_A);
    }

    if (!empty($results)) {
        foreach ($results as &$item) { // <-- & ব্যবহার করা হয়েছে
            $item['is_saved'] = true;
        }
    }

    return new WP_REST_Response($results, 200);
}

function jpbd_api_get_saved_items_filter_counts(WP_REST_Request $request)
{
    global $wpdb;
    $user_id = get_current_user_id();
    $item_type = $request->get_param('type'); // 'opportunity' or 'business'

    if (empty($item_type) || !in_array($item_type, ['opportunity', 'business'])) {
        return new WP_Error('bad_request', 'A valid item type is required.', ['status' => 400]);
    }

    $saved_table = $wpdb->prefix . 'jpbd_saved_items';
    $main_table = $wpdb->prefix . 'jpbd_' . ($item_type === 'opportunity' ? 'opportunities' : 'businesses');

    // Get the IDs of all saved items of the specified type for the user
    $saved_item_ids = $wpdb->get_col($wpdb->prepare(
        "SELECT item_id FROM $saved_table WHERE user_id = %d AND item_type = %s",
        $user_id,
        $item_type
    ));

    if (empty($saved_item_ids)) {
        return new WP_REST_Response([
            'category' => [['name' => 'all', 'count' => 0]],
            'status' => [['name' => 'all', 'count' => 0]],
            'certifications' => [['name' => 'all', 'count' => 0]],
        ], 200);
    }

    $ids_placeholder = implode(',', array_map('intval', $saved_item_ids));
    $total_saved = count($saved_item_ids);

    $counts = [];

    if ($item_type === 'business') {
        // --- Category Counts ---
        $category_counts = $wpdb->get_results("SELECT category as name, COUNT(*) as count FROM $main_table WHERE id IN ($ids_placeholder) AND category != '' GROUP BY category", ARRAY_A);
        array_unshift($category_counts, ['name' => 'all', 'count' => $total_saved]);

        // --- Status Counts ---
        $status_counts = $wpdb->get_results("SELECT status as name, COUNT(*) as count FROM $main_table WHERE id IN ($ids_placeholder) AND status != '' GROUP BY status", ARRAY_A);
        array_unshift($status_counts, ['name' => 'all', 'count' => $total_saved]);

        $all_certifications_raw = $wpdb->get_col("SELECT certifications FROM $main_table WHERE id IN ($ids_placeholder) AND certifications IS NOT NULL AND certifications != ''");
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
        $formatted_cert_counts = [];
        foreach ($cert_counts as $name => $count) {
            $formatted_cert_counts[] = ['name' => $name, 'count' => $count];
        }
        array_unshift($formatted_cert_counts, ['name' => 'all', 'count' => $total_saved]);
        // =======================================================

        $counts = [
            'category' => $category_counts,
            'status' => $status_counts,
            'certifications' => $formatted_cert_counts, // <-- রেসপন্সে যোগ করা
        ];
    }
    // You can add logic for 'opportunity' here if needed later

    return new WP_REST_Response($counts, 200);
}
