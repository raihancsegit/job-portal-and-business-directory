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

    $stats = [];
    $roles = (array) $user->roles;

    // টেবিলের নামগুলো ডিফাইন করা
    $opp_table = $wpdb->prefix . 'jpbd_opportunities';
    $app_table = $wpdb->prefix . 'jpbd_applications';
    $users_table = $wpdb->prefix . 'users';
    $biz_table = $wpdb->prefix . 'jpbd_businesses';
    $saved_table = $wpdb->prefix . 'jpbd_saved_items';

    // একটি হেল্পার লুপ যা গত ৭ দিনের তারিখ এবং লেবেল তৈরি করে
    $chart_labels = [];
    $date_keys = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $date_keys[] = $date;
        $chart_labels[] = date('d M', strtotime($date));
    }
    $start_date_for_sql = date('Y-m-d H:i:s', strtotime("-6 days 00:00:00"));

    // =====================================================================
    // Candidate বা Business রোলের জন্য ডেটা গণনা
    // =====================================================================
    if (in_array('candidate', $roles) || in_array('business', $roles)) {

        // --- Stat Cards Data ---
        $stats['profile_views'] = (int) get_user_meta($user_id, 'jpbd_profile_views', true);

        // My Application Status টেবিলের জন্য ডেটা
        $stats['candidate_applications'] = $wpdb->get_results($wpdb->prepare(
            "SELECT opp.id as opportunity_id, opp.job_title, emp.display_name as company_name, app.status 
             FROM $app_table as app
             JOIN $opp_table as opp ON app.opportunity_id = opp.id
             JOIN $users_table as emp ON opp.user_id = emp.ID
             WHERE app.candidate_id = %d 
             ORDER BY app.application_date DESC",
            $user_id
        ), ARRAY_A);

        // স্ট্যাটাস অনুযায়ী আবেদন গণনা
        $hired_count = 0;
        $shortlisted_count = 0;
        if (!empty($stats['candidate_applications'])) {
            foreach ($stats['candidate_applications'] as $app) {
                if ($app['status'] === 'hired') {
                    $hired_count++;
                }
                if ($app['status'] === 'shortlisted') {
                    $shortlisted_count++;
                }
            }
        }
        $stats['hired_count'] = $hired_count;
        $stats['shortlisted_count'] = $shortlisted_count;
        $stats['total_applications'] = count($stats['candidate_applications']);

        // --- Chart Data for Candidate/Business ---
        // Applied Opportunity
        $applied_data = $wpdb->get_results($wpdb->prepare("SELECT DATE(application_date) as date, COUNT(id) as count FROM $app_table WHERE candidate_id = %d AND application_date >= %s GROUP BY DATE(application_date)", $user_id, $start_date_for_sql), OBJECT_K);

        // Shortlisted
        $shortlisted_data = $wpdb->get_results($wpdb->prepare("SELECT DATE(application_date) as date, COUNT(id) as count FROM $app_table WHERE candidate_id = %d AND status IN ('shortlisted', 'hired') AND application_date >= %s GROUP BY DATE(application_date)", $user_id, $start_date_for_sql), OBJECT_K);

        $applied_series = [];
        $shortlisted_series = [];
        foreach ($date_keys as $date_key) {
            $applied_series[] = isset($applied_data[$date_key]) ? (int)$applied_data[$date_key]->count : 0;
            $shortlisted_series[] = isset($shortlisted_data[$date_key]) ? (int)$shortlisted_data[$date_key]->count : 0;
        }

        $stats['chart_candidate'] = [
            'labels' => $chart_labels,
            'series' => [
                ['name' => 'Applied', 'data' => $applied_series],
                ['name' => 'Shortlisted', 'data' => $shortlisted_series]
            ]
        ];

        // শুধুমাত্র Business রোলের জন্য অতিরিক্ত ডেটা
        if (in_array('business', $roles)) {
            $stats['my_listings_count'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $biz_table WHERE user_id = %d", $user_id));
        }

        // उभয়ের জন্যই সেভ করা আইটেমগুলোর আলাদা গণনা
        $stats['saved_opportunities_count'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $saved_table WHERE user_id = %d AND item_type = 'opportunity'", $user_id));
        $stats['saved_businesses_count'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $saved_table WHERE user_id = %d AND item_type = 'business'", $user_id));
    }
    // =====================================================================
    // Employer বা Administrator রোলের জন্য ডেটা গণনা
    // =====================================================================
    elseif (in_array('employer', $roles) || in_array('administrator', $roles)) {

        // --- Stat Cards Data ---
        $stats['total_opportunities'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $opp_table WHERE user_id = %d", $user_id));
        $stats['total_applicants_employer'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $app_table WHERE opportunity_id IN (SELECT id FROM $opp_table WHERE user_id = %d)", $user_id));
        $stats['total_views'] = (int) $wpdb->get_var($wpdb->prepare("SELECT SUM(views_count) FROM $opp_table WHERE user_id = %d", $user_id));

        $stats['total_businesses'] = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $biz_table WHERE user_id = %d",
            $user_id
        ));

        $stats['total_hired'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $app_table WHERE status = 'hired' AND opportunity_id IN (SELECT id FROM $opp_table WHERE user_id = %d)", $user_id));

        // Recent Shortlisted টেবিলের জন্য ডেটা
        $stats['shortlisted_applicants'] = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                app.id as application_id, 
                app.status, 
                usr.display_name as applicant_name, 
                usr.ID as candidate_user_id, -- <-- এই লাইনটি যোগ করা হয়েছে
                opp.job_title 
             FROM $app_table as app 
             JOIN $users_table as usr ON app.candidate_id = usr.ID 
             JOIN $opp_table as opp ON app.opportunity_id = opp.id 
             WHERE app.status IN ('shortlisted', 'hired') AND opp.user_id = %d 
             ORDER BY app.application_date DESC LIMIT 5",
            $user_id
        ), ARRAY_A);

        // ড্রপডাউনের জন্য এমপ্লয়ারের সব opportunity-র তালিকা
        $stats['user_opportunities'] = $wpdb->get_results($wpdb->prepare(
            "SELECT id, job_title FROM $opp_table WHERE user_id = %d ORDER BY created_at DESC",
            $user_id
        ), ARRAY_A);

        // --- Chart Data for Employer ---
        $posted_data = $wpdb->get_results($wpdb->prepare("SELECT DATE(created_at) as date, COUNT(id) as count FROM $opp_table WHERE user_id = %d AND created_at >= %s GROUP BY DATE(created_at)", $user_id, $start_date_for_sql), OBJECT_K);
        $applicants_data = $wpdb->get_results($wpdb->prepare("SELECT DATE(application_date) as date, COUNT(id) as count FROM $app_table WHERE opportunity_id IN (SELECT id FROM $opp_table WHERE user_id = %d) AND application_date >= %s GROUP BY DATE(application_date)", $user_id, $start_date_for_sql), OBJECT_K);

        $posted_series = [];
        $applicants_series = [];
        foreach ($date_keys as $date_key) {
            $posted_series[] = isset($posted_data[$date_key]) ? (int)$posted_data[$date_key]->count : 0;
            $applicants_series[] = isset($applicants_data[$date_key]) ? (int)$applicants_data[$date_key]->count : 0;
        }

        $stats['chart_employer'] = [
            'labels' => $chart_labels,
            'series' => [
                ['name' => 'Posted', 'data' => $posted_series],
                ['name' => 'Applicants', 'data' => $applicants_series]
            ]
        ];
    }

    return new WP_REST_Response($stats, 200);
}
