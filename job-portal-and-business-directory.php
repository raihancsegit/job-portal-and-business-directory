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

    remove_role('job_seeker');
    // Task A: Add custom user role
    add_role(
        'job_seeker',
        'Job Seeker',
        [
            'read' => true,
            'create_opportunities'   => true,
        ]
    );

    jpbd_create_opportunities_table();

    $admin_role = get_role('administrator');
    if ($admin_role) {
        $admin_role->add_cap('create_opportunities', true);
    }

    // Task B: Add rewrite rules and flush them
    jpbd_add_rewrite_rules_on_init(); // Define rules
    flush_rewrite_rules();           // Save them to the database
}
register_activation_hook(__FILE__, 'jpbd_activate_plugin');

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
    // Task A: Remove custom user role
    remove_role('job_seeker');

    // Task B: Flush rewrite rules to remove our custom rule
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
