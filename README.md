# Reddit styled threaded comments

## Demo

https://debussy.vercel.app



https://user-images.githubusercontent.com/54008264/116842442-7109b000-ab91-11eb-93d5-570f20f139bd.mov




## Features

- 🧵 Threaded comments (nesting!!)
- 🗳 Voting
- 🥇 Sorting
- 📑 Pagination
- 🌒 Dark mode

## Instant Deploy

The Vercel deployment will guide you through creating a Supabase account and project. After you install the Supabase integration, all relevant environment variables will be set up so that the project is immediately live 🚀.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Flawrencecchen%2Fthreaded-comments&demo-title=Threaded%20Comments%20Demo&demo-description=Threaded%20comments%20built%20with%20Supabase%20and%20Next.js&demo-url=https%3A%2F%2Fdebussy.vercel.app%2F&integration-ids=oac_jUduyjQgOyzev1fjrW83NYOv&external-id=threaded-comments)

## Getting started

### 1. Populate `.env`
```
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 2. Run [setup.sql](sql/setup.sql)

<details><summary>Expand for setup.sql</summary>

```sql
-- Create a table for Public Profiles
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  primary key (id),
  unique (username),
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to sync profiles and auth.users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create a table for posts
create table posts (
    id bigserial not null,
    slug text not null unique,
    "createdAt" timestamp with time zone default now() not null,
    "updatedAt" timestamp with time zone default now() null,
    title text null,
    content text null,
    "isPublished" boolean default false not null,
    "authorId" uuid not null references profiles (id),
    "parentId" bigint null references posts (id),
    live boolean default true null,
    "siteId" bigint default '1' ::bigint not null,
    "isPinned" boolean default false not null,
    "isDeleted" boolean default false not null,
    "isApproved" boolean default false not null,

    primary key (id),
    unique (slug)
);

alter table posts enable row level security;

-- Create root user and initial post. Triggers update in profiles.
insert into auth.users (id) values ('00000000-0000-0000-0000-000000000000'::uuid);

update profiles
set
    full_name = 'Admin',
    avatar_url = 'https://assets3.thrillist.com/v1/image/1875552/414x310/crop;jpeg_quality=65.jpg'
where
    id = '00000000-0000-0000-0000-000000000000'::uuid;

insert into posts (slug, title, content, "authorId") values ('root', 'Root post', 'root post', '00000000-0000-0000-0000-000000000000'::uuid);
insert into posts (slug, title, content, "authorId", "parentId") values ('threaded-comments-123', 'threaded-comments', 'Threaded comments, built on top of Supabase and Next.js. Visit GitHub to deploy your own: https://github.com/lawrencecchen/threaded-comments', '00000000-0000-0000-0000-000000000000'::uuid, 1);

create policy "Posts are viewable by everyone."
    on posts for select
    using ( true );

create policy "Users can post as themselves."
    on posts for insert
    with check ( auth.uid() = "authorId" );

-- Create a table for sites
create table sites (
    id bigserial not null,
    "siteDomain" text not null,
    "ownerId" uuid not null,
    "name" text not null,

    primary key (id)
);

alter table sites enable row level security;

create policy "Sites are viewable by everyone."
    on sites for select
    using ( true );

create policy "Users can create their own sites."
    on sites for insert
    with check ( auth.uid() = "ownerId" );

-- Create a table for votes
create table votes (
    "postId" bigint not null references posts (id),
    "userId" uuid not null references profiles (id),
    "value" int not null,

    primary key ("postId", "userId"),
    constraint vote_quantity check (value <= 1 and value >= -1)
);

alter table votes enable row level security;

create policy "Votes are viewable by everyone"
    on votes for select
    using ( true );

create policy "Users can vote as themselves"
    on votes for insert
    with check (auth.uid() = "userId");

create policy "Users can update their own votes"
    on votes for update
    using ( auth.uid() = "userId" );


-- Set up Realtime!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table posts, sites, votes, profiles;

-- Set up Storage!
insert into storage.buckets (id, name)
values ('avatars', 'avatars');

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

drop view if exists comments_thread_with_user_vote;
drop view if exists comments_thread;
drop view if exists comments_with_author_votes;
drop view if exists comments_linear_view;
drop view if exists comment_with_author;

create view comment_with_author as
    select
        p.id,
        p.slug,
        p."createdAt",
        p."updatedAt",
        p.title,
        p.content,
        p."isPublished",
        p."authorId",
        p."parentId",
        p.live,
        p."siteId",
        p."isPinned",
        p."isDeleted",
        p."isApproved",
        to_jsonb(u) as author
    from
        posts p
        inner join profiles u on p."authorId" = u.id;

