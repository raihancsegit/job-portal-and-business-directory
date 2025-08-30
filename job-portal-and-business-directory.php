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
 * Activation hook: Fires when the plugin is activated.
 */
function jpbd_plugin_activation()
{
    // Add custom user role
    add_role(
        'job_seeker', // Role slug
        'Job Seeker', // Display name
        [
            'read'         => true,  // Can read posts
            'edit_posts'   => false, // Cannot edit posts
            'delete_posts' => false, // Cannot delete posts
            // ভবিষ্যতে এখানে আরও capability যোগ করা যেতে পারে
        ]
    );
}
register_activation_hook(__FILE__, 'jpbd_plugin_activation');

/**
 * Deactivation hook: Fires when the plugin is deactivated.
 */
function jpbd_plugin_deactivation()
{
    // Remove custom user role to clean up
    remove_role('job_seeker');
}
register_deactivation_hook(__FILE__, 'jpbd_plugin_deactivation');

/**
 * Main instance of the plugin.
 *
 * @return Job_Portal_Main
 */
function JPBD_Main()
{
    return Job_Portal_Main::instance();
}

// Get the plugin running.
JPBD_Main();
