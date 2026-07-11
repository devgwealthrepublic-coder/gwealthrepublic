/**
 * GWealth Nation - Blog Anti-Spam & Single Post Formatting Script
 */

// ==========================================
// 1. ANTI-SPAM MEASURES
// ==========================================

// Disable XML-RPC (Blocks major automated spam and brute force attacks)
add_filter('xmlrpc_enabled', '__return_false');

// Remove XML-RPC headers
add_filter('wp_headers', function($headers) {
    unset($headers['X-Pingback']);
    return $headers;
});

// Enforce Referrer Check for Comments (Blocks bots hitting wp-comments-post.php directly)
add_action('check_comment_flood', 'gw_enforce_comment_referrer');
function gw_enforce_comment_referrer() {
    if (!isset($_SERVER['HTTP_REFERER']) || strpos($_SERVER['HTTP_REFERER'], home_url()) === false) {
        wp_die('Error: Direct comment posting is not allowed for security reasons.');
    }
}

// Automatically mark comments with 2 or more links as spam
add_filter('pre_comment_approved', 'gw_strict_link_spam_check', 99, 2);
function gw_strict_link_spam_check($approved, $commentdata) {
    if ($approved === 'spam' || $approved === 'trash') {
        return $approved;
    }
    
    $link_count = preg_match_all('/<a\s[^>]*href=["\'][^"\']+["\']/i', $commentdata['comment_content'], $matches);
    $url_count = preg_match_all('/(http|https):\/\//i', $commentdata['comment_content'], $matches);
    
    if ($link_count >= 2 || $url_count >= 2) {
        return 'spam';
    }
    return $approved;
}

// Remove Website URL field from the comment form
add_filter('comment_form_default_fields', 'gw_remove_website_field_from_comments');
function gw_remove_website_field_from_comments($fields) {
    if (isset($fields['url'])) {
        unset($fields['url']);
    }
    return $fields;
}

// ==========================================
// 2. CONTENT FORMATTING MEASURES & HERO INJECTION
// ==========================================

// Ensure WordPress doesn't strip out custom HTML structure
add_action('init', 'gw_allow_custom_html_in_posts');
function gw_allow_custom_html_in_posts() {
    global $allowedposttags;
    
    $allowedposttags['div'] = array('class' => array(), 'id' => array(), 'style' => array(), 'data-*' => array());
    $allowedposttags['style'] = array('scoped' => array());
    $allowedposttags['span'] = array('class' => array(), 'style' => array());
}

// Wrap all YouTube/Vimeo embeds in a responsive container
add_filter('embed_oembed_html', 'gw_responsive_video_embeds', 10, 3);
function gw_responsive_video_embeds($html, $url, $attr) {
    if (strpos($html, '<iframe') !== false) {
        return '<div class="gw-responsive-embed" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:4px; margin:40px 0;">' . 
               str_replace('<iframe', '<iframe style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"', $html) . 
               '</div>';
    }
    return $html;
}

// INJECT PREMIUM HERO SECTION AND WRAP CONTENT
add_filter('the_content', 'gw_premium_single_post_layout');
function gw_premium_single_post_layout($content) {
    // Only run on single blog posts, in the main loop
    if (!is_singular('post') || !in_the_loop() || !is_main_query()) {
        return $content;
    }

    global $post;
    
    // Get Meta Data
    $author_id = $post->post_author;
    $author_name = get_the_author_meta('display_name', $author_id);
    $date = get_the_date('F j, Y');
    $title = get_the_title();
    
    // Featured Image with fallback
    $image_url = get_the_post_thumbnail_url($post->ID, 'full');
    if (!$image_url) {
        $image_url = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80';
    }

    // Category
    $categories = get_the_category();
    $category_name = !empty($categories) ? esc_html($categories[0]->name) : 'News';

    // Construct the Hero HTML
    $hero_html = '
    <div class="gw-single-hero">
        <div class="gw-single-hero-bg" style="background-image: url(\''.esc_url($image_url).'\');">
            <div class="gw-single-hero-overlay"></div>
        </div>
        <div class="gw-single-hero-content">
            <span class="gw-single-badge">'.$category_name.'</span>
            <h1 class="gw-single-title">'.$title.'</h1>
            <div class="gw-single-meta">
                <span class="gw-author">By '.$author_name.'</span>
                <span class="gw-dot">&bull;</span>
                <span class="gw-date">'.$date.'</span>
            </div>
        </div>
    </div>';

    // Wrap the post content
    $wrapped_content = '<div class="gw-single-content-wrapper">' . $content . '</div>';

    return $hero_html . $wrapped_content;
}
