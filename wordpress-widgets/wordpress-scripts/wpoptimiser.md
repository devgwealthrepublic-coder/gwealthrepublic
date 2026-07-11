"; echo "
🚀 GWealth WordPress Optimizer
"; echo "
"; global $wpdb; // 1. Delete all Post Revisions (Massive DB Bloat) $revisions = $wpdb->query( "DELETE FROM $wpdb->posts WHERE post_type = 'revision'" ); echo "
✅ Post Revisions: Deleted " . (int)$revisions . " old revisions to shrink the database.
"; // 2. Delete Auto-Drafts and Trashed Posts $drafts = $wpdb->query( "DELETE FROM $wpdb->posts WHERE post_status = 'auto-draft' OR post_status = 'trash'" ); echo "
✅ Drafts & Trash: Cleared " . (int)$drafts . " auto-drafts and trashed items.
"; // 3. Clear all Transients (Temporary cached DB queries) $transients = $wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE '\_transient\_%'" ); $transients_timeout = $wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE '\_site\_transient\_%'" ); echo "
✅ Database Transients: Flushed " . ((int)$transients + (int)$transients_timeout) . " expired database cache items.
"; // 4. Delete Spam & Trashed Comments $comments = $wpdb->query( "DELETE FROM $wpdb->comments WHERE comment_approved = 'trash' OR comment_approved = 'spam'" ); echo "
✅ Comments: Removed " . (int)$comments . " spam/trashed comments.
"; // 5. Clean Orphaned Post Meta (Data left behind when posts are deleted) $orphaned_meta = $wpdb->query( "DELETE pm FROM $wpdb->postmeta pm LEFT JOIN $wpdb->posts wp ON wp.ID = pm.post_id WHERE wp.ID IS NULL" ); echo "
✅ Orphaned Meta: Cleaned " . (int)$orphaned_meta . " orphaned metadata rows.
"; // 6. Flush WordPress Object Cache if ( function_exists( 'wp_cache_flush' ) ) { wp_cache_flush(); echo "
✅ Object Cache: Core WordPress object cache flushed successfully.
"; } // 7. Try to Flush Popular Caching Plugins // LiteSpeed Cache if ( class_exists( 'LiteSpeed\Purge' ) ) { LiteSpeed\Purge::purge_all(); echo "
✅ LiteSpeed: Cache purged successfully.
"; } // WP Rocket if ( function_exists( 'rocket_clean_domain' ) ) { rocket_clean_domain(); echo "
✅ WP Rocket: Domain cache cleared successfully.
"; } // W3 Total Cache if ( function_exists( 'w3tc_flush_all' ) ) { w3tc_flush_all(); echo "
✅ W3 Total Cache: Flushed completely.
"; } // WP Super Cache if ( function_exists( 'wp_cache_clear_cache' ) ) { wp_cache_clear_cache(); echo "
✅ WP Super Cache: Cleared successfully.
"; } echo "
"; echo "
"; echo "🎉 Optimization Complete! Your site should now load significantly faster."; echo "
"; echo "
"; echo "⚠️ SECURITY WARNING: Please delete this file (wp-optimizer.php) from your server immediately so visitors cannot run it!"; echo "
"; echo ""; ?>