-- Table structure for table `activity_logs`
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` bigint unsigned DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `properties` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_user_id_action_index` (`user_id`,`action`),
  KEY `activity_logs_target_type_target_id_index` (`target_type`,`target_id`),
  KEY `activity_logs_created_at_index` (`created_at`),
  KEY `activity_logs_action_index` (`action`),
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `activity_logs`
INSERT INTO `activity_logs` VALUES
(1, NULL, 'user_created', 'App\\Models\\User', 2, 'User Mohammad Abdul Abdul Mannan account created', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '{\"role\": null, \"email\": \"mdmannan580@gmail.com\", \"created_by\": null}', '2026-03-13 18:19:17', '2026-03-13 18:19:17'),
(2, 2, 'user_logout', 'App\\Models\\User', 2, 'User Mohammad Abdul Abdul Mannan logged out', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '{\"role\": \"user\", \"email\": \"mdmannan580@gmail.com\"}', '2026-03-13 18:25:43', '2026-03-13 18:25:43'),
(3, 1, 'user_login', 'App\\Models\\User', 1, 'User Super Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '{\"role\": \"super_admin\", \"email\": \"admin@cashmanagement.com\", \"login_method\": \"email\"}', '2026-03-13 18:27:20', '2026-03-13 18:27:20'),
(4, 2, 'user_login', 'App\\Models\\User', 2, 'User Mohammad Abdul Abdul Mannan logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '{\"role\": \"super_admin\", \"email\": \"mdmannan580@gmail.com\", \"login_method\": \"email\"}', '2026-03-13 18:30:26', '2026-03-13 18:30:26'),
(5, 2, 'user_logout', 'App\\Models\\User', 2, 'User Mohammad Abdul Abdul Mannan logged out', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '{\"role\": \"user\", \"email\": \"mdmannan580@gmail.com\"}', '2026-03-13 19:31:44', '2026-03-13 19:31:44'),
(6, 2, 'user_login', 'App\\Models\\User', 2, 'User Mohammad Abdul Abdul Mannan logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '{\"role\": \"user\", \"email\": \"mdmannan580@gmail.com\", \"login_method\": \"email\"}', '2026-03-13 19:31:54', '2026-03-13 19:31:54'),
(7, 2, 'user_login', 'App\\Models\\User', 2, 'User Mohammad Abdul Abdul Mannan logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '{\"role\": \"user\", \"email\": \"mdmannan580@gmail.com\", \"login_method\": \"email\"}', '2026-03-14 10:36:34', '2026-03-14 10:36:34'),
(8, 2, 'user_login', 'App\\Models\\User', 2, 'User Mohammad Abdul Abdul Mannan logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '{\"role\": \"user\", \"email\": \"mdmannan580@gmail.com\", \"login_method\": \"email\"}', '2026-03-17 06:21:15', '2026-03-17 06:21:15'),
(9, 1, 'user_login', 'App\\Models\\User', 1, 'User Super Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '{\"role\": \"super_admin\", \"email\": \"admin@cashmanagement.com\", \"login_method\": \"email\"}', '2026-03-17 06:44:00', '2026-03-17 06:44:00'),
(10, 1, 'user_login', 'App\\Models\\User', 1, 'User Super Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '{\"role\": \"super_admin\", \"email\": \"admin@cashmanagement.com\", \"login_method\": \"email\"}', '2026-03-26 16:25:23', '2026-03-26 16:25:23'),
(11, 2, 'user_login', 'App\\Models\\User', 2, 'User Mohammad Abdul Abdul Mannan logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '{\"role\": \"admin\", \"email\": \"mdmannan580@gmail.com\", \"login_method\": \"email\"}', '2026-03-26 16:26:02', '2026-03-26 16:26:02'),
(12, 2, 'user_logout', 'App\\Models\\User', 2, 'User Mohammad Abdul Abdul Mannan logged out', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '{\"role\": \"admin\", \"email\": \"mdmannan580@gmail.com\"}', '2026-03-26 16:40:38', '2026-03-26 16:40:38'),
(13, 1, 'user_login', 'App\\Models\\User', 1, 'User Super Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '{\"role\": \"super_admin\", \"email\": \"admin@cashmanagement.com\", \"login_method\": \"email\"}', '2026-03-26 16:43:36', '2026-03-26 16:43:36');

-- Table structure for table `cache`
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `cache_locks`
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `categories`
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#6B7280',
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `categories`
INSERT INTO `categories` VALUES
(1, 'Settle Payable', 'settle-payable', 'settle_payable', '#F59E0B', 'ArrowDownLeft', 1, '2026-03-13 18:19:03', '2026-03-13 18:19:03'),
(2, 'Settle Receivable', 'settle-receivable', 'settle_receivable', '#3B82F6', 'ArrowUpRight', 1, '2026-03-13 18:19:03', '2026-03-13 18:19:03'),
(3, 'Salary', 'salary', 'income', '#80ff80', NULL, 1, '2026-03-13 18:28:42', '2026-03-13 18:28:42'),
(4, 'ধার নিলাম', 'dhar-nilam', 'payable', '#ff8080', NULL, 1, '2026-03-13 18:40:57', '2026-03-13 18:40:57'),
(5, 'ধার দিলাম', 'dhar-dilam', 'receivable', '#0000ff', NULL, 1, '2026-03-13 18:41:18', '2026-03-13 18:41:18'),
(6, 'সংসার খরচ', 'sngsar-khrc', 'expense', '#ff0000', NULL, 1, '2026-03-13 18:42:03', '2026-03-13 18:42:03'),
(7, 'ধারের টাকা ফেরত', 'dharer-taka-fert', 'expense', '#ff8080', NULL, 1, '2026-03-14 05:23:48', '2026-03-14 05:23:48'),
(9, 'রুম ভাড়া', 'rum-vara', 'expense', '#6B7280', NULL, 1, '2026-03-17 06:45:18', '2026-03-17 06:45:18'),
(10, 'রুম ভাড়া + খাবার', 'rum-vara-khabar', 'expense', '#6B7280', NULL, 1, '2026-03-17 06:45:39', '2026-03-17 06:45:39'),
(11, 'চিকিৎসা খরচ', 'cikittsa-khrc', 'expense', '#e22f22', NULL, 1, '2026-03-17 06:49:12', '2026-03-17 06:49:12'),
(12, 'অন্যান্য', 'onzanz', 'expense', '#6B7280', NULL, 1, '2026-03-26 16:36:45', '2026-03-26 16:36:45'),
(13, 'অতিরিক্ত আয়', 'otirikt-ay', 'income', '#6B7280', NULL, 1, '2026-03-26 16:37:11', '2026-03-26 16:37:11');

-- Table structure for table `exchange_rates`
DROP TABLE IF EXISTS `exchange_rates`;
CREATE TABLE `exchange_rates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `from_currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate` decimal(15,8) NOT NULL,
  `source` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'exchangerate-api.com',
  `fetched_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exchange_rates_from_currency_to_currency_unique` (`from_currency`,`to_currency`),
  KEY `exchange_rates_from_currency_to_currency_fetched_at_index` (`from_currency`,`to_currency`,`fetched_at`),
  KEY `exchange_rates_fetched_at_index` (`fetched_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `exchange_rates`
INSERT INTO `exchange_rates` VALUES
(1, 'KWD', 'BDT', '397.51900000', 'fallback', '2026-03-13 18:20:53', '2026-03-13 18:20:53', '2026-03-13 18:20:53');

-- Table structure for table `failed_jobs`
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `job_batches`
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `jobs`
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `migrations`
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `migrations`
INSERT INTO `migrations` VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_08_203705_add_currency_fields_to_users_table', 1),
(5, '2025_08_09_045439_create_categories_table', 1),
(6, '2025_08_09_045440_create_transactions_table', 1),
(7, '2025_08_09_054225_add_appearance_fields_to_users_table', 1),
(8, '2025_08_09_122749_create_exchange_rates_table', 1),
(9, '2025_08_09_123106_add_exchange_rate_api_key_to_users_table', 1),
(10, '2025_08_09_162444_create_notifications_table', 1),
(11, '2025_08_09_165238_add_admin_role_to_users_table', 1),
(12, '2025_08_09_170430_add_role_and_permissions_to_users_table', 1),
(13, '2025_08_09_192206_remove_admin_role_columns_from_users_table', 1),
(14, '2025_08_10_000001_add_password_reset_fields_to_users_table', 1),
(15, '2025_08_10_000002_create_activity_logs_table', 1),
(16, '2025_08_10_180835_add_comprehensive_fields_to_users_table', 1),
(17, '2025_08_27_083419_remove_due_date_from_transactions_table', 1),
(18, '2025_08_27_101157_update_transactions_type_column', 1),
(19, '2025_08_31_044654_add_profile_photo_to_users_table', 1),
(20, '2025_08_31_045411_create_profile_photos_table', 1),
(21, '2025_09_02_082004_add_settle_receivable_payable_to_transactions_type_enum', 1),
(22, 'create_transaction_types_table', 1),
(23, 'update_transactions_table', 1);

-- Table structure for table `notifications`
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'blue',
  `data` json DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `is_important` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_read_at_index` (`user_id`,`read_at`),
  KEY `notifications_user_id_created_at_index` (`user_id`,`created_at`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `notifications`
INSERT INTO `notifications` VALUES
(1, 1, 'user_activity_logged out', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan logged out from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged out\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-13 18:25:43', '2026-03-13 18:25:43'),
(2, 1, 'user_activity_logged in', 'User Activity Alert', 'User Super Admin logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Super Admin\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-13 18:27:20', '2026-03-13 18:27:20'),
(4, 1, 'success', 'Category Added', 'Your income category \'Salary\' has been added successfully', 'TrendingUp', 'green', '{\"name\": \"Salary\", \"type\": \"income\", \"action\": \"created\", \"category_id\": 3}', NULL, 0, '2026-03-13 18:28:42', '2026-03-13 18:28:42'),
(5, 1, 'user_activity_logged in', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-13 18:30:26', '2026-03-13 18:30:26'),
(8, 1, 'success', 'Category Added', 'Your payable category \'ধার নিলাম\' has been added successfully', 'ArrowDownLeft', 'orange', '{\"name\": \"ধার নিলাম\", \"type\": \"payable\", \"action\": \"created\", \"category_id\": 4}', NULL, 0, '2026-03-13 18:40:57', '2026-03-13 18:40:57'),
(9, 1, 'success', 'Category Added', 'Your receivable category \'ধার দিলাম\' has been added successfully', 'ArrowUpRight', 'blue', '{\"name\": \"ধার দিলাম\", \"type\": \"receivable\", \"action\": \"created\", \"category_id\": 5}', NULL, 0, '2026-03-13 18:41:18', '2026-03-13 18:41:18'),
(10, 1, 'success', 'Category Added', 'Your expense category \'সংসার খরচ\' has been added successfully', 'TrendingDown', 'red', '{\"name\": \"সংসার খরচ\", \"type\": \"expense\", \"action\": \"created\", \"category_id\": 6}', NULL, 0, '2026-03-13 18:42:03', '2026-03-13 18:42:03'),
(12, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a payable transaction of BDT 19876', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 19876, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-13 18:42:34', '2026-03-13 18:42:34'),
(14, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a receivable transaction of BDT 59628', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 59628, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"receivable\"}', NULL, 0, '2026-03-13 18:43:23', '2026-03-13 18:43:23'),
(15, 1, 'transaction_deleted', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan deleted a settlement transaction of BDT 7950.4', 'Activity', 'blue', '{\"action\": \"deleted\", \"amount\": 7950.4, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"settlement\"}', NULL, 0, '2026-03-13 18:51:25', '2026-03-13 18:51:25'),
(16, 1, 'transaction_deleted', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan deleted a settlement transaction of BDT 39752', 'Activity', 'blue', '{\"action\": \"deleted\", \"amount\": 39752, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"settlement\"}', NULL, 0, '2026-03-13 18:51:33', '2026-03-13 18:51:33'),
(17, 1, 'transaction_deleted', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan deleted a receivable transaction of BDT 59628', 'Activity', 'blue', '{\"action\": \"deleted\", \"amount\": 59628, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"receivable\"}', NULL, 0, '2026-03-13 18:51:43', '2026-03-13 18:51:43'),
(18, 1, 'transaction_deleted', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan deleted a settlement transaction of BDT 11925.6', 'Activity', 'blue', '{\"action\": \"deleted\", \"amount\": 11925.6, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"settlement\"}', NULL, 0, '2026-03-13 19:16:05', '2026-03-13 19:16:05'),
(19, 1, 'transaction_deleted', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan deleted a payable transaction of BDT 19876', 'Activity', 'blue', '{\"action\": \"deleted\", \"amount\": 19876, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-13 19:16:10', '2026-03-13 19:16:10'),
(20, 1, 'transaction_deleted', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan deleted a income transaction of BDT 100000', 'Activity', 'blue', '{\"action\": \"deleted\", \"amount\": 100000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-13 19:16:13', '2026-03-13 19:16:13'),
(21, 1, 'user_activity_logged out', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan logged out from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged out\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-13 19:31:44', '2026-03-13 19:31:44'),
(22, 1, 'user_activity_logged in', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-13 19:31:54', '2026-03-13 19:31:54'),
(23, 2, 'success', 'Income Transaction Added', 'Your income of ৳224,000.00 has been added successfully', 'TrendingUp', 'green', '{\"type\": \"income\", \"action\": \"created\", \"amount\": \"224000.00\", \"transaction_id\": 7}', '2026-03-14 06:32:44', 0, '2026-03-14 05:08:26', '2026-03-14 06:32:44'),
(24, 2, 'success', 'Income Transaction Added', 'Your income of ৳224,000.00 has been added successfully', 'TrendingUp', 'green', '{\"type\": \"income\", \"action\": \"created\", \"amount\": \"224000.00\", \"transaction_id\": 8}', '2026-03-14 05:10:18', 0, '2026-03-14 05:10:16', '2026-03-14 05:10:18'),
(25, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a income transaction of BDT 224000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 224000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-14 05:10:18', '2026-03-14 05:10:18'),
(26, 1, 'transaction_deleted', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan deleted a income transaction of BDT 224000', 'Activity', 'blue', '{\"action\": \"deleted\", \"amount\": 224000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-14 05:10:38', '2026-03-14 05:10:38'),
(27, 2, 'success', 'Payable Transaction Added', 'Your payable of ৳176,000.00 has been added successfully', 'ArrowDownLeft', 'orange', '{\"type\": \"payable\", \"action\": \"created\", \"amount\": \"176000.00\", \"transaction_id\": 9}', '2026-03-14 05:14:47', 0, '2026-03-14 05:14:46', '2026-03-14 05:14:47'),
(28, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a payable transaction of BDT 176000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 176000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 05:14:47', '2026-03-14 05:14:47'),
(29, 2, 'success', 'Payable Transaction Added', 'Your payable of ৳200,000.00 has been added successfully', 'ArrowDownLeft', 'orange', '{\"type\": \"payable\", \"action\": \"created\", \"amount\": \"200000.00\", \"transaction_id\": 10}', '2026-03-14 05:16:15', 0, '2026-03-14 05:16:15', '2026-03-14 05:16:15'),
(30, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a payable transaction of BDT 200000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 200000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 05:16:16', '2026-03-14 05:16:16'),
(31, 1, 'success', 'Category Added', 'Your expense category \'ধারের টাকা ফেরত\' has been added successfully', 'TrendingDown', 'red', '{\"name\": \"ধারের টাকা ফেরত\", \"type\": \"expense\", \"action\": \"created\", \"category_id\": 7}', NULL, 0, '2026-03-14 05:23:48', '2026-03-14 05:23:48'),
(32, 2, 'success', 'Expense Transaction Added', 'Your expense of ৳249,200.00 has been added successfully', 'TrendingDown', 'red', '{\"type\": \"expense\", \"action\": \"created\", \"amount\": \"249200.00\", \"transaction_id\": 11}', '2026-03-14 05:27:05', 0, '2026-03-14 05:27:05', '2026-03-14 05:27:05'),
(33, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense transaction of BDT 249200', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 249200, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-14 05:27:05', '2026-03-14 05:27:05'),
(34, 2, 'success', 'Expense Transaction Updated', 'Your expense of ৳249,200.00 has been updated successfully', 'TrendingDown', 'red', '{\"type\": \"expense\", \"action\": \"updated\", \"amount\": \"249200.00\", \"transaction_id\": 11}', '2026-03-14 05:27:36', 0, '2026-03-14 05:27:36', '2026-03-14 05:27:36'),
(35, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a expense transaction of BDT 249200', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 249200, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-14 05:27:37', '2026-03-14 05:27:37'),
(36, 2, 'success', 'Income Transaction Updated', 'Your income of ৳224,000.00 has been updated successfully', 'TrendingUp', 'green', '{\"type\": \"income\", \"action\": \"updated\", \"amount\": \"224000.00\", \"transaction_id\": 7}', '2026-03-14 05:28:11', 0, '2026-03-14 05:28:10', '2026-03-14 05:28:11'),
(37, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a income transaction of BDT 224000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 224000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-14 05:28:11', '2026-03-14 05:28:11'),
(38, 2, 'success', 'Payable Transaction Updated', 'Your payable of ৳176,000.00 has been updated successfully', 'ArrowDownLeft', 'orange', '{\"type\": \"payable\", \"action\": \"updated\", \"amount\": \"176000.00\", \"transaction_id\": 9}', '2026-03-14 05:28:37', 0, '2026-03-14 05:28:37', '2026-03-14 05:28:37'),
(39, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a payable transaction of BDT 176000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 176000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 05:28:38', '2026-03-14 05:28:38'),
(41, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a payable transaction of BDT 200000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 200000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 05:28:54', '2026-03-14 05:28:54'),
(43, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a income transaction of BDT 1200', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 1200, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-14 05:32:06', '2026-03-14 05:32:06'),
(45, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a income transaction of BDT 224000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 224000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-14 05:33:39', '2026-03-14 05:33:39'),
(47, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a income transaction of BDT 1200', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 1200, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-14 05:34:02', '2026-03-14 05:34:02'),
(49, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a payable transaction of BDT 176000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 176000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 05:34:20', '2026-03-14 05:34:20'),
(51, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a income transaction of BDT 224000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 224000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-14 05:45:14', '2026-03-14 05:45:14'),
(53, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a income transaction of BDT 1200', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 1200, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-14 05:45:57', '2026-03-14 05:45:57'),
(55, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a payable transaction of BDT 176000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 176000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 05:46:34', '2026-03-14 05:46:34'),
(57, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a payable transaction of BDT 200000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 200000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 05:47:22', '2026-03-14 05:47:22'),
(59, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense transaction of BDT 300000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 300000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-14 05:50:15', '2026-03-14 05:50:15'),
(61, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense transaction of BDT 52000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 52000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-14 05:54:24', '2026-03-14 05:54:24'),
(63, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a payable transaction of BDT 100000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 100000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 05:59:35', '2026-03-14 05:59:35'),
(65, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a payable transaction of BDT 176000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 176000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 06:00:58', '2026-03-14 06:00:58'),
(66, 1, 'transaction_deleted', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan deleted a payable transaction of BDT 100000', 'Activity', 'blue', '{\"action\": \"deleted\", \"amount\": 100000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 06:02:10', '2026-03-14 06:02:10'),
(67, 1, 'user_activity_logged in', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-14 10:36:34', '2026-03-14 10:36:34'),
(69, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a payable transaction of BDT 200000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 200000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 10:37:27', '2026-03-14 10:37:27'),
(71, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a payable transaction of BDT 176000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 176000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"payable\"}', NULL, 0, '2026-03-14 10:38:00', '2026-03-14 10:38:00'),
(73, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a expense transaction of BDT 249200', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 249200, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-14 10:38:21', '2026-03-14 10:38:21'),
(74, 1, 'user_activity_logged in', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-17 06:21:15', '2026-03-17 06:21:15'),
(76, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a income transaction of BDT 112000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 112000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-17 06:26:15', '2026-03-17 06:26:15'),
(78, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a income transaction of BDT 160000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 160000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-17 06:42:07', '2026-03-17 06:42:07'),
(79, 1, 'user_activity_logged in', 'User Activity Alert', 'User Super Admin logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Super Admin\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-17 06:44:00', '2026-03-17 06:44:00'),
(83, 1, 'category_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense category: রুম ভাড়া', 'Activity', 'blue', '{\"action\": \"created\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"category_name\": \"রুম ভাড়া\", \"category_type\": \"expense\"}', NULL, 0, '2026-03-17 06:45:18', '2026-03-17 06:45:18'),
(85, 1, 'category_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense category: রুম ভাড়া + খাবার', 'Activity', 'blue', '{\"action\": \"created\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"category_name\": \"রুম ভাড়া + খাবার\", \"category_type\": \"expense\"}', NULL, 0, '2026-03-17 06:45:40', '2026-03-17 06:45:40'),
(87, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense transaction of BDT 16000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 16000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-17 06:46:52', '2026-03-17 06:46:52'),
(88, 2, 'success', 'Income Transaction Updated', 'Your income of ৳112,000.00 has been updated successfully', 'TrendingUp', 'green', '{\"type\": \"income\", \"action\": \"updated\", \"amount\": \"112000.00\", \"transaction_id\": 16}', '2026-03-17 06:48:12', 0, '2026-03-17 06:48:12', '2026-03-17 06:48:12'),
(89, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a income transaction of BDT 112000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 112000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-17 06:48:13', '2026-03-17 06:48:13'),
(90, 2, 'success', 'Category Added', 'Your expense category \'চিকিৎসা খরচ\' has been added successfully', 'TrendingDown', 'red', '{\"name\": \"চিকিৎসা খরচ\", \"type\": \"expense\", \"action\": \"created\", \"category_id\": 11}', NULL, 0, '2026-03-17 06:49:12', '2026-03-17 06:49:12'),
(91, 1, 'category_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense category: চিকিৎসা খরচ', 'Activity', 'blue', '{\"action\": \"created\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"category_name\": \"চিকিৎসা খরচ\", \"category_type\": \"expense\"}', NULL, 0, '2026-03-17 06:49:12', '2026-03-17 06:49:12'),
(92, 2, 'success', 'Expense Transaction Added', 'Your expense of ৳32,000.00 has been added successfully', 'TrendingDown', 'red', '{\"type\": \"expense\", \"action\": \"created\", \"amount\": \"32000.00\", \"transaction_id\": 20}', '2026-03-17 06:51:42', 0, '2026-03-17 06:51:42', '2026-03-17 06:51:42'),
(93, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense transaction of BDT 32000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 32000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-17 06:51:42', '2026-03-17 06:51:42'),
(94, 2, 'success', 'Expense Transaction Added', 'Your expense of ৳30,000.00 has been added successfully', 'TrendingDown', 'red', '{\"type\": \"expense\", \"action\": \"created\", \"amount\": \"30000.00\", \"transaction_id\": 21}', '2026-03-17 06:55:54', 0, '2026-03-17 06:55:53', '2026-03-17 06:55:54'),
(95, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense transaction of BDT 30000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 30000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-17 06:55:54', '2026-03-17 06:55:54'),
(96, 2, 'success', 'Expense Transaction Added', 'Your expense of ৳120,000.00 has been added successfully', 'TrendingDown', 'red', '{\"type\": \"expense\", \"action\": \"created\", \"amount\": \"120000.00\", \"transaction_id\": 22}', '2026-03-17 07:01:35', 0, '2026-03-17 07:01:35', '2026-03-17 07:01:35'),
(97, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense transaction of BDT 120000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 120000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-17 07:01:36', '2026-03-17 07:01:36'),
(98, 2, 'success', 'Settlement Transaction Updated', 'Your settlement of ৳72,000.00 has been updated successfully', 'DollarSign', 'blue', '{\"type\": \"settlement\", \"action\": \"updated\", \"amount\": \"72000.00\", \"transaction_id\": 17}', '2026-03-17 07:02:41', 0, '2026-03-17 07:02:40', '2026-03-17 07:02:41'),
(99, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a settlement transaction of BDT 72000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 72000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"settlement\"}', NULL, 0, '2026-03-17 07:02:41', '2026-03-17 07:02:41'),
(100, 2, 'success', 'Expense Transaction Updated', 'Your expense of ৳32,000.00 has been updated successfully', 'TrendingDown', 'red', '{\"type\": \"expense\", \"action\": \"updated\", \"amount\": \"32000.00\", \"transaction_id\": 21}', '2026-03-17 11:28:39', 0, '2026-03-17 11:28:38', '2026-03-17 11:28:39'),
(101, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a expense transaction of BDT 32000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 32000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-17 11:28:39', '2026-03-17 11:28:39'),
(102, 1, 'user_activity_logged in', 'User Activity Alert', 'User Super Admin logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Super Admin\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-26 16:25:23', '2026-03-26 16:25:23'),
(103, 1, 'user_activity_logged in', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-26 16:26:02', '2026-03-26 16:26:02'),
(104, 2, 'success', 'Payable Transaction Added', 'Your payable of ৳100,000.00 has been added successfully', 'ArrowDownLeft', 'orange', '{\"type\": \"payable\", \"action\": \"created\", \"amount\": \"100000.00\", \"transaction_id\": 23}', NULL, 0, '2026-03-26 16:29:49', '2026-03-26 16:29:49'),
(105, 2, 'success', 'Expense Transaction Added', 'Your expense of ৳100,000.00 has been added successfully', 'TrendingDown', 'red', '{\"type\": \"expense\", \"action\": \"created\", \"amount\": \"100000.00\", \"transaction_id\": 24}', '2026-03-26 16:34:15', 0, '2026-03-26 16:34:15', '2026-03-26 16:34:15'),
(106, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense transaction of BDT 100000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 100000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-26 16:34:15', '2026-03-26 16:34:15'),
(107, 2, 'success', 'Income Transaction Added', 'Your income of ৳100,000.00 has been added successfully', 'TrendingUp', 'green', '{\"type\": \"income\", \"action\": \"created\", \"amount\": \"100000.00\", \"transaction_id\": 25}', '2026-03-26 16:36:20', 0, '2026-03-26 16:36:20', '2026-03-26 16:36:20'),
(108, 1, 'transaction_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a income transaction of BDT 100000', 'Activity', 'blue', '{\"action\": \"created\", \"amount\": 100000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-26 16:36:20', '2026-03-26 16:36:20'),
(109, 2, 'success', 'Category Added', 'Your expense category \'অন্যান্য\' has been added successfully', 'TrendingDown', 'red', '{\"name\": \"অন্যান্য\", \"type\": \"expense\", \"action\": \"created\", \"category_id\": 12}', NULL, 0, '2026-03-26 16:36:45', '2026-03-26 16:36:45'),
(110, 1, 'category_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a expense category: অন্যান্য', 'Activity', 'blue', '{\"action\": \"created\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"category_name\": \"অন্যান্য\", \"category_type\": \"expense\"}', NULL, 0, '2026-03-26 16:36:45', '2026-03-26 16:36:45'),
(111, 2, 'success', 'Category Added', 'Your income category \'অতিরিক্ত আয়\' has been added successfully', 'TrendingUp', 'green', '{\"name\": \"অতিরিক্ত আয়\", \"type\": \"income\", \"action\": \"created\", \"category_id\": 13}', NULL, 0, '2026-03-26 16:37:11', '2026-03-26 16:37:11'),
(112, 1, 'category_created', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan created a income category: অতিরিক্ত আয়', 'Activity', 'blue', '{\"action\": \"created\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"category_name\": \"অতিরিক্ত আয়\", \"category_type\": \"income\"}', NULL, 0, '2026-03-26 16:37:11', '2026-03-26 16:37:11'),
(113, 2, 'success', 'Income Transaction Updated', 'Your income of ৳100,000.00 has been updated successfully', 'TrendingUp', 'green', '{\"type\": \"income\", \"action\": \"updated\", \"amount\": \"100000.00\", \"transaction_id\": 25}', '2026-03-26 16:37:44', 0, '2026-03-26 16:37:44', '2026-03-26 16:37:44'),
(114, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a income transaction of BDT 100000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 100000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"income\"}', NULL, 0, '2026-03-26 16:37:44', '2026-03-26 16:37:44'),
(115, 2, 'success', 'Expense Transaction Updated', 'Your expense of ৳100,000.00 has been updated successfully', 'TrendingDown', 'red', '{\"type\": \"expense\", \"action\": \"updated\", \"amount\": \"100000.00\", \"transaction_id\": 24}', '2026-03-26 16:38:20', 0, '2026-03-26 16:38:19', '2026-03-26 16:38:20'),
(116, 1, 'transaction_updated', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan updated a expense transaction of BDT 100000', 'Activity', 'blue', '{\"action\": \"updated\", \"amount\": 100000, \"currency\": \"BDT\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"transaction_type\": \"expense\"}', NULL, 0, '2026-03-26 16:38:20', '2026-03-26 16:38:20'),
(117, 1, 'user_activity_logged out', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan logged out from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged out\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-26 16:40:38', '2026-03-26 16:40:38'),
(118, 2, 'user_activity_logged out', 'User Activity Alert', 'User Mohammad Abdul Abdul Mannan logged out from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged out\", \"user_name\": \"Mohammad Abdul Abdul Mannan\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-26 16:40:38', '2026-03-26 16:40:38'),
(119, 1, 'user_activity_logged in', 'User Activity Alert', 'User Super Admin logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Super Admin\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-26 16:43:36', '2026-03-26 16:43:36'),
(120, 2, 'user_activity_logged in', 'User Activity Alert', 'User Super Admin logged in from IP: 127.0.0.1', 'Activity', 'blue', '{\"action\": \"logged in\", \"user_name\": \"Super Admin\", \"ip_address\": \"127.0.0.1\"}', NULL, 0, '2026-03-26 16:43:36', '2026-03-26 16:43:36');

-- Table structure for table `password_reset_tokens`
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `profile_photos`
DROP TABLE IF EXISTS `profile_photos`;
CREATE TABLE `profile_photos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `profile_photos_user_id_foreign` (`user_id`),
  CONSTRAINT `profile_photos_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `sessions`
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `transaction_types`
DROP TABLE IF EXISTS `transaction_types`;
CREATE TABLE `transaction_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direction` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `transaction_types`
INSERT INTO `transaction_types` VALUES
(1, 'income', 'incoming', '2026-03-13 18:19:03', '2026-03-13 18:19:03'),
(2, 'expense', 'outgoing', '2026-03-13 18:19:03', '2026-03-13 18:19:03'),
(3, 'payable', 'outgoing', '2026-03-13 18:19:03', '2026-03-13 18:19:03'),
(4, 'receivable', 'incoming', '2026-03-13 18:19:03', '2026-03-13 18:19:03'),
(5, 'settlement', 'neutral', '2026-03-13 18:19:03', '2026-03-13 18:19:03'),
(6, 'settle_receivable', 'incoming', '2026-03-13 18:19:03', '2026-03-13 18:19:03'),
(7, 'settle_payable', 'outgoing', '2026-03-13 18:19:03', '2026-03-13 18:19:03');

-- Table structure for table `transactions`
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('income','expense','receivable','payable','settlement','settle_receivable','settle_payable') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `transaction_type_id` bigint unsigned NOT NULL,
  `related_transaction_id` bigint unsigned DEFAULT NULL,
  `status` enum('pending','partial','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `settled_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `settled_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transactions_category_id_foreign` (`category_id`),
  KEY `transactions_user_id_date_index` (`user_id`,`date`),
  KEY `transactions_user_id_type_index` (`user_id`,`type`),
  KEY `transactions_user_id_status_index` (`user_id`),
  KEY `transactions_transaction_type_id_foreign` (`transaction_type_id`),
  KEY `transactions_related_transaction_id_foreign` (`related_transaction_id`),
  CONSTRAINT `transactions_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_related_transaction_id_foreign` FOREIGN KEY (`related_transaction_id`) REFERENCES `transactions` (`id`),
  CONSTRAINT `transactions_transaction_type_id_foreign` FOREIGN KEY (`transaction_type_id`) REFERENCES `transaction_types` (`id`),
  CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `transactions`
INSERT INTO `transactions` VALUES
(7, 2, 3, '2026-02-03', 'Kamruzzaman November & December Salary', 'income', '224000.00', 'BDT', 'Salary', '২ মাসের বেতন ৫৬০ দিনার আরো ধার নেওয়া হল ৯৪০ দিনার ৫০০ দিনার মমিন দাদা থেকে সিরাজ দাদা থেকে ৪৪০ ।পরে এই টাকা থেকে বাবুল ভাইকে দেওয়া হল ৬২৩ দিনার ডলি আপার ৩০০০০০ এর জন্য ৭৫০ দিনার+ সংসার খরচ(৫২০০০)১৩০ দিনার', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 560, \"secondary_currency\": \"KWD\"}', '2026-03-14 05:08:26', '2026-03-14 05:45:13', 1, NULL, 'completed', '0.00', NULL),
(9, 2, 4, '2026-02-03', 'সিরাজ ভাই থেকে  কামরুজ্জামানের ধার', 'payable', '176000.00', 'BDT', 'সিরাজ ভাই থেকে  কামরুজ্জামানের মালিক', '২ মাসের বেতন ৫৬০ দিনার আরো ধার নেওয়া হল ৯৪০ দিনার ৫০০ দিনার মমিন দাদা থেকে সিরাজ দাদা থেকে ৪৪০ ।পরে এই টাকা থেকে বাবুল ভাইকে দেওয়া হল ৬২৩ দিনার ডলি আপার ৩০০০০০ এর জন্য ৭৫০ দিনার+ সংসার খরচ(৫২০০০)১৩০ দিনার. এখানে ৩ দিনার শর্ট হলে বদির পকেট থেকে ৫ দিনার দেয় আমি (মান্নান) ২ দিনার খরছ করি', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 440, \"secondary_currency\": \"KWD\"}', '2026-03-14 05:14:46', '2026-03-17 06:28:42', 3, NULL, 'partial', '72000.00', NULL),
(10, 2, 4, '2026-02-03', 'মমিন দাদা থেকে কামরুজ্জামানের ধার', 'payable', '200000.00', 'BDT', 'মমিন দাদা', '২ মাসের বেতন ৫৬০ দিনার আরো ধার নেওয়া হল ৯৪০ দিনার ৫০০ দিনার মমিন দাদা থেকে সিরাজ দাদা থেকে ৪৪০ ।পরে এই টাকা থেকে বাবুল ভাইকে দেওয়া হল ৬২৩ দিনার ডলি আপার ৩০০০০০ এর জন্য ৭৫০ দিনার+ সংসার খরচ(৫২০০০)১৩০ দিনার. এখানে ৩ দিনার শর্ট হলে বদির পকেট থেকে ৫ দিনার দেয় আমি (মান্নান) ২ দিনার খরছ করি', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 500, \"secondary_currency\": \"KWD\"}', '2026-03-14 05:16:15', '2026-03-14 10:37:27', 3, NULL, 'completed', '0.00', NULL),
(11, 2, 7, '2026-02-03', 'বাবুল ভাইকে পাওনা টাকা ফেরত দেওয়া হল', 'expense', '249200.00', 'BDT', 'কামরুজ্জামানের  ধার নেওয়া টাকা + নভেম্বর ডিসেম্বরের বেতন অংশ', 'বাবুল ভাইয়ের পাওনা ১০৪০ দিনার বদি(আমরা) পাওনা ৪১৭ দিনার কাটাকাটির পর উনি পাওনা হন ৬২৩ দিনার', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 623, \"secondary_currency\": \"KWD\"}', '2026-03-14 05:27:05', '2026-03-14 10:38:21', 2, NULL, 'completed', '0.00', NULL),
(12, 2, 3, '2026-02-03', 'বদিউজ্জামানথেকে প্রাপ্তি', 'income', '1200.00', 'BDT', 'বদিউজ্জামান', '২ মাসের বেতন ৫৬০ দিনার আরো ধার নেওয়া হল ৯৪০ দিনার ৫০০ দিনার মমিন দাদা থেকে সিরাজ দাদা থেকে ৪৪০ ।পরে এই টাকা থেকে বাবুল ভাইকে দেওয়া হল ৬২৩ দিনার ডলি আপার ৩০০০০০ এর জন্য ৭৫০ দিনার+ সংসার খরচ(৫২০০০)১৩০ দিনার. এখানে ৩ দিনার শর্ট হলে বদির পকেট থেকে ৫ দিনার দেয় আমি (মান্নান) ২ দিনার খরছ করি', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 3, \"secondary_currency\": \"KWD\"}', '2026-03-14 05:32:05', '2026-03-14 05:45:56', 1, NULL, 'completed', '0.00', NULL),
(13, 2, 7, '2026-02-03', 'বিভিন্ন সময় ডলি আপা থেকে ধার নেওয়া টাকার পরিমান 300000', 'expense', '300000.00', 'BDT', 'কামরুজ্জামানের ধার নেওয়া টাকা + নভেম্বর ডিসেম্বরের বেতন অংশ', '২ মাসের বেতন ৫৬০ দিনার আরো ধার নেওয়া হল ৯৪০ দিনার ৫০০ দিনার মমিন দাদা থেকে সিরাজ দাদা থেকে ৪৪০ ।পরে এই টাকা থেকে বাবুল ভাইকে দেওয়া হল ৬২৩ দিনার ডলি আপার ৩০০০০০ এর জন্য ৭৫০ দিনার+ সংসার খরচ(৫২০০০)১৩০ দিনার', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 750, \"secondary_currency\": \"KWD\"}', '2026-03-14 05:50:14', '2026-03-14 05:50:14', 2, NULL, 'completed', '0.00', NULL),
(14, 2, 6, '2026-02-03', 'ফেব্রুয়ারির সংসার খরচের টাকা', 'expense', '52000.00', 'BDT', 'কামরুজ্জামানের  ধার নেওয়া টাকা + নভেম্বর ডিসেম্বরের বেতন অংশ', NULL, '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 130, \"secondary_currency\": \"KWD\"}', '2026-03-14 05:54:24', '2026-03-14 05:54:24', 2, NULL, 'completed', '0.00', NULL),
(16, 2, 3, '2026-03-04', 'কামরুজ্জামানের জানুয়ারি  মাসের বেতন', 'income', '112000.00', 'BDT', 'কামরুজ্জামানের বেটন', NULL, '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 280, \"secondary_currency\": \"KWD\"}', '2026-03-17 06:26:14', '2026-03-17 06:48:12', 1, NULL, 'completed', '0.00', NULL),
(17, 2, 1, '2026-03-04', 'জানুয়ারি ২০২৬ মাসের বেতন থেকে কর্তন ১৮০ দিনার বাকি ২৬০', 'settlement', '72000.00', 'BDT', 'সিরাজ ভাই থেকে  কামরুজ্জামানের মালিক', 'Settlement transaction for payable', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 180, \"secondary_currency\": \"KWD\"}', '2026-03-17 06:28:42', '2026-03-17 07:02:40', 5, 9, 'completed', '0.00', NULL),
(18, 2, 3, '2026-03-09', 'বদিউজ্জামানের ফেব্রুয়ারি মাসের বেতন', 'income', '160000.00', 'BDT', 'বদিউজ্জামানের বেতন', 'বদিউজ্জামানের ফেব্রুয়ারি মাসের বেতন ৩০০ + ১০০ মার্চ মাসের এডভান্স', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 400, \"secondary_currency\": \"KWD\"}', '2026-03-17 06:42:07', '2026-03-17 06:42:07', 1, NULL, 'completed', '0.00', NULL),
(19, 2, 10, '2026-03-10', 'কামরুজ্জামান +  বদির রুম ভাড়া খানা খরচ(মার্চ)', 'expense', '16000.00', 'BDT', 'কামরুজ্জামান +  বদির রুম ভাড়া খানা খরচ(মার্চ)', 'কামরুজ্জামান +  বদির রুম ভাড়া খানা খরচ(মার্চ)', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 40, \"secondary_currency\": \"KWD\"}', '2026-03-17 06:46:52', '2026-03-17 06:46:52', 2, NULL, 'completed', '0.00', NULL),
(20, 2, 11, '2026-03-15', 'মান্নান + লিপির দাক্তার খরচ', 'expense', '32000.00', 'BDT', 'বদির + কামরুজ্জামানের বেতন থেকে', 'বদির(ফেব্রুয়ারি) + কামরুজ্জামানের(জানুয়ারি) বেতন থেকে ৮০ দিনার', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 80, \"secondary_currency\": \"KWD\"}', '2026-03-17 06:51:42', '2026-03-17 06:51:42', 2, NULL, 'completed', '0.00', NULL),
(21, 2, 11, '2026-03-06', 'আহমেদ  মোসাদ্দেক হয়ার সময়ের খরচ', 'expense', '32000.00', 'BDT', 'বদির + কামরুজ্জামানের বেতন থেকে', 'বদি(ফেব্রুয়ারি)+ কামরুজ্জামানের জানুয়ারির বেতন থেকে(বিকাশে পাঠানো হয়েছে যার পরিমান ৮০ দিনার =৩৭৫ টাকা করে', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 80, \"secondary_currency\": \"KWD\"}', '2026-03-17 06:55:53', '2026-03-17 11:28:38', 2, NULL, 'completed', '0.00', NULL),
(22, 2, 6, '2026-03-09', 'সংসার খরচ+ রোজার ঈদের খরচ+বদির শ্বশুর বাড়িতে ঈদের গিফট', 'expense', '120000.00', 'BDT', 'বদির + কামরুজ্জামানের বেতন থেকে', 'বদি(ফেব্রুয়ারি)+ কামরুজ্জামানের (জানুয়ারির) বেতন থেকে সংসার =৩০০০০+সুমি=১০০০০+নুরুজ্জামান+সাওন+ইয়ছিন=১৫০০০ +বদির শ্বশুর বাড়িতে ঈদের গিত+=১৫০০০', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 300, \"secondary_currency\": \"KWD\"}', '2026-03-17 07:01:35', '2026-03-17 07:01:35', 2, NULL, 'completed', '0.00', NULL),
(23, 2, 4, '2023-08-26', 'কাম্রুজ্জামানের  ভিসা বাবদ', 'payable', '100000.00', 'BDT', 'নুরুন্নবি মামা', NULL, '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 250, \"secondary_currency\": \"KWD\"}', '2026-03-26 16:29:49', '2026-03-26 16:39:44', 3, NULL, 'completed', '100000.00', '2026-03-26 16:39:44'),
(24, 2, 12, '2023-08-26', 'কাম্রুজ্জামানের  ভিসা বাবদ খরচ করা হইল', 'expense', '100000.00', 'BDT', 'নুরুন্নবি মামা', 'কামরুজ্জামানের ভিসা বাবদ খরচ করা হয় পরে ধার করা টাকা ২৪/০৩/২০২৬ তারিখে ফেরত দেওয়া হয়', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 250, \"secondary_currency\": \"KWD\"}', '2026-03-26 16:34:15', '2026-03-26 16:38:19', 2, NULL, 'completed', '0.00', NULL),
(25, 2, 13, '2026-03-24', 'বদির বেতন + এক্সট্রা ইনকাম', 'income', '100000.00', 'BDT', 'বদিউজ্জামান', NULL, '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 250, \"secondary_currency\": \"KWD\"}', '2026-03-26 16:36:20', '2026-03-26 16:37:44', 1, NULL, 'completed', '0.00', NULL),
(26, 2, 1, '2026-03-24', 'বদির এক্সট্রা ইনকাম থেকে', 'settlement', '100000.00', 'BDT', 'নুরুন্নবি মামা', 'Settlement transaction for payable', '{\"exchange_rate\": 400, \"primary_symbol\": \"৳\", \"primary_currency\": \"BDT\", \"secondary_amount\": 250, \"secondary_currency\": \"KWD\"}', '2026-03-26 16:39:44', '2026-03-26 16:39:44', 5, 23, 'completed', '0.00', NULL);

-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BDT',
  `secondary_currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KWD',
  `primary_symbol` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '৳',
  `secondary_symbol` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'د.ك',
  `exchange_rate` decimal(10,4) NOT NULL DEFAULT '1.0000',
  `appearance_mode` enum('light','dark','system') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `theme` enum('neutral','violet','blue','green','orange','red') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'neutral',
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UTC',
  `locale` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `date_format` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Y-m-d',
  `time_format` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'H:i',
  `exchange_rate_api_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchange_rate_api_provider` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'exchangerate-api.com',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `permissions` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires_at` timestamp NULL DEFAULT NULL,
  `force_password_change` tinyint(1) NOT NULL DEFAULT '0',
  `enable_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `enable_activity_logging` tinyint(1) NOT NULL DEFAULT '1',
  `enable_backup` tinyint(1) NOT NULL DEFAULT '1',
  `enable_social_login` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `users`
INSERT INTO `users` VALUES
(1, 'Super Admin', 'admin@cashmanagement.com', NULL, 'BDT', 'KWD', '৳', 'د.ك', '1.0000', 'system', 'neutral', 'UTC', 'en', 'Y-m-d', 'H:i', NULL, 'exchangerate-api.com', '2026-03-13 18:19:02', 'super_admin', '[\"manage_users\", \"manage_admins\", \"view_analytics\", \"manage_transactions\", \"manage_categories\", \"manage_settings\", \"view_all_transactions\", \"view_all_user_data\", \"access_ledger\", \"manage_system_settings\", \"view_system_logs\", \"export_data\", \"perform_bulk_operations\", \"manage_exchange_rates\", \"manage_currencies\", \"manage_appearance\", \"view_activity_logs\", \"manage_notifications\", \"system_audit\", \"full_system_access\"]', 1, '2026-03-13 18:19:02', '$2y$12$8UFmzLreNy2IIpsdIiG8gOYqfM5mAJt5n371pEePYVj7Lvyel7JHG', NULL, NULL, NULL, 0, 1, 1, 1, 0, '2026-03-13 18:19:03', '2026-03-13 18:19:03'),
(2, 'Mohammad Abdul Abdul Mannan', 'mdmannan580@gmail.com', NULL, 'BDT', 'KWD', '৳', 'د.ك', '1.0000', 'system', 'neutral', 'UTC', 'en', 'Y-m-d', 'H:i', NULL, 'exchangerate-api.com', NULL, 'admin', '[]', 1, NULL, '$2y$12$PTAkjho/VsaSr7JDKgn5WOrQa3EiayQcsBNjiWO4fgJ3ghA3gctdu', NULL, NULL, NULL, 0, 1, 1, 1, 0, '2026-03-13 18:19:17', '2026-03-17 06:44:19');

