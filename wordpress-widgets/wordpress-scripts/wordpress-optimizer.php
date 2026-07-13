<?php
/**
 * Title: GWealth Republic Performance Turbo Booster
 * Description: Optimizes page load speeds, de-registers core bloat, defers non-critical JS, and injects DNS prefetching.
 * Setup: Add as a new snippet in WPCode, set Code Type to "PHP Snippet", and choose "Run Everywhere".
 */

// Prevent direct execution outside of WordPress core
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'GWealth_Performance_Turbo' ) ) {

    class GWealth_Performance_Turbo {

        public static function init() {
            // 1. Purge WordPress Header Garbage & Bloat
            add_action( 'init', [ __CLASS__, 'purge_header_bloat' ] );

            // 2. Disable WordPress Emojis (Saves ~100kb of rendering blocking assets)
            add_action( 'init', [ __CLASS__, 'disable_wp_emojis' ] );

            // 3. DNS Prefetching (Pre-resolving third-party assets like Cloudinary)
            add_filter( 'wp_resource_hints', [ __CLASS__, 'inject_dns_prefetch' ], 10, 2 );

            // 4. Asynchronously Load & Defer Non-Critical Scripts (FCP/LCP Optimizer)
            add_filter( 'script_loader_tag', [ __CLASS__, 'defer_non_essential_scripts' ], 10, 2 );

            // 5. Tune and Throttle WordPress Heartbeat API (Conserves Server CPU limits)
            add_action( 'init', [ __CLASS__, 'throttle_wp_heartbeat' ], 1 );

            // 6. Disable XML-RPC Pingback Header (Stops pingback DDoS and reduces header sizes)
            add_filter( 'wp_headers', [ __CLASS__, 'disable_pingbacks' ] );
        }

        /**
         * 1. Remove unnecessary meta links injected by WordPress into the head.
         */
        public static function purge_header_bloat() {
            remove_action( 'wp_head', 'rsd_link' ); // Removes Really Simple Discovery link
            remove_action( 'wp_head', 'wlwmanifest_link' ); // Removes Windows Live Writer manifest
            remove_action( 'wp_head', 'wp_shortlink_wp_head' ); // Removes shortlink tag
            remove_action( 'wp_head', 'rest_output_link_wp_head' ); // Removes REST API link tag
            remove_action( 'wp_head', 'wp_oembed_add_discovery_links' ); // Removes oEmbed discovery links
            remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10 ); // Removes next/prev post links
        }

        /**
         * 2. Completely remove WordPress emoji support scripts and styles.
         */
        public static function disable_wp_emojis() {
            remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
            remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
            remove_action( 'wp_print_styles', 'print_emoji_styles' );
            remove_action( 'admin_print_styles', 'print_emoji_styles' );
            remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
            remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
            remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );

            // Disable TinyMCE emojis if used
            add_filter( 'tiny_mce_plugins', [ __CLASS__, 'disable_tinymce_emojis' ] );
        }

        public static function disable_tinymce_emojis( $plugins ) {
            if ( is_array( $plugins ) ) {
                return array_diff( $plugins, [ 'wpemoji' ] );
            }
            return [];
        }

        /**
         * 3. Inject critical DNS prefetch hints so external domains resolve instantly.
         */
        public static function inject_dns_prefetch( $hints, $relation_type ) {
            if ( 'dns-prefetch' === $relation_type ) {
                // Pre-resolve Google Fonts, FontAwesome, Leaflet, and Cloudinary CDNs
                $hints[] = 'fonts.googleapis.com';
                $hints[] = 'fonts.gstatic.com';
                $hints[] = 'cdnjs.cloudflare.com';
                $hints[] = 'unpkg.com';
                $hints[] = 'res.cloudinary.com';
            }
            return $hints;
        }

        /**
         * 4. Auto-defer non-critical JavaScript to prevent render-blocking warnings.
         */
        public static function defer_non_essential_scripts( $tag, $handle ) {
            // Never defer jQuery core or critical plugins to prevent breaks
            $critical_handles = [
                'jquery-core',
                'jquery',
                'elementor-frontend',
                'wp-emoji'
            ];

            if ( is_admin() || in_array( $handle, $critical_handles, true ) ) {
                return $tag;
            }

            // Defer execution of all other general script files
            return str_replace( ' src', ' defer="defer" src', $tag );
        }

        /**
         * 5. Slow down Heartbeat executions (reduces shared server CPU peaks).
         */
        public static function throttle_wp_heartbeat() {
            global $pagenow;
            
            // Only allow Heartbeat in post editors, disable or slow it down everywhere else
            if ( 'post.php' !== $pagenow && 'post-new.php' !== $pagenow ) {
                wp_deregister_script( 'heartbeat' );
            } else {
                add_filter( 'heartbeat_settings', [ __CLASS__, 'slow_down_heartbeat' ] );
            }
        }

        public static function slow_down_heartbeat( $settings ) {
            $settings['interval'] = 60; // Force heartbeat to run once a minute (default is 15-30s)
            return $settings;
        }

        /**
         * 6. Clean and strip pingback header tags to stop bandwidth wastage.
         */
        public static function disable_pingbacks( $headers ) {
            if ( isset( $headers['X-Pingback'] ) ) {
                unset( $headers['X-Pingback'] );
            }
            return $headers;
        }
    }

    // Bootstrap the performance turbo engine
    GWealth_Performance_Turbo::init();
}