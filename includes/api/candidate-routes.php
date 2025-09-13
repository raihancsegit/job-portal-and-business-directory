<?php
if (!defined('ABSPATH')) exit;

/**
 * Register all candidate profile related API routes.
 */
function jpbd_register_candidate_api_routes()
{
    register_rest_route('jpbd/v1', '/candidate/profile', [
        [
            'methods' => 'GET',
            'callback' => 'jpbd_api_get_candidate_profile',
            'permission_callback' => function () {
                return is_user_logged_in();
            },
        ],
        [
            'methods' => 'POST',
            'callback' => 'jpbd_api_update_candidate_profile',
            'permission_callback' => function () {
                return is_user_logged_in();
            },
        ]
    ]);

    register_rest_route('jpbd/v1', '/candidate/upload-cv', [
        'methods' => 'POST',
        'callback' => 'jpbd_api_upload_candidate_cv',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    register_rest_route('jpbd/v1', '/candidate/(?P<id>\d+)/profile', [
        'methods'  => 'GET',
        'callback' => 'jpbd_api_get_public_candidate_profile',
        'permission_callback' => function () {
            // শুধুমাত্র লগইন করা employer বা admin-রাই প্রোফাইল দেখতে পারবে
            return current_user_can('manage_applications');
        },
        'args' => [
            'id' => [
                'validate_callback' => function ($param) {
                    return is_numeric($param);
                }
            ],
        ],
    ]);
}
add_action('rest_api_init', 'jpbd_register_candidate_api_routes');

/**
 * API: Get candidate-specific profile data.
 */
function jpbd_api_get_candidate_profile()
{
    $user_id = get_current_user_id();
    if (0 === $user_id) {
        return new WP_Error('no_user', 'User not found.', ['status' => 404]);
    }

    $candidate_data = [
        'about' => get_user_meta($user_id, 'jpbd_about', true),
        'skills' => get_user_meta($user_id, 'jpbd_skills', true) ?: [], // Return empty array if not set
        'education' => get_user_meta($user_id, 'jpbd_education', true) ?: [],
        'experience' => get_user_meta($user_id, 'jpbd_experience', true) ?: [],
        'cvs' => get_user_meta($user_id, 'jpbd_cvs', true) ?: [],
    ];

    return new WP_REST_Response($candidate_data, 200);
}

/**
 * API: Update candidate-specific profile data.
 * This version correctly handles arrays for repeater fields.
 */
function jpbd_api_update_candidate_profile(WP_REST_Request $request)
{
    $user_id = get_current_user_id();
    if (0 === $user_id) {
        return new WP_Error('auth_error', 'User not authenticated.', ['status' => 401]);
    }

    $params = $request->get_json_params();

    // Sanitize and update each field
    if (isset($params['about'])) {
        update_user_meta($user_id, 'jpbd_about', sanitize_textarea_field($params['about']));
    }

    // Skills are saved as a single comma-separated string
    if (isset($params['skills'])) {
        update_user_meta($user_id, 'jpbd_skills', sanitize_text_field($params['skills']));
    }

    // Sanitize Education Repeater Data (Array of Objects)
    if (isset($params['education']) && is_array($params['education'])) {
        $sanitized_education = [];
        foreach ($params['education'] as $item) {
            $sanitized_education[] = [
                'institution' => sanitize_text_field($item['institution'] ?? ''),
                'degree'      => sanitize_text_field($item['degree'] ?? ''),
                'startYear'   => sanitize_text_field($item['startYear'] ?? ''),
                'endYear'     => sanitize_text_field($item['endYear'] ?? ''),
                'description' => sanitize_textarea_field($item['description'] ?? ''),
            ];
        }
        update_user_meta($user_id, 'jpbd_education', $sanitized_education);
    }

    // Sanitize Experience Repeater Data (Array of Objects)
    if (isset($params['experience']) && is_array($params['experience'])) {
        $sanitized_experience = [];
        foreach ($params['experience'] as $item) {
            $sanitized_experience[] = [
                'title'       => sanitize_text_field($item['title'] ?? ''),
                'company'     => sanitize_text_field($item['company'] ?? ''),
                'startYear'   => sanitize_text_field($item['startYear'] ?? ''),
                'endYear'     => sanitize_text_field($item['endYear'] ?? ''),
                'location'    => sanitize_text_field($item['location'] ?? ''),
                'description' => sanitize_textarea_field($item['description'] ?? ''),
            ];
        }
        update_user_meta($user_id, 'jpbd_experience', $sanitized_experience);
    }

    // ======================================================
    // ADD THIS BLOCK TO SAVE CV DATA
    // ======================================================
    if (isset($params['cvs']) && is_array($params['cvs'])) {
        $sanitized_cvs = [];
        foreach ($params['cvs'] as $cv) {
            // Only save items that have a name and a file URL
            if (!empty($cv['name']) && !empty($cv['file_url'])) {
                $sanitized_cvs[] = [
                    'name'          => sanitize_text_field($cv['name']),
                    'file_url'      => esc_url_raw($cv['file_url']),
                    'attachment_id' => isset($cv['attachment_id']) ? (int) $cv['attachment_id'] : 0,
                ];
            }
        }
        update_user_meta($user_id, 'jpbd_cvs', $sanitized_cvs);
    }

    return new WP_REST_Response(['success' => true, 'message' => 'Candidate profile updated successfully!'], 200);
}


function jpbd_api_upload_candidate_cv(WP_REST_Request $request)
{
    $user_id = get_current_user_id();
    if (0 === $user_id) {
        return new WP_Error('auth_error', 'User not authenticated.', ['status' => 401]);
    }

    // WordPress-এর ফাইল আপলোড ফাংশনালিটি লোড করা
    if (!function_exists('wp_handle_upload')) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
    }

    $uploadedfile = $_FILES['cv_file']; // React থেকে পাঠানো ফাইলের নাম
    $upload_overrides = ['test_form' => false];

    // ফাইলটি আপলোড এবং WordPress মিডিয়া লাইব্রেরিতে যোগ করা
    $movefile = wp_handle_upload($uploadedfile, $upload_overrides);

    if ($movefile && !isset($movefile['error'])) {
        // ফাইলটি সফলভাবে আপলোড হয়েছে
        $filename = basename($movefile['url']);
        $filetype = wp_check_filetype($filename, null);

        $attachment = [
            'guid'           => $movefile['url'],
            'post_mime_type' => $filetype['type'],
            'post_title'     => preg_replace('/\.[^.]+$/', '', $filename),
            'post_content'   => '',
            'post_status'    => 'inherit'
        ];

        // মিডিয়া লাইব্রেরিতে অ্যাটাচমেন্ট হিসেবে ফাইলটি ইনসার্ট করা
        $attach_id = wp_insert_attachment($attachment, $movefile['file']);

        if (is_wp_error($attach_id)) {
            return new WP_Error('upload_error', $attach_id->get_error_message(), ['status' => 500]);
        }

        // অ্যাটাচমেন্ট মেটাডেটা তৈরি করা
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attach_data = wp_generate_attachment_metadata($attach_id, $movefile['file']);
        wp_update_attachment_metadata($attach_id, $attach_data);

        // React-কে ফাইলের URL এবং ID ফেরত পাঠানো
        return new WP_REST_Response([
            'success' => true,
            'message' => 'File uploaded successfully!',
            'file_url' => $movefile['url'],
            'attachment_id' => $attach_id,
        ], 200);
    } else {
        return new WP_Error('upload_error', $movefile['error'], ['status' => 500]);
    }
}

/**
 * API Callback: Get a specific candidate's profile data by their user ID.
 * This is for employers to view.
 */
function jpbd_api_get_public_candidate_profile(WP_REST_Request $request)
{
    $user_id = (int) $request['id'];

    // WordPress ইউজার অবজেক্ট থেকে বেসিক তথ্য নেওয়া
    $user_data = get_userdata($user_id);
    if (!$user_data) {
        return new WP_Error('not_found', 'Candidate not found.', ['status' => 404]);
    }

    // ক্যান্ডিডেটের প্রোফাইল ডেটা তৈরি করা
    $profile_data = [
        'user_info' => [
            'id' => $user_data->ID,
            'name' => $user_data->display_name ?: ($user_data->first_name . ' ' . $user_data->last_name),
            'email' => $user_data->user_email,
            'avatar' => get_avatar_url($user_data->ID, ['size' => 96]),
            // আরও তথ্য যোগ করা যেতে পারে, যেমন location, phone ইত্যাদি user meta থেকে

            'location' => get_user_meta($user_id, 'city', true) . ', ' . get_user_meta($user_id, 'country', true),
            'phone' => get_user_meta($user_id, 'phone_code', true) . get_user_meta($user_id, 'phone_number', true),
        ],
        'profile_details' => [
            'about'      => get_user_meta($user_id, 'jpbd_about', true),
            'skills'     => get_user_meta($user_id, 'jpbd_skills', true) ?: '',
            'education'  => get_user_meta($user_id, 'jpbd_education', true) ?: [],
            'experience' => get_user_meta($user_id, 'jpbd_experience', true) ?: [],
            'cvs'        => get_user_meta($user_id, 'jpbd_cvs', true) ?: [],
        ],
    ];

    // যদি city এবং country দুটোই খালি থাকে, তাহলে location খালি স্ট্রিং হিসেবে পাঠানো
    if (trim($profile_data['user_info']['location']) === ',') {
        $profile_data['user_info']['location'] = '';
    }

    return new WP_REST_Response($profile_data, 200);
}
