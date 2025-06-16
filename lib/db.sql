create view public.v_kerjasama_akan_berakhir as
select
  k.kerjasama_id,
  k.judul_kerjasama,
  m.nama_mitra,
  n.nama_negara,
  k.tanggal_berakhir,
  k.tanggal_berakhir - CURRENT_DATE as sisa_hari
from
  kerjasama k
  join mitra m on k.mitra_id = m.mitra_id
  join negara n on m.negara_id = n.negara_id
where
  k.status::text = 'Aktif'::text
  and k.tanggal_berakhir >= CURRENT_DATE
  and k.tanggal_berakhir <= (CURRENT_DATE + '6 mons'::interval)
order by
  k.tanggal_berakhir;



create view public.v_kerjasama_aktif as
select
  k.kerjasama_id,
  k.judul_kerjasama,
  m.nama_mitra,
  n.nama_negara,
  j.nama_jenis as jenis_dokumen,
  k.bidang_kerjasama,
  k.tanggal_mulai,
  k.tanggal_berakhir,
  k.status,
  k.pelaksana
from
  kerjasama k
  join mitra m on k.mitra_id = m.mitra_id
  join negara n on m.negara_id = n.negara_id
  join jenis_dokumen j on k.jenis_dok_id = j.jenis_dok_id
where
  k.status::text = 'Aktif'::text;

create view public.v_semua_kerjasama as
select
  k.kerjasama_id,
  k.judul_kerjasama,
  m.nama_mitra,
  n.nama_negara,
  j.nama_jenis as jenis_dokumen,
  k.bidang_kerjasama,
  k.tanggal_mulai,
  k.tanggal_berakhir,
  k.status,
  k.pelaksana
from
  kerjasama k
  join mitra m on k.mitra_id = m.mitra_id
  join negara n on m.negara_id = n.negara_id
  join jenis_dokumen j on k.jenis_dok_id = j.jenis_dok_id;

create view public.v_semua_mitra as
select
  m.mitra_id,
  m.nama_mitra,
  n.nama_negara,
  m.alamat,
  jp.nama_jenis as jenis_partner_nama
from
  mitra m
  join negara n on m.negara_id = n.negara_id
  join jenis_partner jp on m.jenis_partner_id = jp.jenis_partner_id;

create view public.v_statistik_negara as
select
  n.nama_negara,
  count(k.kerjasama_id) as jumlah_kerjasama,
  count(
    case
      when k.status::text = 'Aktif'::text then 1
      else null::integer
    end
  ) as kerjasama_aktif,
  count(
    case
      when k.status::text <> 'Aktif'::text then 1
      else null::integer
    end
  ) as kerjasama_nonaktif
from
  negara n
  left join mitra m on n.negara_id = m.negara_id
  left join kerjasama k on m.mitra_id = k.mitra_id
group by
  n.nama_negara
order by
  (count(k.kerjasama_id)) desc;


create table public.permissions (
  id character varying(128) not null,
  name character varying(255) not null,
  description character varying(255) null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint permissions_pkey primary key (id),
  constraint permissions_name_key unique (name)
) TABLESPACE pg_default;

create trigger update_permissions_timestamp BEFORE
update on permissions for EACH row
execute FUNCTION update_timestamp ();


create table public.role_permissions (
  id character varying(128) not null,
  role_id character varying(128) not null,
  permission_id character varying(128) not null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint role_permissions_pkey primary key (id),
  constraint role_permissions_role_id_permission_id_key unique (role_id, permission_id),
  constraint fk_role_permissions_permission_id foreign KEY (permission_id) references permissions (id) on delete CASCADE,
  constraint fk_role_permissions_role_id foreign KEY (role_id) references roles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists permission_id_idx on public.role_permissions using btree (permission_id) TABLESPACE pg_default;

create index IF not exists role_id_idx on public.role_permissions using btree (role_id) TABLESPACE pg_default;

create trigger update_role_permissions_timestamp BEFORE
update on role_permissions for EACH row
execute FUNCTION update_timestamp ();

create table public.users (
  id character varying(128) not null,
  name character varying(255) not null,
  email character varying(255) not null,
  username character varying(255) not null,
  password character varying(255) not null,
  profile_picture character varying(255) null,
  is_active boolean not null default true,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;

create trigger update_users_timestamp BEFORE
update on users for EACH row
execute FUNCTION update_timestamp ();


create table public.user_roles (
  id character varying(128) not null,
  user_id character varying(128) not null,
  role_id character varying(128) not null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint user_roles_pkey primary key (id),
  constraint user_roles_user_id_role_id_key unique (user_id, role_id),
  constraint fk_user_roles_role_id foreign KEY (role_id) references roles (id) on delete CASCADE,
  constraint fk_user_roles_user_id foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists role_id_idx_ur on public.user_roles using btree (role_id) TABLESPACE pg_default;

create index IF not exists user_id_idx on public.user_roles using btree (user_id) TABLESPACE pg_default;

create trigger update_user_roles_timestamp BEFORE
update on user_roles for EACH row
execute FUNCTION update_timestamp ();
