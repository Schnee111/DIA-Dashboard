CREATE TABLE `mitras` (
	`id` varchar(128) NOT NULL,
	`nama` varchar(255) NOT NULL,
	`kategori` varchar(255) NOT NULL,
	`tanggal_mulai` datetime NOT NULL,
	`tanggal_akhir` datetime NOT NULL,
	`status` varchar(50) NOT NULL,
	`alamat` varchar(255),
	`kontak` varchar(50),
	`email` varchar(255),
	`website` varchar(255),
	`deskripsi` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mitras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `name_idx` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` varchar(128) NOT NULL,
	`role_id` varchar(128) NOT NULL,
	`permission_id` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `role_permission_idx` UNIQUE(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `name_idx` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `surats` (
	`id` varchar(128) NOT NULL,
	`jenis_surat` varchar(100) NOT NULL,
	`judul` varchar(255) NOT NULL,
	`tujuan` varchar(255) NOT NULL,
	`perihal` varchar(255) NOT NULL,
	`isi` text NOT NULL,
	`lampiran` varchar(255),
	`status` varchar(50) NOT NULL DEFAULT 'Menunggu',
	`user_id` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `surats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`role_id` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_role_idx` UNIQUE(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`profile_picture` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`),
	CONSTRAINT `username_idx` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE INDEX `role_id_idx` ON `role_permissions` (`role_id`);--> statement-breakpoint
CREATE INDEX `permission_id_idx` ON `role_permissions` (`permission_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_roles` (`user_id`);--> statement-breakpoint
CREATE INDEX `role_id_idx` ON `user_roles` (`role_id`);