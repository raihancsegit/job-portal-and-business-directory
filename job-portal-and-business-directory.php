<?php

/**
 * Plugin Name:       Job Portal and Business Directory
 * Description:       A modern job portal and business directory plugin powered by React.
 * Version:           1.0.0
 * Author:            Your Name
 * License:           GPL v2 or later
 * Text Domain:       jpbd
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}


// Load the main plugin class.
require_once plugin_dir_path(__FILE__) . 'includes/class-main.php';

/**
 * All activation and deactivation hooks should be in one place.
 */

// 1. Activation Hook: Combines all activation tasks.
function jpbd_activate_plugin()
{

    // আগের 'job_seeker' রোলটি মুছে ফেলা (যদি থাকে)
    remove_role('job_seeker');


    $manage_applications_cap = 'manage_applications';
    $add_businesses_cap = 'add_businesses';

    // নতুন রোলগুলো তৈরি করা
    add_role('employer', 'Employer', [
        'read' => true,
        'create_opportunities' => true,

    ]);
    add_role('candidate', 'Candidate', ['read' => true]);
    add_role('business', 'Business', [
        'read' => true,
    ]);

    // অ্যাডমিনকে সব ক্ষমতা দেওয়া
    $admin_role = get_role('administrator');
    if ($admin_role) {
        $admin_role->add_cap('create_opportunities', true);
        $admin_role->add_cap($manage_applications_cap, true); // <-- অ্যাডমিনকেও নতুন ক্ষমতা দেওয়া হলো
        $admin_role->add_cap($add_businesses_cap, true);

        $admin_role->add_cap('remove_users');
        $admin_role->add_cap('edit_users');
    }

    // Rewrite rules flush করা
    jpbd_add_rewrite_rules_on_init();
    flush_rewrite_rules();

    jpbd_create_opportunities_table();
    jpbd_create_applications_table();
    jpbd_create_businesses_table();
    jpbd_create_community_tables();
    jpbd_create_events_table();
}
register_activation_hook(__FILE__, 'jpbd_activate_plugin');

function jpbd_create_events_table()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_events';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        image_url varchar(255),
        category varchar(100) NOT NULL,
        event_date datetime NOT NULL,
        location varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY category (category)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
function jpbd_create_community_tables()
{
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Posts Table
    $posts_table = $wpdb->prefix . 'jpbd_community_posts';
    $sql_posts = "CREATE TABLE $posts_table (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        title varchar(255) NOT NULL,
        content text NOT NULL,
        category varchar(100) NOT NULL,
        views int(11) DEFAULT 0 NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";

    // Replies Table
    $replies_table = $wpdb->prefix . 'jpbd_community_replies';
    $sql_replies = "CREATE TABLE $replies_table (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        post_id mediumint(9) NOT NULL,
        user_id bigint(20) UNSIGNED NOT NULL,
        content text NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id),
        KEY post_id (post_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql_posts);
    dbDelta($sql_replies);
}
function jpbd_create_businesses_table()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_businesses';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        logo_url varchar(255) DEFAULT '' NOT NULL,
        title varchar(255) NOT NULL,
        tagline varchar(255) DEFAULT '' NOT NULL,
        industry varchar(100) DEFAULT '' NOT NULL,
        category varchar(100) DEFAULT '' NOT NULL,
        status varchar(100) DEFAULT '' NOT NULL,
        details text,
        country_code varchar(10),
        city varchar(100),
        address varchar(255),
        zip_code varchar(20),
        website_url varchar(255),
        phone_code varchar(10),
        phone_number varchar(50),
        founded_year varchar(4),
        certifications text,
        services text,
        business_hours text, -- JSON format
        social_profiles text, -- JSON format
        map_location text, -- JSON format
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

/**
 * Create the custom table for opportunities upon plugin activation.
 */
function jpbd_create_opportunities_table()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_opportunities';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        job_title varchar(255) NOT NULL,
        industry varchar(100) DEFAULT '' NOT NULL,
        job_type varchar(50) DEFAULT '' NOT NULL,
        workplace varchar(50) DEFAULT '' NOT NULL,
        views_count int(11) DEFAULT 0 NOT NULL,
        location varchar(255) DEFAULT '' NOT NULL,
        salary_currency char(3) DEFAULT 'USD' NOT NULL,
        salary_amount varchar(100) DEFAULT '' NOT NULL,
        salary_type varchar(50) DEFAULT 'Hourly' NOT NULL,
        job_details text NOT NULL,
        responsibilities text,
        qualifications text,
        skills text,
        experience varchar(100),
        education_level varchar(100),
        vacancy_status varchar(50) DEFAULT 'open' NOT NULL,
        publish_date date,
        end_date date,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
// 2. Deactivation Hook: Combines all deactivation tasks.
function jpbd_deactivate_plugin()
{
    // প্লাগইন ডিঅ্যাক্টিভেট করার সময় রোলগুলো মুছে ফেলা
    remove_role('employer');
    remove_role('candidate');
    remove_role('business');

    // অ্যাডমিনের কাছ থেকে ক্ষমতা সরিয়ে নেওয়া
    $admin_role = get_role('administrator');
    if ($admin_role) {
        $admin_role->remove_cap('create_opportunities');
    }

    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'jpbd_deactivate_plugin');


/**
 * Add custom rewrite rules. This needs to run on every page load.
 */
function jpbd_add_rewrite_rules_on_init()
{
    $page_slug = 'job-portal'; // The slug of the page where your shortcode is.
    add_rewrite_rule(
        '^' . $page_slug . '/(.*)?$',
        'index.php?pagename=' . $page_slug,
        'top'
    );
}
add_action('init', 'jpbd_add_rewrite_rules_on_init');


/**
 * Main instance of the plugin.
 * @return Job_Portal_Main
 */
function JPBD_Main()
{
    return Job_Portal_Main::instance();
}

// Get the plugin running.
JPBD_Main();