create view comments_linear_view as
    select
        root_c.*,
        to_jsonb(parent_c) as parent,
        coalesce(json_agg(children_c) filter (where children_c.id is not null), '[]') as responses
    from
        comment_with_author root_c
        inner join comment_with_author parent_c on root_c."parentId" = parent_c.id
        inner join sites s1 on s1.id = root_c."siteId"
        left join comment_with_author children_c on children_c."parentId" = root_c.id
    group by
        root_c.id,
        root_c.slug,
        root_c."createdAt",
        root_c."updatedAt",
        root_c.title,
        root_c.content,
        root_c."isPublished",
        root_c."authorId",
        root_c."parentId",
        root_c.live,
        root_c."siteId",
        root_c."isPinned",
        root_c."isDeleted",
        root_c."isApproved",
        root_c.author,
        parent_c.*;

create or replace view comments_with_author_votes as
    select
        p.id,
        p.slug,
        p."createdAt",
        p."updatedAt",
        p.title,
        p.content,
        p."isPublished",
        p."authorId",
        p."parentId",
        p.live,
        p."siteId",
        p."isPinned",
        p."isDeleted",
        p."isApproved",
        p."author",
        coalesce (
            sum (v.value) over w,
            0
        ) as "votes",
        sum (case when v.value > 0 then 1 else 0 end) over w as "upvotes",
        sum (case when v.value < 0 then 1 else 0 end) over w as "downvotes"
        -- (select case when auth.uid() = v."userId" then v.value else 0 end) as "userVoteValue"
    from
        comment_with_author p
        left join votes v on p.id = v."postId"
    window w as (
        partition by v."postId"
    );

create recursive view comments_thread (
    id,
    slug,
    "createdAt",
    "updatedAt",
    title,
    content,
    "isPublished",
    "authorId",
    "parentId",
    live,
    "siteId",
    "isPinned",
    "isDeleted",
    "isApproved",
    "author",
    "votes",
    "upvotes",
    "downvotes",
    "depth",
    "path",
    "pathVotesRecent",
    "pathLeastRecent",
    "pathMostRecent"
) as
    select
        id,
        slug,
        "createdAt",
        "updatedAt",
        title,
        content,
        "isPublished",
        "authorId",
        "parentId",
        live,
        "siteId",
        "isPinned",
        "isDeleted",
        "isApproved",
        "author",
        "votes",
        "upvotes",
        "downvotes",
        0 as depth,
        array[id] as "path",
        array[id] as "pathVotesRecent",
        array[id] as "pathLeastRecent",
        array[id] as "pathMostRecent"
    from
        comments_with_author_votes
    where
        "parentId" is null
    union all
    select
        p1.id,
        p1.slug,
        p1."createdAt",
        p1."updatedAt",
        p1.title,
        p1.content,
        p1."isPublished",
        p1."authorId",
        p1."parentId",
        p1.live,
        p1."siteId",
        p1."isPinned",
        p1."isDeleted",
        p1."isApproved",
        p1."author",
        p1."votes",
        p1."upvotes",
        p1."downvotes",
        p2.depth + 1 as depth,
        p2."path" || p1.id::bigint as "path",
        p2."pathVotesRecent" || -p1."votes"::bigint || -extract(epoch from p1."createdAt")::bigint || p1.id as "pathVotesRecent",
        p2."pathLeastRecent" || extract(epoch from p1."createdAt")::bigint || p1.id as "pathLeastRecent",
        p2."pathMostRecent" || -extract(epoch from p1."createdAt")::bigint || p1.id as "pathMostRecent"
    from
        comments_with_author_votes p1
        join comments_thread p2 on p1."parentId" = p2.id;

create or replace view comments_thread_with_user_vote as
    select distinct on (id)
        id,
        slug,
        "createdAt",
        "updatedAt",
        title,
        content,
        "isPublished",
        "authorId",
        "parentId",
        live,
        "siteId",
        "isPinned",
        "isDeleted",
        "isApproved",
        "author",
        "votes",
        "upvotes",
        "downvotes",
        "depth",
        "path",
        "pathVotesRecent",
        "pathLeastRecent",
        "pathMostRecent",
        coalesce(
            (
                select
                    v."value"
                from
                    votes v
                where
                    auth.uid() = v."userId" and v."postId" = id
            ),
            0
        ) as "userVoteValue"
    from comments_thread

```
</details>

### 3. Run the application

`npm run dev` or `pnpm dev` or `yarn dev`

## Future improvements
- Add indexes

## License
[MIT](LICENSE)
