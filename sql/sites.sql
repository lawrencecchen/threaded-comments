create table sites (
  id bigserial not null primary key,
  "siteDomain" text not null unique,
  "ownerId" uuid references public.users not null,
  name text not null
)
