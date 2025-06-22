import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockOctokit;
const OctokitMock = vi.fn(() => mockOctokit);
vi.mock('@octokit/rest', () => ({ Octokit: OctokitMock }));

import { GitHubService } from '@/services/GitHubService';

describe('GitHubService', () => {
  beforeEach(() => {
    mockOctokit = {
      users: { getAuthenticated: vi.fn() },
      repos: {
        getContent: vi.fn(),
        createOrUpdateFileContents: vi.fn()
      }
    };
  });

  it('authenticate stores user', async () => {
    const user = { login: 'test' };
    mockOctokit.users.getAuthenticated.mockResolvedValue({ data: user });
    const service = new GitHubService();
    const result = await service.authenticate('t');
    expect(result).toEqual(user);
    expect(service.user).toEqual(user);
    expect(OctokitMock).toHaveBeenCalledWith({ auth: 't' });
  });

  it('createOrUpdateFile creates new file when missing', async () => {
    mockOctokit.repos.getContent.mockRejectedValue({ status: 404 });
    const service = new GitHubService();
    service.user = { login: 'me' };
    service.octokit = mockOctokit;

    await service.createOrUpdateFile('repo', 'file.js', 'code', 'msg');

    const args = mockOctokit.repos.createOrUpdateFileContents.mock.calls[0][0];
    expect(args.owner).toBe('me');
    expect(args.repo).toBe('repo');
    expect(args.path).toBe('file.js');
    expect(args.message).toBe('msg');
    expect(args.content).toBe(Buffer.from('code').toString('base64'));
    expect(args).not.toHaveProperty('sha');
  });

  it('createOrUpdateFile updates existing file', async () => {
    mockOctokit.repos.getContent.mockResolvedValue({ data: { sha: 'abc' } });
    const service = new GitHubService();
    service.user = { login: 'me' };
    service.octokit = mockOctokit;

    await service.createOrUpdateFile('repo', 'file.js', 'code', 'msg');

    const args = mockOctokit.repos.createOrUpdateFileContents.mock.calls[0][0];
    expect(args.sha).toBe('abc');
  });

  it('updateProgressReadme appends entry and saves', async () => {
    const existing = 'Start\n';
    mockOctokit.repos.getContent.mockResolvedValue({
      data: { content: Buffer.from(existing).toString('base64'), encoding: 'base64' }
    });
    const service = new GitHubService();
    service.user = { login: 'me' };
    service.octokit = mockOctokit;
    const spy = vi.spyOn(service, 'createOrUpdateFile').mockResolvedValue();

    await service.updateProgressReadme('repo', 'lesson1', { title: 'Title' });

    expect(mockOctokit.repos.getContent).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      'repo',
      'README.md',
      'Start\n- lesson1: Title\n',
      'Mise à jour progression'
    );
  });
});
