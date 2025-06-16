create view public.v_semua_kerjasama as
select
  k.kerjasama_id,
  k.no_dokumen,
  k.bidang_kerjasama,
  k.judul_kerjasama,
  k.tanggal_mulai,
  k.tanggal_berakhir,
  k.status,
  k.catatan,
  k.jumlah_pihak,
  k.output_kerjasama,
  k.tgl_input,
  k.tgl_lapor,
  k.status_lapor,
  k.tahun,
  k.pelaksana,
  m.nama_mitra,
  n.nama_negara,
  j.nama_jenis as jenis_dokumen,
  pj_upi.nama as nama_pj_upi,
  pj_mitra.nama as nama_pj_mitra,
  penandatangan_upi.nama as nama_penandatangan_upi,
  penandatangan_mitra.nama as nama_penandatangan_mitra
from
  kerjasama k
  join mitra m on k.mitra_id = m.mitra_id
  join negara n on m.negara_id = n.negara_id
  join jenis_dokumen j on k.jenis_dok_id = j.jenis_dok_id
  left join personel pj_upi on k.pj_upi = pj_upi.personel_id
  left join personel pj_mitra on k.pj_mitra = pj_mitra.personel_id
  left join personel penandatangan_upi on k.penandatangan_upi = penandatangan_upi.personel_id
  left join personel penandatangan_mitra on k.penandatangan_mitra = penandatangan_mitra.personel_id;

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


create table public.personel (
  personel_id serial not null,
  nama character varying(255) not null,
  email character varying(100) null,
  kontak character varying(50) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  jabatan_id integer null,
  pihak public.pihak not null,
  constraint personel_pkey primary key (personel_id),
  constraint personel_jabatan_id_fkey foreign KEY (jabatan_id) references jabatan (jabatan_id)
) TABLESPACE pg_default;

create trigger update_personel_modtime BEFORE
update on personel for EACH row
execute FUNCTION update_modified_column ();


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
