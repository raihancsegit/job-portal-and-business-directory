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

if (!defined('JPBD_PLUGIN_DIR')) {
    define('JPBD_PLUGIN_DIR', plugin_dir_path(__FILE__));
}

if (!defined('JPBD_PLUGIN_URL')) {
    define('JPBD_PLUGIN_URL', plugin_dir_url(__FILE__));
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
    jpbd_create_chat_tables();
    jpbd_create_notifications_table();
    jpbd_create_business_reviews_table();
    jpbd_create_saved_items_table();
}
register_activation_hook(__FILE__, 'jpbd_activate_plugin');


function jpbd_create_saved_items_table()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_saved_items';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        item_id mediumint(9) NOT NULL,
        item_type varchar(50) NOT NULL, -- 'opportunity' or 'business'
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY user_item (user_id, item_id, item_type), -- একজন ইউজার একটি আইটেম একবারই সেভ করতে পারবে
        KEY user_id (user_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

function jpbd_create_business_reviews_table()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_business_reviews';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        business_id mediumint(9) NOT NULL,
        user_id bigint(20) UNSIGNED NOT NULL,
        rating tinyint(1) NOT NULL, -- 1 to 5
        review_text text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (id),
        KEY business_id (business_id),
        KEY user_id (user_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

function jpbd_create_notifications_table()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_notifications';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL, -- যার জন্য নোটিফিকেশন
        sender_id bigint(20) UNSIGNED DEFAULT NULL, -- কে পাঠিয়েছে (ঐচ্ছিক)
        type varchar(50) NOT NULL, -- e.g., 'new_message', 'new_application'
        message text NOT NULL,
        link varchar(255), -- নোটিফিকেশনে ক্লিক করলে কোথায় যাবে
        is_read tinyint(1) DEFAULT 0 NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY is_read (is_read)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
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

function jpbd_create_chat_tables()
{
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Conversations Table
    $conv_table = $wpdb->prefix . 'jpbd_chat_conversations';
    $sql_conv = "CREATE TABLE $conv_table (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user1_id bigint(20) UNSIGNED NOT NULL,
        user2_id bigint(20) UNSIGNED NOT NULL,
        last_message_id bigint(20) DEFAULT NULL,
        user1_unread_count int(11) DEFAULT 0 NOT NULL,
        user2_unread_count int(11) DEFAULT 0 NOT NULL,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY user_pair (user1_id, user2_id),
        KEY user1_id (user1_id),
        KEY user2_id (user2_id)
    ) $charset_collate;";

    // Messages Table
    $msg_table = $wpdb->prefix . 'jpbd_chat_messages';
    $sql_msg = "CREATE TABLE $msg_table (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        conversation_id bigint(20) NOT NULL,
        sender_id bigint(20) UNSIGNED NOT NULL,
        receiver_id bigint(20) UNSIGNED NOT NULL,
        message text NOT NULL,
        is_read tinyint(1) DEFAULT 0 NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (id),
        KEY conversation_id (conversation_id),
        KEY sender_id (sender_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql_conv);
    dbDelta($sql_msg);
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


function jpbd_create_notification($user_id, $sender_id, $type, $message, $link)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'jpbd_notifications';

    $wpdb->insert($table_name, [
        'user_id' => $user_id,
        'sender_id' => $sender_id,
        'type' => $type,
        'message' => $message,
        'link' => $link,
    ]);

    $notification_id = $wpdb->insert_id;

    try {
        $pusher = new Pusher\Pusher(
            PUSHER_APP_KEY,
            PUSHER_APP_SECRET,
            PUSHER_APP_ID,
            ['cluster' => PUSHER_APP_CLUSTER]
        );

        // প্রতিটি ইউজারের জন্য একটি প্রাইভেট চ্যানেল থাকবে, যেমন: private-notifications-USERID
        $channel_name = 'private-notifications-' . $user_id;
        $event_name = 'new-notification';

        // নোটিফিকেশন অবজেক্টটি পুনরায় আনা, কারণ আমাদের ফরম্যাট করা ডেটা পাঠাতে হবে
        $notification_obj = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $notification_id));

        // React অ্যাপে পাঠানোর জন্য ডেটা ফরম্যাট করা
        $data_to_push = format_notification_response($notification_obj);

        $pusher->trigger($channel_name, $event_name, $data_to_push);
    } catch (Exception $e) {
        // এরর হলে লগ করা, কিন্তু অ্যাপ ক্র্যাশ না করা
        error_log('Pusher Notification Error: ' . $e->getMessage());
    }
}

function jpbd_custom_avatar_filter($args, $id_or_email)
{
    $user_id = 0;
    if (is_numeric($id_or_email)) {
        $user_id = (int) $id_or_email;
    } elseif (is_object($id_or_email) && isset($id_or_email->user_id)) {
        $user_id = (int) $id_or_email->user_id;
    } elseif (is_string($id_or_email) && ($user = get_user_by('email', $id_or_email))) {
        $user_id = $user->ID;
    }

    if ($user_id === 0) {
        return $args;
    }

    // Check if the user has our custom profile picture meta
    $attachment_id = get_user_meta($user_id, 'jpbd_profile_picture_id', true);

    if ($attachment_id) {
        // Get the URL of the attachment
        $image_url = wp_get_attachment_url($attachment_id);
        if ($image_url) {
            $args['url'] = $image_url;
            $args['found_avatar'] = true; // Tell WordPress we found a custom avatar
        }
    }

    return $args;
}
add_filter('get_avatar_data', 'jpbd_custom_avatar_filter', 10, 2);

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
