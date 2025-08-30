<?php

/**
 * Plugin Name:       Job Portal and Business Directory
 * Description:       A modern job portal and business directory plugin powered by React.
 * Version:           1.0.0
 * Author:            Your Name
 * License:           GPL v2 or later
 * Text Domain:       jpbd
 */

if (!defined('ABSPATH')) exit;

// Constants
define('JPBD_URL', plugin_dir_url(__FILE__));
define('JPBD_PATH', plugin_dir_path(__FILE__));

// ====================================================================
// Include API Files
// ====================================================================
require_once JPBD_PATH . 'includes/api/auth-routes.php';

function jpbd_enqueue_react_app_assets()
{
    if (is_singular() && has_shortcode(get_post()->post_content, 'job_portal_app')) {

        // CSS Files
        wp_enqueue_style('jpbd-pretendard-font', 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        wp_enqueue_style('jpbd-bootstrap', plugin_dir_url(__FILE__) . 'assets/css/bootstrap.min.css');
        wp_enqueue_style('jpbd-remixicon', plugin_dir_url(__FILE__) . 'assets/css/remixicon.css');
        wp_enqueue_style('jpbd-main-style', plugin_dir_url(__FILE__) . 'assets/css/main.css');
        wp_enqueue_style('jpbd-template-overrides', plugin_dir_url(__FILE__) . 'template/template-overrides.css', ['jpbd-main-style']);

        // Other JS Files
        wp_enqueue_script('jpbd-jquery', plugin_dir_url(__FILE__) . 'assets/js/jquery-3.7.0.min.js', [], null, true);
        wp_enqueue_script('jpbd-bootstrap-bundle', plugin_dir_url(__FILE__) . 'assets/js/bootstrap.bundle.min.js', ['jpbd-jquery'], null, true);
        wp_enqueue_script('jpbd-app', plugin_dir_url(__FILE__) . 'assets/js/app.js', ['jpbd-jquery'], null, true);

        // React App
        $script_handle = 'jpbd-react-app';
        // THE FIX: Changed 'build/' to 'dist/'
        $react_app_dist_url = plugin_dir_url(__FILE__) . 'react-app/dist/';
        // THE FIX: Changed 'build/' to 'dist/'
        $manifest_path = plugin_dir_path(__FILE__) . 'react-app/dist/.vite/manifest.json';

        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            $js_entry_key = 'src/main.jsx';

            if (isset($manifest[$js_entry_key])) {
                $entry = $manifest[$js_entry_key];

                wp_enqueue_script($script_handle, $react_app_dist_url . $entry['file'], ['jpbd-jquery', 'jpbd-bootstrap-bundle'], null, true);

                if (isset($entry['css'])) {
                    foreach ($entry['css'] as $index => $css_file) {
                        wp_enqueue_style($script_handle . '-css-' . $index, $react_app_dist_url . $css_file);
                    }
                }

                wp_localize_script($script_handle, 'jpbd_object', [
                    'assets_url'     => plugin_dir_url(__FILE__) . 'assets/',
                    'root_url'       => home_url(),
                    'api_base_url'   => rest_url('jpbd/v1/'),
                    'nonce'          => wp_create_nonce('wp_rest')
                ]);
            }
        } else {
            wp_die('React app manifest.json not found. Please run "npm run build" in the react-app directory. (Checked path: ' . $manifest_path . ')');
        }
    }
}
add_action('wp_enqueue_scripts', 'jpbd_enqueue_react_app_assets');


function jpbd_react_app_shortcode()
{
    return '<div id="root"></div>';
}
add_shortcode('job_portal_app', 'jpbd_react_app_shortcode');

// ====================================================================
// Register the custom page template from within the plugin
// ====================================================================

add_filter('theme_page_templates', 'jpbd_add_plugin_page_template', 10, 1);
function jpbd_add_plugin_page_template($templates)
{
    $templates['page-template-blank.php'] = __('Blank Template for React App', 'jpbd');
    return $templates;
}

add_filter('template_include', 'jpbd_load_plugin_page_template', 99, 1);
function jpbd_load_plugin_page_template($template)
{
    if (get_page_template_slug() === 'page-template-blank.php') {
        $template_path = plugin_dir_path(__FILE__) . 'page-template-blank.php';
        if (file_exists($template_path)) {
            return $template_path;
        }
    }
    return $template;
}
