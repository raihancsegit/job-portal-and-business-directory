<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main Plugin Class
 *
 * @since 1.0.0
 */
final class Job_Portal_Main
{

    /**
     * The single instance of the class.
     * @var Job_Portal_Main|null
     */
    private static $_instance = null;

    /**
     * Main Instance.
     * Ensures only one instance of the main class is loaded.
     * @return Job_Portal_Main
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->define_constants();
        $this->includes();
        $this->init_hooks();
    }

    /**
     * Define Plugin Constants.
     */
    private function define_constants()
    {
        // dirname(__FILE__) = /includes folder, so we need one level up for the plugin root.
        define('JPBD_PATH', plugin_dir_path(dirname(__FILE__)));
        define('JPBD_URL', plugin_dir_url(dirname(__FILE__)));
        define('JPBD_VERSION', '1.0.0');
    }

    /**
     * Include required files.
     */
    private function includes()
    {
        require_once JPBD_PATH . 'includes/api/auth-routes.php';
    }

    /**
     * Initialize all hooks.
     */
    private function init_hooks()
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('init', [$this, 'register_shortcode']);
        add_filter('theme_page_templates', [$this, 'add_plugin_page_template'], 10, 1);
        add_filter('template_include', [$this, 'load_plugin_page_template'], 99, 1);
    }

    /**
     * Enqueue all scripts and styles for the plugin.
     */
    public function enqueue_assets()
    {
        if (is_singular() && has_shortcode(get_post()->post_content, 'job_portal_app')) {

            // CSS Files
            wp_enqueue_style('jpbd-pretendard-font', 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
            wp_enqueue_style('jpbd-bootstrap', JPBD_URL . 'assets/css/bootstrap.min.css');
            wp_enqueue_style('jpbd-remixicon', JPBD_URL . 'assets/css/remixicon.css');
            wp_enqueue_style('jpbd-main-style', JPBD_URL . 'assets/css/main.css');
            wp_enqueue_style('jpbd-template-overrides', JPBD_URL . 'template/template-overrides.css', ['jpbd-main-style']);

            // Other JS Files (before React)
            wp_enqueue_script('jpbd-jquery', JPBD_URL . 'assets/js/jquery-3.7.0.min.js', [], null, true);
            wp_enqueue_script('jpbd-bootstrap-bundle', JPBD_URL . 'assets/js/bootstrap.bundle.min.js', ['jpbd-jquery'], null, true);
            wp_enqueue_script('jpbd-app', JPBD_URL . 'assets/js/app.js', ['jpbd-jquery'], null, true);

            // React App
            $script_handle = 'jpbd-react-app';
            $react_app_dist_url = JPBD_URL . 'react-app/dist/';
            $manifest_path = JPBD_PATH . 'react-app/dist/.vite/manifest.json';

            if (file_exists($manifest_path)) {
                $manifest = json_decode(file_get_contents($manifest_path), true);
                $js_entry_key = 'src/main.jsx';

                if (isset($manifest[$js_entry_key])) {
                    $entry = $manifest[$js_entry_key];

                    wp_enqueue_script($script_handle, $react_app_dist_url . $entry['file'], ['jpbd-jquery', 'jpbd-bootstrap-bundle'], null, true);

                    if (isset($entry['css'])) {
                        foreach ($entry['css'] as $css_file) {
                            wp_enqueue_style($script_handle . '-' . basename($css_file), $react_app_dist_url . $css_file);
                        }
                    }

                    wp_localize_script($script_handle, 'jpbd_object', [
                        'assets_url'     => JPBD_URL . 'assets/',
                        'root_url'       => home_url(),
                        'api_base_url'   => rest_url('jpbd/v1/'),
                        'nonce'          => wp_create_nonce('wp_rest'),
                        'page_slug'      => get_post_field('post_name', get_post()), // নতুন লাইন
                    ]);
                }
            } else {
                wp_die('React app manifest.json not found. Please run "npm run build" in the react-app directory. (Checked path: ' . $manifest_path . ')');
            }
        }
    }

    /**
     * Register the shortcode for the React app.
     */
    public function register_shortcode()
    {
        add_shortcode('job_portal_app', [$this, 'render_shortcode']);
    }

    /**
     * Render the shortcode output.
     * @return string
     */
    public function render_shortcode()
    {
        return '<div id="root"></div>';
    }

    /**
     * Add the custom page template to the list of available templates.
     * @param array $templates
     * @return array
     */
    public function add_plugin_page_template($templates)
    {
        $templates['page-template-blank.php'] = __('Blank Template for React App', 'jpbd');
        return $templates;
    }

    /**
     * Load the custom page template from the plugin directory.
     * @param string $template
     * @return string
     */
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
