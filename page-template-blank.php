<?php

/**
 * Template Name: Blank Template for React App
 *
 * This is a blank page template that loads only the essential WordPress
 * header and footer functions, allowing a full-width React app to take over.
 */

// We don't call get_header() to avoid loading the theme's header.
// Instead, we directly call wp_head() to ensure essential scripts and styles are loaded.
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); // Crucial for loading enqueued scripts and styles 
    ?>
</head>

<body <?php body_class('full-width-app'); ?>>

    <?php
    // The WordPress loop to display page content (our shortcode)
    if (have_posts()) {
        while (have_posts()) {
            the_post();
            the_content();
        }
    }
    ?>

    <?php wp_footer(); // Crucial for loading enqueued scripts in the footer 
    ?>
</body>

</html>