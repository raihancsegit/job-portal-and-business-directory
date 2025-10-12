<?php
// dashboard-api.php (বা অন্য কোনো API ফাইল)

/**
 * Register a new route to get dashboard chart statistics.
 */
function jpbd_register_dashboard_stats_route()
{
    register_rest_route('jpbd/v1', '/dashboard/stats', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_dashboard_stats',
        'permission_callback' => function () {
            // এখন যেকোনো লগইন করা ইউজারই এই ডেটা দেখতে পারবে
            return is_user_logged_in();
        },
    ]);
}
add_action('rest_api_init', 'jpbd_register_dashboard_stats_route');


/**
 * API Callback: Get statistics for the dashboard.
 * -- FINAL & COMPLETE VERSION for ALL ROLES --
 * This version calculates and returns ALL necessary data for ALL roles in a single, unified response.
 */

function jpbd_api_get_dashboard_stats(WP_REST_Request $request)
{
    global $wpdb;
    $user_id = get_current_user_id();
    $user = wp_get_current_user();
    if ($user_id === 0) {
        return new WP_Error('not_logged_in', 'User is not logged in.', ['status' => 401]);
    }

    // নতুন: রিকোয়েস্ট থেকে date_range প্যারামিটার নিন (চার্টের জন্য)
    $date_range = $request->get_param('date_range') ? sanitize_text_field($request->get_param('date_range')) : 'last_7_days';

    $stats = [];
    $roles = (array) $user->roles;

    // টেবিলের নামগুলো ডিফাইন করা
    $opp_table = $wpdb->prefix . 'jpbd_opportunities';
    $app_table = $wpdb->prefix . 'jpbd_applications';
    $users_table = $wpdb->prefix . 'users';
    $biz_table = $wpdb->prefix . 'jpbd_businesses';
    $saved_table = $wpdb->prefix . 'jpbd_saved_items';

    // =====================================================================
    // চার্টের জন্য ডায়নামিক তারিখ গণনা
    // =====================================================================
    $chart_labels = [];
    $date_keys = [];
    $days_to_subtract = 6; // ডিফল্ট: গত ৭ দিন
    $date_format_label = 'd M';

    switch ($date_range) {
        case 'last_30_days':
            $days_to_subtract = 29;
            break;
        case 'last_year':
            // প্রতি মাসের লেবেল তৈরি করা
            for ($i = 11; $i >= 0; $i--) {
                $date = date('Y-m-01', strtotime("-$i months"));
                $date_keys[] = date('Y-m', strtotime($date));
                $chart_labels[] = date('M Y', strtotime($date));
            }
            $start_date_for_sql = date('Y-m-d H:i:s', strtotime("-12 months"));
            break;
        case 'last_7_days':
        default:
            $start_date_for_sql = date('Y-m-d H:i:s', strtotime("-6 days 00:00:00"));
            break;
    }

    // last_year ছাড়া অন্য ক্ষেত্রে দিনের লেবেল তৈরি
    if ($date_range !== 'last_year') {
        for ($i = $days_to_subtract; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $date_keys[] = $date;
            $chart_labels[] = date($date_format_label, strtotime($date));
        }
        $start_date_for_sql = date('Y-m-d H:i:s', strtotime("-{$days_to_subtract} days 00:00:00"));
    }

    // SQL GROUP BY Clause-এর জন্য ফরম্যাট নির্ধারণ
    $sql_date_group_format = ($date_range === 'last_year') ? "DATE_FORMAT(created_at, '%%Y-%%m')" : "DATE(created_at)";
    $sql_app_date_group_format = ($date_range === 'last_year') ? "DATE_FORMAT(application_date, '%%Y-%%m')" : "DATE(application_date)";
    $date_key_format = ($date_range === 'last_year') ? 'Y-m' : 'Y-m-d';


    // =====================================================================
    // Candidate বা Business রোলের জন্য ডেটা গণনা
    // =====================================================================
    if (in_array('candidate', $roles) || in_array('business', $roles)) {
        // ... Stat Cards Data (আগের মতই) ...
        $stats['profile_views'] = (int) get_user_meta($user_id, 'jpbd_profile_views', true);
        $stats['saved_opportunities_count'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $saved_table WHERE user_id = %d AND item_type = 'opportunity'", $user_id));
        $stats['saved_businesses_count'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $saved_table WHERE user_id = %d AND item_type = 'business'", $user_id));

        $candidate_applications = $wpdb->get_results($wpdb->prepare(
            "SELECT opp.id as opportunity_id, opp.job_title, emp.display_name as company_name, app.status 
             FROM $app_table as app JOIN $opp_table as opp ON app.opportunity_id = opp.id JOIN $users_table as emp ON opp.user_id = emp.ID
             WHERE app.candidate_id = %d ORDER BY app.application_date DESC",
            $user_id
        ), ARRAY_A);
        $stats['candidate_applications'] = $candidate_applications;

        $stats['hired_count'] = (int) array_reduce($candidate_applications, function ($carry, $item) {
            return $carry + ($item['status'] === 'hired' ? 1 : 0);
        }, 0);
        $stats['shortlisted_count'] = (int) array_reduce($candidate_applications, function ($carry, $item) {
            return $carry + ($item['status'] === 'shortlisted' ? 1 : 0);
        }, 0);
        $stats['total_applications'] = count($candidate_applications);

        if (in_array('business', $roles)) {
            $stats['my_listings_count'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $biz_table WHERE user_id = %d", $user_id));
        }

        // --- Chart Data (আপডেটেড) ---
        $applied_data = $wpdb->get_results($wpdb->prepare("SELECT $sql_app_date_group_format as date, COUNT(id) as count FROM $app_table WHERE candidate_id = %d AND application_date >= %s GROUP BY date", $user_id, $start_date_for_sql), OBJECT_K);
        $shortlisted_data = $wpdb->get_results($wpdb->prepare("SELECT $sql_app_date_group_format as date, COUNT(id) as count FROM $app_table WHERE candidate_id = %d AND status IN ('shortlisted', 'hired') AND application_date >= %s GROUP BY date", $user_id, $start_date_for_sql), OBJECT_K);

        $applied_series = [];
        $shortlisted_series = [];
        foreach ($date_keys as $date_key) {
            $applied_series[] = isset($applied_data[$date_key]) ? (int)$applied_data[$date_key]->count : 0;
            $shortlisted_series[] = isset($shortlisted_data[$date_key]) ? (int)$shortlisted_data[$date_key]->count : 0;
        }

        $stats['chart_candidate'] = ['labels' => $chart_labels, 'series' => [['name' => 'Applied', 'data' => $applied_series], ['name' => 'Shortlisted', 'data' => $shortlisted_series]]];
    }
    // =====================================================================
    // Employer বা Administrator রোলের জন্য ডেটা গণনা
    // =====================================================================
    elseif (in_array('employer', $roles) || in_array('administrator', $roles)) {
        // --- Stat Cards Data ---
        $stats['total_opportunities'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $opp_table WHERE user_id = %d", $user_id));
        $stats['total_applicants_employer'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $app_table WHERE opportunity_id IN (SELECT id FROM $opp_table WHERE user_id = %d)", $user_id));
        $stats['total_views'] = (int) $wpdb->get_var($wpdb->prepare("SELECT SUM(views_count) FROM $opp_table WHERE user_id = %d", $user_id));
        $stats['total_businesses'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $biz_table WHERE user_id = %d", $user_id));
        $stats['total_hired'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $app_table WHERE status = 'hired' AND opportunity_id IN (SELECT id FROM $opp_table WHERE user_id = %d)", $user_id));

        // Recent Shortlisted টেবিলের জন্য ডেটা
        $stats['shortlisted_applicants'] = $wpdb->get_results($wpdb->prepare("SELECT app.id as application_id, app.status, usr.display_name as applicant_name, usr.ID as candidate_user_id, opp.job_title FROM $app_table as app JOIN $users_table as usr ON app.candidate_id = usr.ID JOIN $opp_table as opp ON app.opportunity_id = opp.id WHERE app.status IN ('shortlisted', 'hired') AND opp.user_id = %d ORDER BY app.application_date DESC LIMIT 5", $user_id), ARRAY_A);

        // ড্রপডাউনের জন্য এমপ্লয়ারের সব opportunity-র তালিকা
        $stats['user_opportunities'] = $wpdb->get_results($wpdb->prepare("SELECT id, job_title FROM $opp_table WHERE user_id = %d ORDER BY created_at DESC", $user_id), ARRAY_A);

        // --- Chart Data for Employer (আপডেটেড) ---
        $posted_data = $wpdb->get_results($wpdb->prepare("SELECT $sql_date_group_format as date, COUNT(id) as count FROM $opp_table WHERE user_id = %d AND created_at >= %s GROUP BY date", $user_id, $start_date_for_sql), OBJECT_K);
        $applicants_data = $wpdb->get_results($wpdb->prepare("SELECT $sql_app_date_group_format as date, COUNT(id) as count FROM $app_table WHERE opportunity_id IN (SELECT id FROM $opp_table WHERE user_id = %d) AND application_date >= %s GROUP BY date", $user_id, $start_date_for_sql), OBJECT_K);

        $posted_series = [];
        $applicants_series = [];
        foreach ($date_keys as $date_key) {
            $posted_series[] = isset($posted_data[$date_key]) ? (int)$posted_data[$date_key]->count : 0;
            $applicants_series[] = isset($applicants_data[$date_key]) ? (int)$applicants_data[$date_key]->count : 0;
        }

        $stats['chart_employer'] = ['labels' => $chart_labels, 'series' => [['name' => 'Posted', 'data' => $posted_series], ['name' => 'Applicants', 'data' => $applicants_series]]];
    }

    return new WP_REST_Response($stats, 200);
}