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
    if ($user_id === 0) {
        return new WP_Error('not_logged_in', 'User is not logged in.', ['status' => 401]);
    }

    // টেবিলের নামগুলো ডিফাইন করা
    $opp_table = $wpdb->prefix . 'jpbd_opportunities';
    $app_table = $wpdb->prefix . 'jpbd_applications';
    $users_table = $wpdb->prefix . 'users';
    $biz_table = $wpdb->prefix . 'jpbd_businesses';

    // ফাইনাল রেসপন্স অবজেক্ট
    $stats = [];

    // =====================================================================
    // STEP 1: Candidate/Business রোলের জন্য প্রয়োজনীয় ডেটা গণনা
    // =====================================================================
    $candidate_applications = $wpdb->get_results($wpdb->prepare(
        "SELECT opp.id as opportunity_id, opp.job_title, emp.display_name as company_name, app.status 
         FROM $app_table as app
         JOIN $opp_table as opp ON app.opportunity_id = opp.id
         JOIN $users_table as emp ON opp.user_id = emp.ID
         WHERE app.candidate_id = %d 
         ORDER BY app.application_date DESC",
        $user_id
    ), ARRAY_A);

    $stats['candidate_applications'] = $candidate_applications;

    $hired_count = 0;
    $shortlisted_count = 0;
    foreach ($candidate_applications as $app) {
        if ($app['status'] === 'hired') $hired_count++;
        if ($app['status'] === 'shortlisted') $shortlisted_count++;
    }
    $stats['hired_count'] = $hired_count;
    $stats['shortlisted_count'] = $shortlisted_count;
    $stats['total_applications'] = count($candidate_applications);
    $stats['profile_views'] = (int) get_user_meta($user_id, 'jpbd_profile_views', true);

    // Candidate/Business Chart Data (ডেমো)
    $stats['chart_candidate'] = [
        'labels' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'series' => [rand(5, 20), rand(5, 20), rand(5, 20), rand(5, 20), rand(5, 20), rand(5, 20), rand(5, 20)]
    ];

    // Business Listings Count
    $stats['business_listings_count'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $biz_table WHERE user_id = %d", $user_id));

    // =====================================================================
    // STEP 2: Employer/Admin রোলের জন্য প্রয়োজনীয় ডেটা গণনা
    // =====================================================================
    $stats['total_opportunities'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $opp_table WHERE user_id = %d", $user_id));
    $stats['total_applicants_employer'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $app_table WHERE opportunity_id IN (SELECT id FROM $opp_table WHERE user_id = %d)", $user_id));
    $stats['total_views'] = (int) $wpdb->get_var($wpdb->prepare("SELECT SUM(views_count) FROM $opp_table WHERE user_id = %d", $user_id));
    $stats['total_businesses'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $biz_table WHERE user_id = %d", $user_id));
    $stats['total_hired'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $app_table WHERE status = 'hired' AND opportunity_id IN (SELECT id FROM $opp_table WHERE user_id = %d)", $user_id));

    $stats['shortlisted_applicants'] = $wpdb->get_results($wpdb->prepare("SELECT app.id as application_id, app.status, usr.display_name as applicant_name, opp.job_title FROM $app_table as app JOIN $users_table as usr ON app.candidate_id = usr.ID JOIN $opp_table as opp ON app.opportunity_id = opp.id WHERE app.status IN ('shortlisted', 'hired') AND opp.user_id = %d ORDER BY app.application_date DESC LIMIT 5", $user_id), ARRAY_A);

    $stats['user_opportunities'] = $wpdb->get_results($wpdb->prepare("SELECT id, job_title FROM $opp_table WHERE user_id = %d ORDER BY created_at DESC", $user_id), ARRAY_A);

    // Employer Chart Data
    $chart_data = $wpdb->get_results($wpdb->prepare("SELECT DATE(created_at) as post_date, COUNT(id) as post_count FROM $opp_table WHERE user_id = %d AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY post_date ASC", $user_id), ARRAY_A);
    $labels = [];
    $series_data = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $labels[] = date('d M', strtotime($date));
        $post_count_for_date = 0;
        foreach ($chart_data as $row) {
            if ($row['post_date'] === $date) {
                $post_count_for_date = (int) $row['post_count'];
                break;
            }
        }
        $series_data[] = $post_count_for_date;
    }
    $stats['chart_employer'] = ['labels' => $labels, 'series' => $series_data];

    // সকল ডেটা একসাথে রিটার্ন করা
    return new WP_REST_Response($stats, 200);
}
