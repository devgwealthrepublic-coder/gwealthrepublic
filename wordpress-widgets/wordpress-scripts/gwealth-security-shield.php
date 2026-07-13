<?php


if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

if ( ! class_exists( 'GWealth_Security_Shield' ) ) {

    class GWealth_Security_Shield {

        public function __construct() {
            // 1. XML-RPC Block
            add_filter( 'xmlrpc_enabled', '__return_false' );
            add_filter( 'wp_headers', array( $this, 'remove_x_pingback_header' ) );
            add_action( 'init', array( $this, 'block_xmlrpc_requests' ), 0 );

            // 2. Anti-User Enumeration
            add_action( 'init', array( $this, 'block_author_scans' ), 0 );
            add_filter( 'rest_endpoints', array( $this, 'disable_rest_users_endpoint' ) );

            // 3. Header Sanitization (Information Disclosure Shield)
            remove_action( 'wp_head', 'wp_generator' );
            add_filter( 'the_generator', '__return_empty_string' );
            add_filter( 'style_loader_src', array( $this, 'remove_version_query_strings' ), 10, 2 );
            add_filter( 'script_loader_src', array( $this, 'remove_version_query_strings' ), 10, 2 );

            // 4. Login System Protection
            add_filter( 'login_errors', array( $this, 'obfuscate_login_errors' ) );

            // 5. Request URI & Query Malware Blocker
            add_action( 'init', array( $this, 'block_malicious_queries' ), 0 );
        }

        /**
         * 1. Remove X-Pingback Header
         */
        public function remove_x_pingback_header( $headers ) {
            unset( $headers['X-Pingback'] );
            return $headers;
        }

        /**
         * 1. Hard Block XML-RPC Requests
         */
        public function block_xmlrpc_requests() {
            if ( defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST ) {
                header( 'HTTP/1.1 403 Forbidden' );
                die( 'XML-RPC is disabled.' );
            }
        }

        /**
         * 2. Block ?author=1 Enumeration Scans
         */
        public function block_author_scans() {
            if ( ! is_admin() && isset( $_REQUEST['author'] ) ) {
                wp_redirect( home_url(), 301 );
                exit;
            }
        }

        /**
         * 2. Disable /wp-json/wp/v2/users endpoint for non-admins
         */
        public function disable_rest_users_endpoint( $endpoints ) {
            if ( isset( $endpoints['/wp/v2/users'] ) ) {
                if ( ! current_user_can( 'list_users' ) ) {
                    unset( $endpoints['/wp/v2/users'] );
                }
            }
            if ( isset( $endpoints['/wp/v2/users/(?P<id>[\d]+)'] ) ) {
                if ( ! current_user_can( 'list_users' ) ) {
                    unset( $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
                }
            }
            return $endpoints;
        }

        /**
         * 3. Remove ?ver= query strings from CSS/JS
         */
        public function remove_version_query_strings( $src, $handle ) {
            if ( strpos( $src, 'ver=' ) ) {
                $src = remove_query_arg( 'ver', $src );
            }
            return $src;
        }

        /**
         * 4. Obfuscate Login Errors
         */
        public function obfuscate_login_errors( $error ) {
            return '<strong>ERROR</strong>: Incorrect login credentials.';
        }

        /**
         * 5. Block Malicious Queries & URI Patterns
         */
        public function block_malicious_queries() {
            $request_uri = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
            $query_string = isset( $_SERVER['QUERY_STRING'] ) ? $_SERVER['QUERY_STRING'] : '';
            
            $malicious_patterns = array(
                '/(?:<|%3C)script(?:>|%3E)/i',          // <script> tags
                '/union\s+select/i',                    // SQLi Union Select
                '/base64_decode\(/i',                   // Base64 execution
                '/proc\/self\/environ/i',               // LFI proc environ
                '/\.\.\//',                             // Directory traversal
                '/eval\(/i',                            // Eval execution
                '/CONCAT\(/i',                          // SQLi Concat
                '/wp-config\.php/i'                     // Direct wp-config access attempts
            );

            foreach ( $malicious_patterns as $pattern ) {
                if ( preg_match( $pattern, $request_uri ) || preg_match( $pattern, $query_string ) ) {
                    header( 'HTTP/1.1 403 Forbidden' );
                    die( 'Forbidden Request.' );
                }
            }
        }
    }

    // Initialize the Security Shield
    new GWealth_Security_Shield();
}
