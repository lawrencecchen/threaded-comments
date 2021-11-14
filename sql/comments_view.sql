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
    union
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
