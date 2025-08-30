<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main Plugin Class
 */
final class Job_Portal_Main
{

    private static $_instance = null;

    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function __construct()
    {
        $this->define_constants();
        $this->includes();
        $this->init_hooks();
    }

    private function define_constants()
    {
        define('JPBD_PATH', plugin_dir_path(dirname(__FILE__)));
        define('JPBD_URL', plugin_dir_url(dirname(__FILE__)));
        define('JPBD_VERSION', '1.0.0');
    }

    private function includes()
    {
        require_once JPBD_PATH . 'includes/api/auth-routes.php';
        require_once JPBD_PATH . 'includes/api/settings-routes.php';
    }

    private function init_hooks()
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('init', [$this, 'register_shortcode']);
        add_filter('theme_page_templates', [$this, 'add_plugin_page_template'], 10, 1);
        add_filter('template_include', [$this, 'load_plugin_page_template'], 99, 1);
    }

    public function enqueue_assets()
    {
        if (is_singular() && has_shortcode(get_post()->post_content, 'job_portal_app')) {

            // CSS Files
            wp_enqueue_style('jpbd-pretendard-font', 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
            wp_enqueue_style('jpbd-bootstrap', JPBD_URL . 'assets/css/bootstrap.min.css');
            wp_enqueue_style('jpbd-remixicon', JPBD_URL . 'assets/css/remixicon.css');
            wp_enqueue_style('jpbd-main-style', JPBD_URL . 'assets/css/main.css');
            wp_enqueue_style('jpbd-template-overrides', JPBD_URL . 'template/template-overrides.css', ['jpbd-main-style']);

            // Other JS Files
            wp_enqueue_script('jpbd-jquery', JPBD_URL . 'assets/js/jquery-3.7.0.min.js', [], null, true);
            wp_enqueue_script('jpbd-bootstrap-bundle', JPBD_URL . 'assets/js/bootstrap.bundle.min.js', ['jpbd-jquery'], null, true);
            wp_enqueue_script('jpbd-app', JPBD_URL . 'assets/js/app.js', ['jpbd-jquery'], null, true);

            // React App
            $script_handle = 'jpbd-react-app';
            $build_url = JPBD_URL . 'build/';
            $manifest_path = JPBD_PATH . 'build/.vite/manifest.json';

            if (file_exists($manifest_path)) {
                $manifest = json_decode(file_get_contents($manifest_path), true);
                $entry_key = 'src/main.jsx';

                if (isset($manifest[$entry_key])) {
                    $entry = $manifest[$entry_key];
                    wp_enqueue_script($script_handle, $build_url . $entry['file'], ['jpbd-jquery', 'jpbd-bootstrap-bundle'], null, true);

                    if (isset($entry['css'])) {
                        foreach ($entry['css'] as $css_file) {
                            wp_enqueue_style($script_handle . '-' . basename($css_file), $build_url . $css_file);
                        }
                    }

                    wp_localize_script($script_handle, 'jpbd_object', [
                        'assets_url'     => JPBD_URL . 'assets/',
                        'root_url'       => home_url(),
                        'api_base_url'   => rest_url('jpbd/v1/'),
                        'nonce'          => wp_create_nonce('wp_rest'),
                        'page_slug'      => get_post_field('post_name', get_post()),
                    ]);
                }
            }

            // THIS IS THE FIX for the frontend app
            add_filter('script_loader_tag', function ($tag, $handle, $src) use ($script_handle) {
                if ($script_handle === $handle) {
                    return '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
                }
                return $tag;
            }, 10, 3);
        }
    }

    public function enqueue_admin_assets($hook)
    {
        if ($hook !== 'toplevel_page_jpbd-settings') {
            return;
        }

        wp_enqueue_style(
            'jpbd-admin-styles',
            JPBD_URL . 'react-app/admin/admin-style.css', // সরাসরি সোর্স ফাইল লিঙ্ক করা হলো
            [],
            JPBD_VERSION
        );

        $script_handle = 'jpbd-admin-app';
        $build_url = JPBD_URL . 'build/';
        $manifest_path = JPBD_PATH . 'build/.vite/manifest.json';

        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            $entry_key = 'admin/main.jsx';

            if (isset($manifest[$entry_key])) {
                $entry = $manifest[$entry_key];
                wp_enqueue_script($script_handle, $build_url . $entry['file'], ['wp-element'], JPBD_VERSION, true);

                if (isset($entry['css'])) {
                    foreach ($entry['css'] as $css_file) {
                        wp_enqueue_style($script_handle . '-' . basename($css_file), $build_url . $css_file);
                    }
                }
            }
        }

        // THIS IS THE FIX for the admin app
        add_filter('script_loader_tag', function ($tag, $handle, $src) use ($script_handle) {
            if ($script_handle === $handle) {
                return '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
            }
            return $tag;
        }, 10, 3);
    }

    public function add_admin_menu()
    {
        add_menu_page('JPBD Settings', 'Job Portal', 'manage_options', 'jpbd-settings', [$this, 'render_settings_page'], 'dashicons-businessperson', 25);
    }

    public function render_settings_page()
    {
        echo '<div id="jpbd-settings-app"></div>';
    }

    public function register_shortcode()
    {
        add_shortcode('job_portal_app', [$this, 'render_shortcode']);
    }

    public function render_shortcode()
    {
        return '<div id="root"></div>';
    }

    public function add_plugin_page_template($templates)
    {
        $templates['page-template-blank.php'] = __('Blank Template for React App', 'jpbd');
        return $templates;
    }

    public function load_plugin_page_template($template)
    {
        if (get_page_template_slug() === 'page-template-blank.php') {
            $template_path = JPBD_PATH . 'page-template-blank.php';
            if (file_exists($template_path)) {
                return $template_path;
            }
        }
        return $template;
    }
}
