import { Comment, Issue } from './types';

export const comment: Comment = {
    author_name: 'author_name',
    author_user: 'author_user',
    author_uuid: 'author_uuid',
    author_email: 'author_emai',
    backend_id: 'backend_id',
    created: 'created',
    description: 'description',
    is_public: true,
    issue: 'issue',
    issue_key: 'issue_key',
    url: 'url',
    uuid: 'uuid',
};

export const issue: Issue = {
    url: 'https://example.com/en-US/docs/Web/CSS/pointer-events',
};

export const users = {
    staff: {
        uuid: 'author_uuid_staff',
        is_staff: true,
    },
    same: {
        uuid: comment.author_uuid,
        is_staff: false,
    },
    different: {
        uuid: 'author_uuid_different',
        is_staff: false,
    },
};
